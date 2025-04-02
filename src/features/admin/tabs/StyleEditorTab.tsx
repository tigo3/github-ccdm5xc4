import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import chroma from 'chroma-js';
import { db } from '../../../config/firebaseConfig';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useNotifications } from '../../../context/NotificationContext'; // Import the hook
import {
  Palette, 
  Type, 
  Layout, 
  Sliders,
  Copy,
  Save,
  Trash2,
  RefreshCw,
  Wand2,
  Download,
  Upload
} from 'lucide-react';

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

interface SavedTheme {
  id: string;
  name: string;
  style: StyleData;
}

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

const StyleEditorTab: React.FC = () => {
  // State Management
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
  const [aiMode, setAiMode] = useState(0);
  const [savedThemes, setSavedThemes] = useState<SavedTheme[]>([]);
  const [newThemeName, setNewThemeName] = useState('');
  const [isLoadingThemes, setIsLoadingThemes] = useState(true);
  const [activeTab, setActiveTab] = useState('colors');
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [selectedShade, setSelectedShade] = useState<string | null>(null);
  const { showToast, requestConfirmation } = useNotifications(); // Get notification functions

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Apply styles effect
  useEffect(() => {
    if (!isLoading) {
      applyStyles();
    }
  }, [
    primaryColor,
    secondaryColor,
    fontFamily,
    titleColor,
    h3TitleColor,
    textColor,
    backgroundFromColor,
    backgroundToColor,
    sectionBgColor,
    isLoading
  ]);

  // Helper Functions
  const applyStyles = () => {
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
  };

  const validateColors = (colors: Record<string, string>) => {
    const validated: Record<string, string> = {};
    Object.entries(colors).forEach(([key, value]) => {
      validated[key] = value.match(/^#[0-9A-F]{6}$/i) ? value : defaultStyles[key as keyof StyleData] || '#000000';
    });
    return validated;
  };


  const handleGlobalThemeSelect = (themeData: ThemeData) => {
    setPrimaryColor(themeData.primaryColor);
    setSecondaryColor(themeData.secondaryColor);
    setTitleColor(themeData.titleColor);
    setH3TitleColor(themeData.h3TitleColor);
    setTextColor(themeData.textColor);
    setBackgroundFromColor(themeData.backgroundFromColor);
    setBackgroundToColor(themeData.backgroundToColor);
    setSectionBgColor(themeData.sectionBgColor);
  };

  const loadInitialData = async () => {
    if (!db) {
      console.error("Firestore not available");
      setIsLoading(false);
      return;
    }

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
    } finally {
      setIsLoading(false);
      setIsLoadingThemes(false);
    }
  };

  const handleSaveStyles = async () => {
    if (!db) {
      console.error("Firestore not available");
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
      // alert('Styles saved successfully!'); // Use toast
      showToast('Styles saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving styles:', error);
      // alert('Failed to save styles'); // Use toast
      showToast('Failed to save styles. Check console.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTheme = async () => {
    if (!db || !newThemeName.trim()) return;

    setIsSaving(true);
    try {
      const themeData = {
        name: newThemeName.trim(),
        style: {
          primaryColor,
          secondaryColor,
          fontFamily,
          titleColor,
          h3TitleColor,
          textColor,
          backgroundFromColor,
          backgroundToColor,
          sectionBgColor
        }
      };

      await addDoc(collection(db, 'themes'), themeData);
      loadInitialData(); // Reload themes
      setNewThemeName('');
      // alert('Theme saved successfully!'); // Use toast
      showToast('Theme saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving theme:', error);
      // alert('Failed to save theme'); // Use toast
      showToast('Failed to save theme. Check console.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTheme = async (themeId: string) => {
    const themeToDelete = savedThemes.find(t => t.id === themeId);
    if (!db || !themeToDelete) return;

    // Use requestConfirmation
    requestConfirmation({
      message: `Are you sure you want to delete the theme "${themeToDelete.name}"?`,
      onConfirm: async () => {
        // Add check for db inside the callback
        if (!db) {
          showToast('Error: Firestore connection lost.', 'error');
          return;
        }
        try {
          await deleteDoc(doc(db, 'themes', themeId));
          setSavedThemes(prev => prev.filter(theme => theme.id !== themeId));
          showToast('Theme deleted successfully!', 'success'); // Success toast
        } catch (error) {
          console.error('Error deleting theme:', error);
          // alert('Failed to delete theme'); // Use toast
          showToast('Failed to delete theme. Check console.', 'error');
        }
      },
      confirmText: 'Delete Theme',
      title: 'Confirm Deletion'
    });
  };

  const handleApplyTheme = (theme: SavedTheme) => {
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
  };

  const handleGenerateAIColors = () => {
    try {
      const baseColor = chroma.valid(primaryColor) ? chroma(primaryColor) : chroma(defaultStyles.primaryColor);
      const currentMode = aiMode % 3;

      let secondaryColorHex: string;
      let accentColorHex: string;

      switch (currentMode) {
        case 1: // Analogous
          secondaryColorHex = baseColor.set('hsl.h', '+30').hex();
          accentColorHex = baseColor.set('hsl.h', '-30').hex();
          break;
        case 2: // Triadic
          secondaryColorHex = baseColor.set('hsl.h', '+120').hex();
          accentColorHex = baseColor.set('hsl.h', '-120').hex();
          break;
        default: // Complementary
          secondaryColorHex = baseColor.set('hsl.h', '+180').hex();
          accentColorHex = baseColor.set('hsl.h', '+150').hex();
          break;
      }

      setSecondaryColor(secondaryColorHex);

      // Generate text colors
      const titleColorHex = chroma.mix(baseColor.brighten(1.5), '#ffffff', 0.1).hex();
      const h3TitleColorHex = chroma.mix(baseColor.brighten(1), '#ffffff', 0.05).hex();
      const textColorHex = chroma.mix(baseColor.brighten(2.5).desaturate(0.5), '#ffffff', 0.2).hex();

      setTitleColor(titleColorHex);
      setH3TitleColor(h3TitleColorHex);
      setTextColor(textColorHex);

      // Generate background colors
      setBackgroundFromColor(baseColor.darken(2.2).desaturate(0.5).hex());
      setBackgroundToColor(baseColor.darken(1.8).desaturate(0.3).hex());
      setSectionBgColor(baseColor.darken(1.5).desaturate(0.4).hex());

      setAiMode(prev => prev + 1);
      showToast('AI colors generated!', 'success'); // Feedback for generation
    } catch (error) {
      console.error('Error generating AI colors:', error);
      // alert('Failed to generate colors'); // Use toast
      showToast('Failed to generate colors. Check console.', 'error');
    }
  };

  const exportTheme = () => {
    const themeData = {
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

    const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'theme.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Theme exported successfully!', 'success'); // Export feedback
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const themeData = JSON.parse(e.target?.result as string);
        handleGlobalThemeSelect(themeData);
        showToast('Theme imported successfully!', 'success'); // Import feedback
      } catch (error) {
        console.error('Error importing theme:', error);
        // alert('Invalid theme file'); // Use toast
        showToast('Invalid theme file or format.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const renderColorPicker = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    description?: string
  ) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {/* Stack vertically on small screens, horizontally on medium+ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-10 p-1 border border-gray-300 rounded cursor-pointer self-start sm:self-center" // Align start on mobile
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full sm:flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          maxLength={7}
        />
        <button
          onClick={() => {
            navigator.clipboard.writeText(value);
            // alert('Color code copied!'); // Use toast
            showToast('Color code copied!', 'success');
          }}
          className="p-2 text-gray-500 hover:text-gray-700 self-start sm:self-center" // Align start on mobile
          title="Copy color code"
        >
          <Copy size={20} />
        </button>
      </div>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
    </div>
  );

  const tabs = [
    { id: 'colors', label: 'Colors', icon: <Palette size={20} /> },
    { id: 'typography', label: 'Typography', icon: <Type size={20} /> },
    { id: 'layout', label: 'Layout', icon: <Layout size={20} /> },
    { id: 'advanced', label: 'Advanced', icon: <Sliders size={20} /> },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Editor Panel */}
      <div className="lg:col-span-2 space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200 overflow-x-auto"> {/* Added overflow-x-auto */}
          <nav className="-mb-px flex space-x-8 whitespace-nowrap"> {/* Added whitespace-nowrap */}
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'colors' && (
            <div className="space-y-6">
              {/* Stack title and button on small screens */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
                <h3 className="text-lg font-medium text-gray-900">Color Settings</h3>
                <button
                  onClick={handleGenerateAIColors}
                  className="flex items-center justify-center sm:justify-start space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors w-full sm:w-auto"
                >
                  <Wand2 size={16} />
                  <span>Generate AI Colors</span>
                </button>
              </div>

              {renderColorPicker('Primary Color', primaryColor, setPrimaryColor, 'Main brand color used for buttons and important elements')}
              {renderColorPicker('Secondary Color', secondaryColor, setSecondaryColor, 'Supporting color for secondary elements')}
              {renderColorPicker('Title Color', titleColor, setTitleColor, 'Color for main headings')}
              {renderColorPicker('Subtitle Color', h3TitleColor, setH3TitleColor, 'Color for subheadings')}
              {renderColorPicker('Text Color', textColor, setTextColor, 'Color for body text')}
              
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Background Colors</h4>
                {renderColorPicker('Background Start', backgroundFromColor, setBackgroundFromColor, 'Starting color for background gradient')}
                {renderColorPicker('Background End', backgroundToColor, setBackgroundToColor, 'Ending color for background gradient')}
                {renderColorPicker('Section Background', sectionBgColor, setSectionBgColor, 'Background color for content sections')}
              </div>
            </div>
          )}

          {activeTab === 'typography' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Typography Settings</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Family
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="'Noto Sans', sans-serif">Noto Sans</option>
                  <option value="'Arial', sans-serif">Arial</option>
                  <option value="'Helvetica', sans-serif">Helvetica</option>
                  <option value="'Georgia', serif">Georgia</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                </select>
              </div>

              {/* Typography Preview */}
              <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Preview</h4>
                <div style={{ fontFamily }}>
                  <h1 style={{ color: titleColor }} className="text-4xl font-bold mb-4">
                    Heading 1
                  </h1>
                  <h2 style={{ color: h3TitleColor }} className="text-3xl font-semibold mb-4">
                    Heading 2
                  </h2>
                  <h3 style={{ color: h3TitleColor }} className="text-2xl font-medium mb-4">
                    Heading 3
                  </h3>
                  <p style={{ color: textColor }} className="mb-4">
                    This is a paragraph of text that shows how your typography settings will look
                    in the actual content. The quick brown fox jumps over the lazy dog.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Layout Settings</h3>
              
              {/* Layout Preview */}
              <div className="border border-gray-200 rounded-lg p-4">
                {/* Stack on small screens, 2 columns on medium+ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded" style={{ backgroundColor: sectionBgColor }}>
                    <h4 style={{ color: h3TitleColor }} className="text-lg font-medium mb-2">
                      Section Preview
                    </h4>
                    <p style={{ color: textColor }} className="text-sm">
                      Preview of section background and spacing
                    </p>
                  </div>
                  <div className="p-4 rounded" style={{ backgroundColor: sectionBgColor }}>
                    <h4 style={{ color: h3TitleColor }} className="text-lg font-medium mb-2">
                      Content Area
                    </h4>
                    <p style={{ color: textColor }} className="text-sm">
                      Sample content area layout
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Advanced Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <button
                    onClick={exportTheme}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                  >
                    <Download size={16} />
                    <span>Export Theme</span>
                  </button>
                  
                  <label className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors cursor-pointer">
                    <Upload size={16} />
                    <span>Import Theme</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importTheme}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Stack on small screens */}
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <button
            onClick={() => handleGlobalThemeSelect(defaultStyles as ThemeData)}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw size={16} />
            <span>Reset to Defaults</span>
          </button>
          
          <button
            onClick={handleSaveStyles}
            disabled={isSaving}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6">
        {/* Theme Switcher */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Global Theme</h3>
          <ThemeSwitcher onThemeSelect={handleGlobalThemeSelect} />
        </div>

        {/* Saved Themes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Saved Themes</h3>
          
          <div className="mb-4">
            {/* Stack input and button on small screens */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <input
                type="text"
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
                placeholder="Enter theme name"
                className="w-full sm:flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSaveTheme}
                disabled={!newThemeName.trim() || isSaving}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex-shrink-0" // Added flex-shrink-0
              >
                Save
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {savedThemes.map((theme) => (
              <div
                key={theme.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="font-medium text-gray-700">{theme.name}</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleApplyTheme(theme)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => handleDeleteTheme(theme.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleEditorTab;
