import React, { useState, useEffect, useCallback } from 'react'; // Add useCallback
import { doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc } from 'firebase/firestore'; // Add collection, getDocs, addDoc, deleteDoc
import chroma from 'chroma-js'; // Import chroma-js
import { db } from '../../../config/firebaseConfig'; // Import Firestore instance - CORRECTED PATH
import { translations } from '../../../config/translations'; // Import translations object - CORRECTED PATH
import ThemeSwitcher from '../components/ThemeSwitcher'; // Import the ThemeSwitcher component

// Define the structure for theme color data passed from ThemeSwitcher
// (Should match the one defined in ThemeSwitcher.tsx)
interface ThemeData {
  primaryColor: string;
  secondaryColor: string;
  titleColor: string;
  h3TitleColor: string;
  textColor: string;
  backgroundFromColor: string;
  backgroundToColor: string;
  sectionBgColor: string;
}

// Update StyleData interface (used for saving/loading)
interface StyleData {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  titleColor?: string; // Added optional titleColor
  h3TitleColor?: string; // Added optional h3TitleColor
  textColor?: string; // Added optional textColor
  backgroundFromColor?: string; // Added background start color
  backgroundToColor?: string; // Added background end color
  sectionBgColor?: string; // Unified background for content sections
}

// Interface for a saved theme document
interface SavedTheme {
  id: string; // Firestore document ID
  name: string;
  style: StyleData;
}

interface StyleEditorTabProps {
  // Define props needed for the style editor tab, if any
}

// Define default styles based on index.css for consistency
const defaultStyles: StyleData = {
  primaryColor: '#377dc8',
  secondaryColor: '#0f3257',
  fontFamily: "'Noto Sans', sans-serif", // Keep quotes for string literal
  titleColor: '#d7e3ee',
  h3TitleColor: '#d7e3ee',
  textColor: '#c6d3e2',
  backgroundFromColor: '#111827', // Default approx gray-900
  backgroundToColor: '#1F2937', // Default approx gray-800
  // Unified default section background
  sectionBgColor: '#374151', // gray-700
};

const StyleEditorTab: React.FC<StyleEditorTabProps> = () => {
  // State initialized with default values
  const [primaryColor, setPrimaryColor] = useState(defaultStyles.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(defaultStyles.secondaryColor);
  const [fontFamily, setFontFamily] = useState(defaultStyles.fontFamily);
  const [titleColor, setTitleColor] = useState(defaultStyles.titleColor ?? '#ffffff'); // Use nullish coalescing for optional fields
  const [h3TitleColor, setH3TitleColor] = useState(defaultStyles.h3TitleColor ?? '#d7e3ee');
  const [textColor, setTextColor] = useState<string>(defaultStyles.textColor ?? '#c6d3e2');
  // Explicitly type state as string and initialize with guaranteed string default
  const [backgroundFromColor, setBackgroundFromColor] = useState<string>(defaultStyles.backgroundFromColor ?? '#111827');
  const [backgroundToColor, setBackgroundToColor] = useState<string>(defaultStyles.backgroundToColor ?? '#1F2937');
  // Unified state for section background
  const [sectionBgColor, setSectionBgColor] = useState<string>(defaultStyles.sectionBgColor ?? '#374151');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [aiMode, setAiMode] = useState(0); // 0: Complementary, 1: Analogous, 2: Triadic
  const [savedThemes, setSavedThemes] = useState<SavedTheme[]>([]); // State for saved themes
  const [newThemeName, setNewThemeName] = useState(''); // State for new theme name input
  const [isLoadingThemes, setIsLoadingThemes] = useState(true); // Loading state for themes

  // --- Handler for Global Theme Selection ---
  const handleGlobalThemeSelect = (themeData: ThemeData) => {
    console.log("Applying global theme to editor:", themeData);
    // Update the state variables of StyleEditorTab with the selected theme's data
    setPrimaryColor(themeData.primaryColor);
    setSecondaryColor(themeData.secondaryColor);
    setTitleColor(themeData.titleColor);
    setH3TitleColor(themeData.h3TitleColor);
    setTextColor(themeData.textColor);
    setBackgroundFromColor(themeData.backgroundFromColor);
    setBackgroundToColor(themeData.backgroundToColor);
    setSectionBgColor(themeData.sectionBgColor);
    // Note: Font family is not included in ThemeData currently, so it's not updated here.
  };
  // --- End Handler ---

  // --- Optimized Input Change Handlers ---
  const isValidHexColor = (color: string): boolean => /^#[0-9A-F]{6}$/i.test(color);

  // Generic handler for color picker changes
  const handleColorPickerChange = (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
  };

  // Generic handler for color text input changes
  const handleColorTextChange = (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      // Allow empty or '#' for partial input, or valid hex
      if (isValidHexColor(newValue) || newValue === '' || newValue === '#') {
        setter(newValue);
      }
  };

  // Specific handler for Font Family (updated for select dropdown)
  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFontFamily(e.target.value);
  };
  // --- End Optimized Handlers ---

  // Firestore document reference will be created inside useEffect now

  // --- Load Initial Styles and Themes ---
  const loadInitialData = useCallback(async () => {
    if (!db) {
      console.error("Load Data Error: Firestore db instance is not available.");
      setIsLoading(false);
      setIsLoadingThemes(false);
      return;
    }
    setIsLoading(true);
    setIsLoadingThemes(true);

    // Load Current Styles (from settings/styles)
    const stylesDocRef = doc(db, 'settings', 'styles');
    try {
      const docSnap = await getDoc(stylesDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as StyleData;
        setPrimaryColor(data.primaryColor || defaultStyles.primaryColor);
        setSecondaryColor(data.secondaryColor || defaultStyles.secondaryColor);
        setFontFamily(data.fontFamily || defaultStyles.fontFamily);
        setTitleColor(data.titleColor || defaultStyles.titleColor || '#ffffff');
        setH3TitleColor(data.h3TitleColor || defaultStyles.h3TitleColor || '#d7e3ee');
        setTextColor(data.textColor || defaultStyles.textColor || '#c6d3e2');
        setBackgroundFromColor(data.backgroundFromColor ?? defaultStyles.backgroundFromColor ?? '#111827');
        setBackgroundToColor(data.backgroundToColor ?? defaultStyles.backgroundToColor ?? '#1F2937');
        // Load unified section background
        setSectionBgColor(data.sectionBgColor ?? defaultStyles.sectionBgColor ?? '#374151');
      } else {
        console.log("No current style document found, using defaults.");
        // Apply defaults if no saved style
        handleResetToDefaults(); // Use reset function to apply defaults
      }
    } catch (error) {
      console.error("Error loading current styles:", error);
      alert('Failed to load current styles.');
      handleResetToDefaults(); // Fallback to defaults on error
    } finally {
      setIsLoading(false);
    }

    // Load Saved Themes (from themes collection)
    const themesCollectionRef = collection(db, 'themes');
    try {
      const querySnapshot = await getDocs(themesCollectionRef);
      const loadedThemes: SavedTheme[] = [];
      querySnapshot.forEach((doc) => {
        // Type assertion might be needed depending on Firestore rules/data structure
        const data = doc.data() as { name: string; style: StyleData };
        if (data.name && data.style) { // Basic validation
            loadedThemes.push({ id: doc.id, ...data });
        } else {
            console.warn(`Theme document ${doc.id} has invalid data:`, data);
        }
      });
      setSavedThemes(loadedThemes.sort((a, b) => a.name.localeCompare(b.name))); // Sort themes by name
      console.log("Loaded themes:", loadedThemes);
    } catch (error) {
      console.error("Error loading saved themes:", error);
      alert('Failed to load saved themes.');
      setSavedThemes([]); // Clear themes on error
    } finally {
      setIsLoadingThemes(false);
    }
  }, [db]); // Dependency on db

  // Effect to load data on mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]); // Use the useCallback function

  // Effect to update CSS variables when state changes (no changes needed here)
  useEffect(() => {
    if (!isLoading) { // Only update CSS if initial styles have loaded
      // Ensure colors are valid before setting CSS variables, use defaultStyles for fallbacks
      const validPrimary = primaryColor.match(/^#[0-9A-F]{6}$/i) ? primaryColor : defaultStyles.primaryColor;
      const validSecondary = secondaryColor.match(/^#[0-9A-F]{6}$/i) ? secondaryColor : defaultStyles.secondaryColor;
    const validTitle = titleColor.match(/^#[0-9A-F]{6}$/i) ? titleColor : (defaultStyles.titleColor ?? '#ffffff');
    const validH3Title = h3TitleColor.match(/^#[0-9A-F]{6}$/i) ? h3TitleColor : (defaultStyles.h3TitleColor ?? '#d7e3ee');
    const validText = textColor.match(/^#[0-9A-F]{6}$/i) ? textColor : (defaultStyles.textColor ?? '#c6d3e2');
    // Validate state directly, fallback to guaranteed string default
    const validBgFrom = backgroundFromColor.match(/^#[0-9A-F]{6}$/i)
      ? backgroundFromColor
      : (defaultStyles.backgroundFromColor ?? '#111827');
    const validBgTo = backgroundToColor.match(/^#[0-9A-F]{6}$/i)
      ? backgroundToColor
      : (defaultStyles.backgroundToColor ?? '#1F2937');

    document.documentElement.style.setProperty('--primary-color', validPrimary);
    document.documentElement.style.setProperty('--secondary-color', validSecondary);
    document.documentElement.style.setProperty('--font-family', fontFamily);
    // Apply new colors
    document.documentElement.style.setProperty('--title-color', validTitle);
    document.documentElement.style.setProperty('--h3title-color', validH3Title); // Note: CSS variable name is --h3title-color
    document.documentElement.style.setProperty('--text-color', validText);
    // State variables are now guaranteed strings, so direct assignment is safe
    document.documentElement.style.setProperty('--background-from-color', validBgFrom);
    document.documentElement.style.setProperty('--background-to-color', validBgTo);
    // Set unified section background CSS variable
    const validSectionBg = sectionBgColor.match(/^#[0-9A-F]{6}$/i) ? sectionBgColor : (defaultStyles.sectionBgColor ?? '#374151');
    document.documentElement.style.setProperty('--section-bg-color', validSectionBg);
  }
  }, [
      primaryColor, secondaryColor, fontFamily, titleColor, h3TitleColor, textColor,
      backgroundFromColor, backgroundToColor,
      sectionBgColor, // Use unified state
      isLoading
  ]);


  // Restore handleSaveStyles function with added logging
  // It needs to create its own docRef or rely on one created elsewhere if db is stable
  const handleSaveStyles = async () => {
    // Recreate docRef for saving, ensuring db is checked
    if (!db) {
       console.error("Save Error: Firestore db instance is not available.");
       alert('Error: Cannot save styles. Firestore not available.');
       return;
    }
    const stylesDocRefForSave = doc(db, 'settings', 'styles');

    // Original null check is redundant now, but keep structure
    if (!stylesDocRefForSave) { // This check will likely never fail if db check passes
      console.error("Save Error: Failed to create doc reference.");
      alert('Error: Cannot save styles. Failed to create reference.');
       return;
    }
    setIsSaving(true);
    const stylesToSave: StyleData = {
        primaryColor,
        secondaryColor,
        fontFamily,
        titleColor,
        h3TitleColor,
        textColor,
        backgroundFromColor,
        backgroundToColor,
        // Add unified section background to save data
        sectionBgColor
    };
    console.log('Attempting to save styles to Firestore:', stylesToSave);
    try {
      await setDoc(stylesDocRefForSave, stylesToSave);
      console.log('Firestore save successful:', stylesToSave);
      alert('Styles saved successfully!');
    } catch (error) {
      console.error("Firestore save error:", error); // Log the specific error
      alert(`Failed to save styles. Error: ${error instanceof Error ? error.message : String(error)}`); // Show error details
    } finally {
      console.log('Finished save attempt.');
      setIsSaving(false);
    }
  };

  // --- Reset Function (Modified slightly for clarity) ---
  const handleResetToDefaults = () => {
    console.log("Resetting styles to default values.");
    // Reset state directly using the defaultStyles constant object
    setPrimaryColor(defaultStyles.primaryColor);
    setSecondaryColor(defaultStyles.secondaryColor);
    setFontFamily(defaultStyles.fontFamily);
    setTitleColor(defaultStyles.titleColor ?? '#ffffff'); // Use nullish coalescing for optional fields
    setH3TitleColor(defaultStyles.h3TitleColor ?? '#d7e3ee');
    setTextColor(defaultStyles.textColor ?? '#c6d3e2');
    // Ensure reset uses guaranteed string defaults
    setBackgroundFromColor(defaultStyles.backgroundFromColor ?? '#111827');
    setBackgroundToColor(defaultStyles.backgroundToColor ?? '#1F2937');
    // Reset unified section background
    setSectionBgColor(defaultStyles.sectionBgColor ?? '#374151');

    // Optionally, provide user feedback
    // alert('Styles reset to defaults. Click Save Styles to persist.');
  };
  // --- End Reset Function ---

  // --- AI Color Generation using chroma-js (Enhanced Modes) ---
  const handleGenerateAIColors = () => {
    try {
      // Use current primary color as base, fallback to default if invalid
      const baseColor = chroma.valid(primaryColor) ? chroma(primaryColor) : chroma(defaultStyles.primaryColor);
      const currentMode = aiMode % 3; // Cycle through 0, 1, 2

      let secondaryColorHex: string;
      let accentColorHex: string; // For triadic

      switch (currentMode) {
        case 1: // Analogous
          secondaryColorHex = baseColor.set('hsl.h', '+30').hex();
          accentColorHex = baseColor.set('hsl.h', '-30').hex(); // Use the other analogous color for accents if needed
          console.log("AI Mode: Analogous");
          break;
        case 2: // Triadic
          secondaryColorHex = baseColor.set('hsl.h', '+120').hex();
          accentColorHex = baseColor.set('hsl.h', '-120').hex(); // Third triadic color
          console.log("AI Mode: Triadic");
          break;
        case 0: // Complementary (Default)
        default:
          secondaryColorHex = baseColor.set('hsl.h', '+180').hex();
          accentColorHex = baseColor.set('hsl.h', '+150').hex(); // Split complementary accent
           console.log("AI Mode: Complementary");
          break;
      }

      setSecondaryColor(secondaryColorHex);

      // Determine the color to base the text/titles/background on, depending on the mode
      let referenceColor = baseColor; // Default to primary
      if (currentMode === 1) { // Analogous - use a mix with secondary
        referenceColor = chroma.mix(baseColor, secondaryColorHex, 0.5);
      } else if (currentMode === 2) { // Triadic - use a mix with the third accent color
        referenceColor = chroma.mix(baseColor, accentColorHex, 0.5);
      }
      // For complementary (mode 0), we stick with the baseColor as the reference.

      // Generate text/title colors based on luminance contrast with a dark background assumption, using the referenceColor
      // Aim for good contrast (WCAG AA requires 4.5:1 for normal text)
      const darkBg = chroma('#18181b'); // Assume a dark background like zinc-900 for contrast check

      // Title Color (lighter shade of referenceColor, ensure contrast)
      let generatedTitleColor = referenceColor.brighten(1.5).hex();
      if (chroma.contrast(generatedTitleColor, darkBg) < 4.5) {
        generatedTitleColor = referenceColor.brighten(2.5).hex(); // Increase brightness if contrast is low
      }
      // Ensure it's not too white if reference is already light
      generatedTitleColor = chroma.mix(generatedTitleColor, '#ffffff', 0.1).hex();
      setTitleColor(generatedTitleColor);


      // H3 Title Color (slightly less bright than main title, based on referenceColor)
      let generatedH3Color = referenceColor.brighten(1).hex();
       if (chroma.contrast(generatedH3Color, darkBg) < 4.5) {
        generatedH3Color = referenceColor.brighten(2).hex(); // Increase brightness if contrast is low
      }
      // Ensure it's not too white
      generatedH3Color = chroma.mix(generatedH3Color, '#ffffff', 0.05).hex();
      setH3TitleColor(generatedH3Color);


      // Text Color (even lighter, ensure contrast, based on referenceColor)
       let generatedTextColor = referenceColor.brighten(2.5).desaturate(0.5).hex();
       if (chroma.contrast(generatedTextColor, darkBg) < 4.5) {
         generatedTextColor = referenceColor.brighten(3.5).desaturate(0.2).hex(); // Increase brightness significantly
       }
       // Ensure it's not too white
       generatedTextColor = chroma.mix(generatedTextColor, '#ffffff', 0.2).hex();
       setTextColor(generatedTextColor);


      // Background Gradient (dark shades based on referenceColor, less desaturated)
      const bgFrom = referenceColor.darken(2.2).desaturate(0.5).hex(); // Less darken, less desaturate
      const bgTo = referenceColor.darken(1.8).desaturate(0.3).hex();   // Less darken, less desaturate
      setBackgroundFromColor(bgFrom);
      setBackgroundToColor(bgTo);

      // Keep the selected primary color
      // setPrimaryColor(baseColor.hex()); // Already set, but ensures it's a valid hex

    } catch (error) {
      console.error("Error generating AI colors:", error);
      alert("Failed to generate colors. Please ensure the primary color is valid.");
      // Optionally reset to defaults or previous state on error
      handleResetToDefaults();
    } finally {
       setAiMode(prevMode => prevMode + 1); // Increment mode for next click
    }
  };
  // --- End AI Color Generation ---


  // --- Theme Management Handlers ---

  const handleApplyTheme = (theme: SavedTheme) => {
    console.log("Applying theme:", theme.name);
    const { style } = theme;
    // Apply theme styles to the current state
    setPrimaryColor(style.primaryColor || defaultStyles.primaryColor);
    setSecondaryColor(style.secondaryColor || defaultStyles.secondaryColor);
    setFontFamily(style.fontFamily || defaultStyles.fontFamily);
    setTitleColor(style.titleColor || defaultStyles.titleColor || '#ffffff');
    setH3TitleColor(style.h3TitleColor || defaultStyles.h3TitleColor || '#d7e3ee');
    setTextColor(style.textColor || defaultStyles.textColor || '#c6d3e2');
    setBackgroundFromColor(style.backgroundFromColor ?? defaultStyles.backgroundFromColor ?? '#111827');
    setBackgroundToColor(style.backgroundToColor ?? defaultStyles.backgroundToColor ?? '#1F2937');
    // Apply unified section background from theme
    setSectionBgColor(style.sectionBgColor ?? defaultStyles.sectionBgColor ?? '#374151');
    // Note: This only changes the editor state. User needs to click "Save Styles"
    // to make this the active style in 'settings/styles'.
  };

  const handleSaveCurrentTheme = async () => {
    if (!db) {
      alert("Error: Firestore not available.");
      return;
    }
    if (!newThemeName.trim()) {
      alert("Please enter a name for the theme.");
      return;
    }
    // Check if theme name already exists
    if (savedThemes.some(theme => theme.name.toLowerCase() === newThemeName.trim().toLowerCase())) {
        alert(`A theme named "${newThemeName.trim()}" already exists. Please choose a different name.`);
        return;
    }


    const currentStyle: StyleData = {
      primaryColor,
      secondaryColor,
      fontFamily,
      titleColor,
      h3TitleColor,
      textColor,
      backgroundFromColor,
      backgroundToColor,
      // Add unified section background to theme data
      sectionBgColor,
    };

    setIsSaving(true); // Use isSaving state to indicate activity
    console.log(`Saving current style as new theme: "${newThemeName.trim()}"`);
    try {
      const themesCollectionRef = collection(db, 'themes');
      const newThemeDoc = await addDoc(themesCollectionRef, {
        name: newThemeName.trim(),
        style: currentStyle,
      });
      console.log("New theme saved with ID:", newThemeDoc.id);
      // Add the new theme to the local state immediately
      const newTheme: SavedTheme = { id: newThemeDoc.id, name: newThemeName.trim(), style: currentStyle };
      setSavedThemes(prevThemes => [...prevThemes, newTheme].sort((a, b) => a.name.localeCompare(b.name)));
      setNewThemeName(''); // Clear the input field
      alert(`Theme "${newTheme.name}" saved successfully!`);
    } catch (error) {
      console.error("Error saving new theme:", error);
      alert(`Failed to save theme. Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTheme = async (themeId: string, themeName: string) => {
    if (!db) {
      alert("Error: Firestore not available.");
      return;
    }
    // Confirmation dialog
    if (!window.confirm(`Are you sure you want to delete the theme "${themeName}"? This cannot be undone.`)) {
        return;
    }

    setIsSaving(true); // Indicate activity
    console.log(`Attempting to delete theme: ${themeName} (ID: ${themeId})`);
    try {
      const themeDocRef = doc(db, 'themes', themeId);
      await deleteDoc(themeDocRef);
      console.log(`Theme "${themeName}" deleted successfully.`);
      // Remove the theme from local state
      setSavedThemes(prevThemes => prevThemes.filter(theme => theme.id !== themeId));
      alert(`Theme "${themeName}" deleted.`);
    } catch (error) {
      console.error(`Error deleting theme ${themeName}:`, error);
      alert(`Failed to delete theme "${themeName}". Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSaving(false);
    }
  };

  // --- End Theme Management Handlers ---


  // Combined loading state check
  if (isLoading || isLoadingThemes) {
    return <div>Loading styles and themes...</div>;
  }

  // --- Return JSX ---
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> {/* Main Grid Layout */}

      {/* Column 1: Style Editor Controls */}
      <div className="md:col-span-2 space-y-4"> {/* Editor takes 2 columns on medium screens */}
        <h4 className="text-lg font-medium mb-4">Style Editor</h4>

        {/* Primary Color */}
        <div>
          <label htmlFor="primaryColorText" className="block text-sm font-medium text-gray-700 mb-1">
            Primary Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              id="primaryColorPicker" // Use distinct ID
              value={primaryColor.match(/^#[0-9A-F]{6}$/i) ? primaryColor : defaultStyles.primaryColor} // Ensure valid value for color picker
              onChange={handleColorPickerChange(setPrimaryColor)} // Use generic handler
              className="h-10 w-10 p-1 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              id="primaryColorText" // Use distinct ID
              value={primaryColor}
              onChange={handleColorTextChange(setPrimaryColor)} // Use generic handler
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="#rrggbb"
              maxLength={7} // Limit input length
            />
          </div>
        </div>

        {/* Secondary Color */}
        <div>
          <label htmlFor="secondaryColorText" className="block text-sm font-medium text-gray-700 mb-1">
            Secondary Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              id="secondaryColorPicker" // Use distinct ID
              value={secondaryColor.match(/^#[0-9A-F]{6}$/i) ? secondaryColor : defaultStyles.secondaryColor} // Ensure valid value for color picker
              onChange={handleColorPickerChange(setSecondaryColor)} // Use generic handler
              className="h-10 w-10 p-1 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              id="secondaryColorText" // Use distinct ID
              value={secondaryColor}
              onChange={handleColorTextChange(setSecondaryColor)} // Use generic handler
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="#rrggbb"
              maxLength={7} // Limit input length
            />
          </div>
        </div>

        {/* Font Family */}
        <div>
          <label htmlFor="fontFamily" className="block text-sm font-medium text-gray-700 mb-1">
            Font Family
          </label>
          <select
            id="fontFamily"
            value={fontFamily}
            onChange={handleFontFamilyChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="'Noto Sans', sans-serif">'Noto Sans', sans-serif</option>
            <option value="'Arial', sans-serif">'Arial', sans-serif</option>
            <option value="'Verdana', sans-serif">'Verdana', sans-serif</option>
            <option value="'Georgia', serif">'Georgia', serif</option>
            <option value="'Times New Roman', serif">'Times New Roman', serif</option>
            <option value="'Inconsolata', monospace">'Inconsolata', monospace</option>
            {/* Add more fonts as needed */}
          </select>
           <p className="mt-1 text-xs text-gray-500">Select a font family from the list.</p>
         </div>

        {/* --- Add New Color Inputs --- */}
        {/* Title Color */}
        <div>
          <label htmlFor="titleColorText" className="block text-sm font-medium text-gray-700 mb-1">
            Title Color (h2)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              id="titleColorPicker"
              value={titleColor.match(/^#[0-9A-F]{6}$/i) ? titleColor : (defaultStyles.titleColor ?? '#ffffff')} // Use default fallback
              onChange={handleColorPickerChange(setTitleColor)} // Use generic handler
              className="h-10 w-10 p-1 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              id="titleColorText"
              value={titleColor}
              onChange={handleColorTextChange(setTitleColor)} // Use generic handler
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="#rrggbb"
              maxLength={7}
            />
          </div>
        </div>

        {/* H3 Title Color */}
        <div>
          <label htmlFor="h3TitleColorText" className="block text-sm font-medium text-gray-700 mb-1">
            Sub-Title Color (h3)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              id="h3TitleColorPicker"
              value={h3TitleColor.match(/^#[0-9A-F]{6}$/i) ? h3TitleColor : (defaultStyles.h3TitleColor ?? '#d7e3ee')} // Use default fallback
              onChange={handleColorPickerChange(setH3TitleColor)} // Use generic handler
              className="h-10 w-10 p-1 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              id="h3TitleColorText"
              value={h3TitleColor}
              onChange={handleColorTextChange(setH3TitleColor)} // Use generic handler
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="#rrggbb"
              maxLength={7}
            />
          </div>
        </div>

        {/* Text Color */}
        <div>
          <label htmlFor="textColorText" className="block text-sm font-medium text-gray-700 mb-1">
            Text Color (p, label)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              id="textColorPicker"
              value={textColor.match(/^#[0-9A-F]{6}$/i) ? textColor : (defaultStyles.textColor ?? '#c6d3e2')} // Use default fallback
              onChange={handleColorPickerChange(setTextColor)} // Use generic handler
              className="h-10 w-10 p-1 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              id="textColorText"
              value={textColor}
              onChange={handleColorTextChange(setTextColor)} // Use generic handler
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="#rrggbb"
              maxLength={7}
            />
          </div>
        </div>
        {/* --- End New Color Inputs --- */}

        {/* Background Gradient Colors */}
        <div>
          <label htmlFor="backgroundFromColorText" className="block text-sm font-medium text-gray-700 mb-1">
            Background Gradient From
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              id="backgroundFromColorPicker"
              // Validate state directly, fallback to guaranteed string default for value prop
              value={backgroundFromColor.match(/^#[0-9A-F]{6}$/i) ? backgroundFromColor : (defaultStyles.backgroundFromColor ?? '#111827')}
              onChange={handleColorPickerChange(setBackgroundFromColor)}
              className="h-10 w-10 p-1 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              id="backgroundFromColorText"
              // Value can be the state value directly here
              value={backgroundFromColor}
              onChange={handleColorTextChange(setBackgroundFromColor)}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="#rrggbb"
              maxLength={7}
            />
          </div>
        </div>

        <div>
          <label htmlFor="backgroundToColorText" className="block text-sm font-medium text-gray-700 mb-1">
            Background Gradient To
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              id="backgroundToColorPicker"
              // Validate state directly, fallback to guaranteed string default for value prop
              value={backgroundToColor.match(/^#[0-9A-F]{6}$/i) ? backgroundToColor : (defaultStyles.backgroundToColor ?? '#1F2937')}
              onChange={handleColorPickerChange(setBackgroundToColor)}
              className="h-10 w-10 p-1 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              id="backgroundToColorText"
              // Value can be the state value directly here
              value={backgroundToColor}
              onChange={handleColorTextChange(setBackgroundToColor)}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="#rrggbb"
              maxLength={7}
            />
          </div>
        </div>
        {/* End Background Gradient Colors */}

        {/* --- Unified Section Background Color --- */}
        <div>
          <label htmlFor="sectionBgColorText" className="block text-sm font-medium text-gray-700 mb-1">
            Section Background Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              id="sectionBgColorPicker"
              value={sectionBgColor.match(/^#[0-9A-F]{6}$/i) ? sectionBgColor : (defaultStyles.sectionBgColor ?? '#374151')}
              onChange={handleColorPickerChange(setSectionBgColor)}
              className="h-10 w-10 p-1 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              id="sectionBgColorText"
              value={sectionBgColor}
              onChange={handleColorTextChange(setSectionBgColor)}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="#rrggbb"
              maxLength={7}
            />
          </div>
        </div>
        {/* --- End Unified Section Background Color --- */}


        {/* Preview Section - Updated with Translations and Unified Section Background */}
        <div
          className="mt-6 p-4 md:p-6 border border-gray-300 text-white rounded-lg shadow-lg"
          style={{ background: `linear-gradient(to bottom right, ${backgroundFromColor}, ${backgroundToColor})` }}
        >
            <h5 className="text-md font-medium mb-3">Preview</h5>
            <div style={{ fontFamily: fontFamily }}>
                {/* Site Title and Role using Primary and Secondary Colors */}
                <h1 style={{ color: primaryColor }} className="text-3xl text-center font-bold mb-1">
                    {translations.en.generalInfo.siteTitle}
                </h1>
                <p style={{ color: secondaryColor }} className="text-xl text-center mb-6">
                    {translations.en.generalInfo.siteRole}
                </p>

                {/* Services Section Title using Title Color */}
                <h2 style={{ color: titleColor }} className="text-2xl font-bold text-center mb-3">
                    {translations.en.services.title}
                </h2>

                 {/* Example of H3 Title Color (if needed for other previews) */}
                 <h3 style={{ color: h3TitleColor }} className="text-lg font-semibold text-center mb-6">
                 {translations.en.projects.project1.title}
                  </h3>

                {/* About Description using Text Color */}
                <p style={{ color: textColor }} className="text-center mb-6"> {/* Reduced margin */}
                    {translations.en.projects.project1.description}
                </p>

                {/* Unified Section Background Previews */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    {/* Projects Preview Box */}
                    <div className="p-4 rounded-lg shadow" style={{ backgroundColor: sectionBgColor }}>
                        <h4 style={{ color: titleColor }} className="text-lg font-semibold mb-2 text-center">Projects Area</h4>
                        <p style={{ color: textColor }} className="text-sm text-center">Background: {sectionBgColor}</p>
                    </div>
                    {/* Services Preview Box */}
                    <div className="p-4 rounded-lg shadow" style={{ backgroundColor: sectionBgColor }}>
                        <h4 style={{ color: titleColor }} className="text-lg font-semibold mb-2 text-center">Services Area</h4>
                        <p style={{ color: textColor }} className="text-sm text-center">Background: {sectionBgColor}</p>
                    </div>
                    {/* Contact Preview Box */}
                    <div className="p-4 rounded-lg shadow" style={{ backgroundColor: sectionBgColor }}>
                        <h4 style={{ color: titleColor }} className="text-lg font-semibold mb-2 text-center">Contact Area</h4>
                        <p style={{ color: textColor }} className="text-sm text-center">Background: {sectionBgColor}</p>
                    </div>
                </div>

            </div>
         </div>

        {/* Action Buttons: Save and Reset */}
        <div className="pt-4 flex space-x-2"> {/* Use flex container */}
          <button
            onClick={handleSaveStyles}
            disabled={isSaving || isLoading} // Disable if loading or saving
            className={`px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSaving || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSaving ? 'Saving...' : 'Save Styles'}
          </button>
          {/* Add Reset Button */}
          <button
            onClick={handleResetToDefaults}
            disabled={isSaving || isLoading} // Also disable during save/load
            className={`px-4 py-2 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 ${isSaving || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Reset to Defaults
          </button>
          {/* AI Generate Button */}
          <button
            onClick={handleGenerateAIColors}
            disabled={isSaving || isLoading || isLoadingThemes}
            className={`px-4 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${isSaving || isLoading || isLoadingThemes ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Generate Colors
          </button>
        </div>
      </div> {/* End Column 1 */}


      {/* Column 2: Theme Switcher and History */}
      <div className="md:col-span-1 space-y-4"> {/* Theme history takes 1 column */}
        
        {/* Global Theme Switcher */}
        <div className="mb-4">
          <h4 className="text-lg font-medium mb-2">Global Theme</h4>
          {/* Pass the handler function down as a prop */}
          <ThemeSwitcher onThemeSelect={handleGlobalThemeSelect} /> 
          <p className="text-xs text-gray-500 mt-1">Select the overall application theme (Light, Dark, etc.). This will update the editor fields below.</p>
        </div>

        <hr className="my-4" /> {/* Add a separator */}

        <h4 className="text-lg font-medium mb-4">Custom Theme Management</h4>

        {/* Save Current Theme Section */}
        <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
          <label htmlFor="newThemeName" className="block text-sm font-medium text-gray-700 mb-1">
            Save Current Style as Theme
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              id="newThemeName"
              value={newThemeName}
              onChange={(e) => setNewThemeName(e.target.value)}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter theme name"
              disabled={isSaving}
            />
            <button
              onClick={handleSaveCurrentTheme}
              disabled={isSaving || !newThemeName.trim()}
              className={`px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${isSaving || !newThemeName.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Save Theme
            </button>
          </div>
        </div>

        {/* Saved Themes List */}
        <div>
          <h5 className="text-md font-medium mb-2">Saved Themes</h5>
          {savedThemes.length === 0 ? (
            <p className="text-sm text-gray-500">No themes saved yet.</p>
          ) : (
            <ul className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-md p-2 bg-white">
              {savedThemes.map((theme) => (
                <li key={theme.id} className="flex items-center justify-between p-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-sm font-medium text-gray-800">{theme.name}</span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleApplyTheme(theme)}
                      disabled={isSaving}
                      className={`px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50`}
                      title="Apply this theme to the editor"
                    >
                      Apply
                    </button>
                    {/* Add Rename button later if needed */}
                    <button
                      onClick={() => handleDeleteTheme(theme.id, theme.name)}
                      disabled={isSaving}
                      className={`px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50`}
                      title="Delete this theme permanently"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div> {/* End Column 2 */}

    </div> /* End Main Grid */
  );
};

export default StyleEditorTab;
