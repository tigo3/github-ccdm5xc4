import React, { useState } from 'react';
import {
  Palette, Type, Save, Trash2, RefreshCw, Wand2 // Removed Layout, Sliders, Download, Upload
} from 'lucide-react';

import { useStyleEditorData } from './hooks/useStyleEditorData'; // Corrected path
import ColorPickerInput from '../../components/ColorPickerInput'; // Corrected path
import ThemeSwitcher from '../../components/ThemeSwitcher'; // Corrected path

// --- Constants ---
// Tabs configuration remains specific to this component
const tabs = [
  { id: 'colors', label: 'Colors', icon: <Palette size={20} /> },
  { id: 'typography', label: 'Typography', icon: <Type size={20} /> },
  // Removed Layout and Advanced tabs
];

// --- Component ---
const StyleEditorSection: React.FC = () => {
  // --- State ---
  // Only UI state specific to this component remains here
  const [activeTab, setActiveTab] = useState('colors');

  // --- Custom Hook ---
  // Manages all style data, theme data, loading/saving states, and related logic
  const {
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
    aiMode,
    savedThemes,
    newThemeName, setNewThemeName,
    isLoadingThemes,
    handleSaveStyles,
    handleSaveTheme,
    handleDeleteTheme,
    handleApplyTheme,
    handleGenerateAIColors,
    handleGlobalThemeSelect,
    // Removed exportTheme, importTheme
  } = useStyleEditorData();

  // --- Render ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 p-4 md:p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading Styles...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-6">
      {/* --- Main Editor Panel --- */}
      <div className="lg:col-span-2 space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="-mb-px flex space-x-4 sm:space-x-8 whitespace-nowrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 py-3 px-2 sm:py-4 sm:px-3 border-b-2 font-medium text-sm transition-colors duration-150 ease-in-out
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          {/* --- Colors Tab --- */}
          {activeTab === 'colors' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
                <h3 className="text-lg font-medium text-gray-900">Color Settings</h3>
                <button
                  onClick={handleGenerateAIColors}
                  className="flex items-center justify-center sm:justify-start space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors w-full sm:w-auto text-sm"
                  title={`Generate colors (Mode ${aiMode % 3 + 1})`}
                >
                  <Wand2 size={16} />
                  <span>Generate AI Colors</span>
                </button>
              </div>

              <ColorPickerInput
                label="Primary Color"
                value={primaryColor}
                onChange={setPrimaryColor}
                description="Main brand color for buttons, links, etc."
              />
              <ColorPickerInput
                label="Secondary Color"
                value={secondaryColor}
                onChange={setSecondaryColor}
                description="Supporting color for accents, secondary actions."
              />

              <div className="border-t border-gray-200 pt-6 mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Text Colors</h4>
                <ColorPickerInput
                  label="Title Color"
                  value={titleColor}
                  onChange={setTitleColor}
                  description="Color for main headings (h1, h2)."
                />
                <ColorPickerInput
                  label="Subtitle Color"
                  value={h3TitleColor}
                  onChange={setH3TitleColor}
                  description="Color for subheadings (h3, h4)."
                />
                <ColorPickerInput
                  label="Body Text Color"
                  value={textColor}
                  onChange={setTextColor}
                  description="Default color for paragraphs and general text."
                />
              </div>

              <div className="border-t border-gray-200 pt-6 mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Background Colors</h4>
                <ColorPickerInput
                  label="Background Start"
                  value={backgroundFromColor}
                  onChange={setBackgroundFromColor}
                  description="Starting color for main background gradient."
                />
                <ColorPickerInput
                  label="Background End"
                  value={backgroundToColor}
                  onChange={setBackgroundToColor}
                  description="Ending color for main background gradient."
                />
                <ColorPickerInput
                  label="Section Background"
                  value={sectionBgColor}
                  onChange={setSectionBgColor}
                  description="Background for content cards/sections."
                />
              </div>
            </div>
          )}

          {/* --- Typography Tab --- */}
          {activeTab === 'typography' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Typography Settings</h3>
              <div className="mb-4">
                <label htmlFor="fontFamilySelect" className="block text-sm font-medium text-gray-700 mb-1">
                  Font Family
                </label>
                <select
                  id="fontFamilySelect"
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900" // Removed dark: classes
                >
                  {/* Limited Font Options */}
                  <option value="'Noto Sans', sans-serif">Noto Sans</option>
                  <option value="Arial, Helvetica, sans-serif">Arial</option> {/* Added Helvetica as fallback */}
                  <option value="Helvetica, Arial, sans-serif">Helvetica</option> {/* Added Arial as fallback */}
                  <option value="Georgia, serif">Georgia</option>
                  <option value="'Times New Roman', Times, serif">Times New Roman</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">Select the primary font for the website.</p>
              </div>
            </div>
          )}

          {/* Removed Layout and Advanced Tab Content */}

          {/* Save Current Styles Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleSaveStyles}
              disabled={isSaving}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Current Styles</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* --- Sidebar Panel --- */}
      <div className="lg:col-span-1 space-y-6">
        {/* Saved Themes */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Saved Themes</h3>
          {isLoadingThemes ? (
             <div className="flex items-center justify-center h-20">
               <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
               <span className="ml-2 text-sm text-gray-500">Loading themes...</span>
             </div>
          ) : savedThemes.length > 0 ? (
            <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {savedThemes.map((theme) => (
                <li key={theme.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-medium text-gray-800 truncate mr-2" title={theme.name}>{theme.name}</span>
                  <div className="flex space-x-2 flex-shrink-0">
                    <button
                      onClick={() => handleApplyTheme(theme)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Apply Theme"
                    >
                      <RefreshCw size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTheme(theme.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                      title="Delete Theme"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No themes saved yet.</p>
          )}

          {/* Save New Theme Form */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <label htmlFor="newThemeName" className="block text-sm font-medium text-gray-700 mb-1">Save Current as New Theme</label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="newThemeName"
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
                placeholder="Enter theme name"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm" // Removed dark: classes
              />
              <button
                onClick={handleSaveTheme}
                disabled={isSaving || !newThemeName.trim()}
                className={`flex-shrink-0 px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSaving || !newThemeName.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'}`}
                title="Save current settings as a new theme"
              >
                <Save size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Removed Import/Export Section */}

        {/* Global Theme Switcher (If needed and re-integrated) */}
        <ThemeSwitcher onThemeSelect={handleGlobalThemeSelect} />

      </div>
    </div>
  );
};

export default StyleEditorSection;
