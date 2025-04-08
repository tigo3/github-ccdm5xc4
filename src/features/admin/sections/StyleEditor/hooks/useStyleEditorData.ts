import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import chroma from 'chroma-js';
import { db } from '../../../../../config/firebaseConfig'; // Corrected path
import { useNotifications } from '../../../../../contexts/NotificationContext'; // Corrected path
import { StyleData, SavedTheme, ThemeData } from '../types/styleEditorTypes'; // Corrected path

// Default styles constant, kept close to the hook using it
const defaultStyles: StyleData = {
  primaryColor: '#377dc8',
  secondaryColor: '#0f3257',
  fontFamily: "'Noto Sans', sans-serif",
  titleColor: '#d7e3ee',
  h3TitleColor: '#d7e3ee',
  textColor: '#c6d3e2',
  backgroundFromColor: '#111827',
  backgroundToColor: '#1F2937',
  sectionBgColor: '#374151',
};

export const useStyleEditorData = () => {
  // --- State ---
  const [primaryColor, setPrimaryColor] = useState(defaultStyles.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(defaultStyles.secondaryColor);
  const [fontFamily, setFontFamily] = useState(defaultStyles.fontFamily);
  const [titleColor, setTitleColor] = useState(defaultStyles.titleColor ?? '#ffffff');
  const [h3TitleColor, setH3TitleColor] = useState(defaultStyles.h3TitleColor ?? '#d7e3ee');
  const [textColor, setTextColor] = useState(defaultStyles.textColor ?? '#c6d3e2');
  const [backgroundFromColor, setBackgroundFromColor] = useState(defaultStyles.backgroundFromColor ?? '#111827');
  const [backgroundToColor, setBackgroundToColor] = useState(defaultStyles.backgroundToColor ?? '#1F2937');
  const [sectionBgColor, setSectionBgColor] = useState(defaultStyles.sectionBgColor ?? '#374151');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [aiMode, setAiMode] = useState(0); // Used for cycling AI generation modes
  const [savedThemes, setSavedThemes] = useState<SavedTheme[]>([]);
  const [newThemeName, setNewThemeName] = useState('');
  const [isLoadingThemes, setIsLoadingThemes] = useState(true);

  // --- Context ---
  const { showToast, requestConfirmation } = useNotifications();

  // --- Helper Functions ---
  const validateColors = useCallback((colors: Record<string, string | undefined>): Record<string, string> => {
    const validated: Record<string, string> = {};
    Object.entries(colors).forEach(([key, value]) => {
      // Ensure value is a string before matching
      const strValue = typeof value === 'string' ? value : '';
      validated[key] = strValue.match(/^#[0-9A-F]{6}$/i)
        ? strValue
        : defaultStyles[key as keyof StyleData] || '#000000'; // Fallback to default or black
    });
    return validated;
  }, []); // No dependencies as defaultStyles is constant

  const applyStyles = useCallback(() => {
    const root = document.documentElement;
    const validatedStyles = validateColors({
      primaryColor,
      secondaryColor,
      titleColor,
      h3TitleColor,
      textColor,
      backgroundFromColor,
      backgroundToColor,
      sectionBgColor
    });

    Object.entries(validatedStyles).forEach(([key, value]) => {
      root.style.setProperty(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
    });
    root.style.setProperty('--font-family', fontFamily);
  }, [
      primaryColor, secondaryColor, titleColor, h3TitleColor, textColor,
      backgroundFromColor, backgroundToColor, sectionBgColor, fontFamily, validateColors
  ]);

  const loadInitialData = useCallback(async () => {
    if (!db) {
      console.error("Firestore not available");
      showToast("Error: Firestore connection lost.", 'error');
      setIsLoading(false);
      setIsLoadingThemes(false);
      return;
    }

    setIsLoading(true);
    setIsLoadingThemes(true);

    try {
      // Load current styles
      const stylesDoc = await getDoc(doc(db, 'settings', 'styles'));
      if (stylesDoc.exists()) {
        const data = stylesDoc.data() as StyleData;
        setPrimaryColor(data.primaryColor || defaultStyles.primaryColor);
        setSecondaryColor(data.secondaryColor || defaultStyles.secondaryColor);
        setFontFamily(data.fontFamily || defaultStyles.fontFamily);
        setTitleColor(data.titleColor || defaultStyles.titleColor || '#ffffff');
        setH3TitleColor(data.h3TitleColor || defaultStyles.h3TitleColor || '#d7e3ee');
        setTextColor(data.textColor || defaultStyles.textColor || '#c6d3e2');
        setBackgroundFromColor(data.backgroundFromColor || defaultStyles.backgroundFromColor || '#111827');
        setBackgroundToColor(data.backgroundToColor || defaultStyles.backgroundToColor || '#1F2937');
        setSectionBgColor(data.sectionBgColor || defaultStyles.sectionBgColor || '#374151');
      } else {
        // Apply default styles if no saved styles exist
        setPrimaryColor(defaultStyles.primaryColor);
        setSecondaryColor(defaultStyles.secondaryColor);
        setFontFamily(defaultStyles.fontFamily);
        setTitleColor(defaultStyles.titleColor ?? '#ffffff');
        setH3TitleColor(defaultStyles.h3TitleColor ?? '#d7e3ee');
        setTextColor(defaultStyles.textColor ?? '#c6d3e2');
        setBackgroundFromColor(defaultStyles.backgroundFromColor ?? '#111827');
        setBackgroundToColor(defaultStyles.backgroundToColor ?? '#1F2937');
        setSectionBgColor(defaultStyles.sectionBgColor ?? '#374151');
      }

      // Load saved themes
      const themesSnapshot = await getDocs(collection(db, 'themes'));
      const themes = themesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SavedTheme));
      setSavedThemes(themes);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Failed to load styles or themes. Check console.', 'error');
    } finally {
      setIsLoading(false);
      setIsLoadingThemes(false);
    }
  }, [showToast]); // Added showToast dependency

  const handleSaveStyles = useCallback(async () => {
    if (!db) {
      showToast("Error: Firestore connection lost.", 'error');
      return;
    }

    setIsSaving(true);
    try {
      const styleData: StyleData = {
        primaryColor,
        secondaryColor,
        fontFamily,
        titleColor,
        h3TitleColor,
        textColor,
        backgroundFromColor,
        backgroundToColor,
        sectionBgColor
      };

      await setDoc(doc(db, 'settings', 'styles'), styleData);
      showToast('Styles saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving styles:', error);
      showToast('Failed to save styles. Check console.', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [db, showToast, primaryColor, secondaryColor, fontFamily, titleColor, h3TitleColor, textColor, backgroundFromColor, backgroundToColor, sectionBgColor]);

  const handleSaveTheme = useCallback(async () => {
    if (!db) {
      showToast("Error: Firestore connection lost.", 'error');
      return;
    }
    if (!newThemeName.trim()) {
      showToast("Please enter a name for the theme.", 'error');
      return;
    }

    setIsSaving(true);
    try {
      const themeStyleData: StyleData = {
        primaryColor,
        secondaryColor,
        fontFamily,
        titleColor,
        h3TitleColor,
        textColor,
        backgroundFromColor,
        backgroundToColor,
        sectionBgColor
      };
      const themeData = {
        name: newThemeName.trim(),
        style: themeStyleData
      };

      const docRef = await addDoc(collection(db, 'themes'), themeData);
      setSavedThemes(prev => [...prev, { id: docRef.id, ...themeData }]);
      setNewThemeName('');
      showToast('Theme saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving theme:', error);
      showToast('Failed to save theme. Check console.', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [db, showToast, newThemeName, primaryColor, secondaryColor, fontFamily, titleColor, h3TitleColor, textColor, backgroundFromColor, backgroundToColor, sectionBgColor]);

  const handleDeleteTheme = useCallback(async (themeId: string) => {
    const themeToDelete = savedThemes.find(t => t.id === themeId);
    if (!db || !themeToDelete) return;

    requestConfirmation({
      message: `Are you sure you want to delete the theme "${themeToDelete.name}"?`,
      onConfirm: async () => {
        if (!db) {
          showToast('Error: Firestore connection lost.', 'error');
          return;
        }
        try {
          await deleteDoc(doc(db, 'themes', themeId));
          setSavedThemes(prev => prev.filter(theme => theme.id !== themeId));
          showToast('Theme deleted successfully!', 'success');
        } catch (error) {
          console.error('Error deleting theme:', error);
          showToast('Failed to delete theme. Check console.', 'error');
        }
      },
      confirmText: 'Delete Theme',
      title: 'Confirm Deletion'
    });
  }, [db, requestConfirmation, showToast, savedThemes]);

  const handleApplyTheme = useCallback((theme: SavedTheme) => {
    const { style } = theme;
    setPrimaryColor(style.primaryColor);
    setSecondaryColor(style.secondaryColor);
    setFontFamily(style.fontFamily);
    setTitleColor(style.titleColor || defaultStyles.titleColor || '#ffffff');
    setH3TitleColor(style.h3TitleColor || defaultStyles.h3TitleColor || '#d7e3ee');
    setTextColor(style.textColor || defaultStyles.textColor || '#c6d3e2');
    setBackgroundFromColor(style.backgroundFromColor || defaultStyles.backgroundFromColor || '#111827');
    setBackgroundToColor(style.backgroundToColor || defaultStyles.backgroundToColor || '#1F2937');
    setSectionBgColor(style.sectionBgColor || defaultStyles.sectionBgColor || '#374151');
    showToast(`Theme "${theme.name}" applied!`, 'success');
  }, [showToast]); // Added showToast dependency

  const handleGenerateAIColors = useCallback(() => {
    try {
      const baseColor = chroma.valid(primaryColor) ? chroma(primaryColor) : chroma(defaultStyles.primaryColor);
      const currentMode = aiMode % 3;

      let secondaryColorHex: string;
      switch (currentMode) {
        case 1: secondaryColorHex = baseColor.set('hsl.h', '+30').hex(); break;
        case 2: secondaryColorHex = baseColor.set('hsl.h', '+120').hex(); break;
        default: secondaryColorHex = baseColor.set('hsl.h', '+180').hex(); break;
      }
      setSecondaryColor(secondaryColorHex);

      const bgLuminance = chroma.mix(backgroundFromColor, backgroundToColor).luminance();
      const primaryContrast = chroma.contrast(primaryColor, bgLuminance > 0.5 ? '#000000' : '#ffffff');
      const secondaryContrast = chroma.contrast(secondaryColorHex, bgLuminance > 0.5 ? '#000000' : '#ffffff');

      setTitleColor(primaryContrast > 4.5 ? primaryColor : (bgLuminance > 0.5 ? '#333333' : '#eeeeee'));
      setH3TitleColor(secondaryContrast > 3 ? secondaryColorHex : (bgLuminance > 0.5 ? '#555555' : '#cccccc'));
      setTextColor(bgLuminance > 0.5 ? '#666666' : '#bbbbbb');

      setBackgroundFromColor(baseColor.darken(2.2).desaturate(0.5).hex());
      setBackgroundToColor(baseColor.darken(1.8).desaturate(0.3).hex());
      setSectionBgColor(baseColor.darken(1.5).desaturate(0.4).hex());

      setAiMode(prev => prev + 1);
      showToast(`AI colors generated (Mode ${currentMode + 1})!`, 'success');
    } catch (error) {
      console.error('Error generating AI colors:', error);
      showToast('Failed to generate colors. Check console.', 'error');
    }
  }, [aiMode, primaryColor, backgroundFromColor, backgroundToColor, showToast]);

  const handleGlobalThemeSelect = useCallback((themeData: ThemeData) => {
    setPrimaryColor(themeData.primaryColor);
    setSecondaryColor(themeData.secondaryColor);
    setTitleColor(themeData.titleColor);
    setH3TitleColor(themeData.h3TitleColor);
    setTextColor(themeData.textColor);
    setBackgroundFromColor(themeData.backgroundFromColor);
    setBackgroundToColor(themeData.backgroundToColor);
    setSectionBgColor(themeData.sectionBgColor);
    // Potentially set font family if added to ThemeData
    // if (themeData.fontFamily) setFontFamily(themeData.fontFamily);
  }, []); // No dependencies needed if it just sets state

  // --- Effects ---
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]); // Depend on the memoized load function

  useEffect(() => {
    if (!isLoading) {
      applyStyles();
    }
  }, [isLoading, applyStyles]); // Depend on the memoized apply function

  // --- Return Values ---
  return {
    // State values
    primaryColor, setPrimaryColor,
    secondaryColor, setSecondaryColor,
    fontFamily, setFontFamily,
    titleColor, setTitleColor,
    h3TitleColor, setH3TitleColor,
    textColor, setTextColor,
    backgroundFromColor, setBackgroundFromColor,
    backgroundToColor, setBackgroundToColor,
    sectionBgColor, setSectionBgColor,
    isLoading,
    isSaving,
    aiMode, // Pass aiMode if needed externally, otherwise keep internal
    savedThemes,
    newThemeName, setNewThemeName,
    isLoadingThemes,

    // Handlers & Functions
    handleSaveStyles,
    handleSaveTheme,
    handleDeleteTheme,
    handleApplyTheme,
    handleGenerateAIColors,
    handleGlobalThemeSelect, // Keep if ThemeSwitcher is used
    // Removed exportTheme and importTheme
  };
};