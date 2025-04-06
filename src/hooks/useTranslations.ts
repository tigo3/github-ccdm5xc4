import { useState, useEffect, useMemo } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { translations as defaultTranslations } from '../config/translations';

// Define the structure of the translations, mirroring defaultTranslations
type TranslationsType = typeof defaultTranslations;
type LanguageTranslations = TranslationsType['en']; // Assuming 'en' structure is representative

export function useTranslations(language: keyof TranslationsType = 'en') {
  const [translations, setTranslations] = useState<LanguageTranslations>(defaultTranslations[language]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db) {
      console.error("useTranslations: Firestore instance is not available.");
      setError(new Error("Firestore not available"));
      setIsLoading(false);
      setTranslations(defaultTranslations[language]); // Fallback to default
      return;
    }

    // Reset state for potential language changes
    setIsLoading(true);
    setError(null);

    const translationsDocRef = doc(db, 'translations', language);
    // console.log(`useTranslations: Setting up listener for translations/${language}...`); // Removed log

    const unsubscribe = onSnapshot(translationsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<LanguageTranslations>;
        // console.log(`useTranslations: Received translations update for ${language}:`, data); // Removed log
        // Merge Firestore data with defaults to ensure all keys exist
        setTranslations(() => ({
          ...defaultTranslations[language], // Start with defaults
          ...data                     // Override with Firestore data
        }));
      } else {
        // Document doesn't exist, use defaults
        setTranslations(defaultTranslations[language]);
        // console.log(`useTranslations: No translations document found for ${language}, using defaults.`); // Removed log
      }
      setIsLoading(false);
    }, (err) => {
      console.error(`useTranslations: Firestore snapshot error for ${language}:`, err);
      setError(err);
      setTranslations(defaultTranslations[language]); // Fallback to default on error
      setIsLoading(false);
    });

    // Cleanup function
    return () => {
        // console.log(`useTranslations: Unsubscribing from translations/${language} listener.`); // Removed log
        unsubscribe();
    };
  }, [language]); // Re-run effect if language changes

  // Memoize the translations object to prevent unnecessary re-renders
  const t = useMemo(() => translations, [translations]);

  return { t, isLoading, error };
}