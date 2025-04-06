import { useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

interface StyleData {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  titleColor?: string;
  h3TitleColor?: string;
  textColor?: string;
  backgroundFromColor?: string;
  backgroundToColor?: string;
  sectionBgColor?: string;
}

export const useGlobalStyles = () => {
  useEffect(() => {
    if (!db) {
      console.error("useGlobalStyles: Firestore not initialized correctly.");
      return;
    }
    const stylesDocRef = doc(db, 'settings', 'styles');
    // console.log("useGlobalStyles: Setting up real-time listener for global styles..."); // Removed log

    const unsubscribe = onSnapshot(stylesDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as StyleData;
        // console.log('useGlobalStyles: Received style update from Firestore:', data); // Removed log
        // Apply styles as CSS variables to the root element
        document.documentElement.style.setProperty('--primary-color', data.primaryColor);
        document.documentElement.style.setProperty('--secondary-color', data.secondaryColor);
        document.documentElement.style.setProperty('--font-family', data.fontFamily);
        document.documentElement.style.setProperty('--title-color', data.titleColor || '#d7e3ee'); // Default fallback
        document.documentElement.style.setProperty('--h3title-color', data.h3TitleColor || '#d7e3ee'); // Default fallback
        document.documentElement.style.setProperty('--text-color', data.textColor || '#c6d3e2'); // Default fallback
        document.documentElement.style.setProperty('--background-from-color', data.backgroundFromColor || '#111827'); // Default fallback
        document.documentElement.style.setProperty('--background-to-color', data.backgroundToColor || '#1F2937'); // Default fallback
        document.documentElement.style.setProperty('--section-bg-color', data.sectionBgColor || '#374151'); // Default fallback
      } else {
        // console.log("useGlobalStyles: No global styles document found in Firestore, using CSS defaults."); // Removed log
        // Optionally clear or set default variables if the document is deleted
        // document.documentElement.style.removeProperty('--primary-color'); // Example
      }
    }, (error) => {
      console.error("useGlobalStyles: Error listening to global styles:", error);
    });

    // Cleanup listener on component unmount
    return () => {
      // console.log("useGlobalStyles: Unsubscribing from global styles listener."); // Removed log
      unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs only once on mount
};