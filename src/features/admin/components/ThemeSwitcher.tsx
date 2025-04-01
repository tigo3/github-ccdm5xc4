import React, { useState, useEffect } from 'react';

// Define the structure for theme color data (matches StyleData in StyleEditorTab)
interface ThemeData {
  primaryColor: string;
  secondaryColor: string;
  titleColor: string;
  h3TitleColor: string;
  textColor: string;
  backgroundFromColor: string;
  backgroundToColor: string;
  sectionBgColor: string;
  // Add fontFamily if you want the switcher to control it too
  // fontFamily: string; 
}

// Define the props for ThemeSwitcher, including the callback
interface ThemeSwitcherProps {
  onThemeSelect: (themeData: ThemeData) => void; // Callback function prop
}

// Define the theme configurations directly in the component
// These should match the values in the tailwind.config.js plugin
const themeConfigs: Record<string, ThemeData> = {
  light: { // Matches :root in tailwind config (approximated from theme('colors...'))
    primaryColor: '#3b82f6', // blue-500
    secondaryColor: '#6b7280', // gray-500
    titleColor: '#1f2937', // gray-800 (Assuming title uses default text color in light)
    h3TitleColor: '#1f2937', // gray-800 (Assuming h3 uses default text color in light)
    textColor: '#1f2937', // gray-800
    backgroundFromColor: '#ffffff', // white
    backgroundToColor: '#f3f4f6', // gray-100 (Approximation for gradient)
    sectionBgColor: '#f3f4f6', // gray-100 (Approximation for section bg)
  },
  dark: {
    primaryColor: '#60a5fa', // blue-400
    secondaryColor: '#9ca3af', // gray-400
    titleColor: '#f9fafb', // gray-50 (Assuming title uses default text color in dark)
    h3TitleColor: '#f9fafb', // gray-50 (Assuming h3 uses default text color in dark)
    textColor: '#f9fafb', // gray-50
    backgroundFromColor: '#111827', // gray-900 (Approximation for gradient)
    backgroundToColor: '#1f2937', // gray-800
    sectionBgColor: '#111827', // gray-900 (Approximation for section bg)
  },
  forest: {
    primaryColor: '#34d399', // emerald-400
    secondaryColor: '#6b7280', // gray-500
    titleColor: '#064e3b', // emerald-900
    h3TitleColor: '#064e3b', // emerald-900
    textColor: '#064e3b', // emerald-900
    backgroundFromColor: '#d1fae5', // emerald-100 (Approximation for gradient)
    backgroundToColor: '#ecfdf5', // emerald-50
    sectionBgColor: '#d1fae5', // emerald-100
  },
  ocean: {
    primaryColor: '#38bdf8', // sky-400
    secondaryColor: '#94a3b8', // slate-400
    titleColor: '#0c4a6e', // sky-900
    h3TitleColor: '#0c4a6e', // sky-900
    textColor: '#0c4a6e', // sky-900
    backgroundFromColor: '#e0f2fe', // sky-100 (Approximation for gradient)
    backgroundToColor: '#f0f9ff', // sky-50
    sectionBgColor: '#e0f2fe', // sky-100
  },
  sunset: {
    primaryColor: '#fb7185', // rose-400
    secondaryColor: '#f97316', // orange-500
    titleColor: '#881337', // rose-900
    h3TitleColor: '#881337', // rose-900
    textColor: '#881337', // rose-900
    backgroundFromColor: '#ffe4e6', // rose-100 (Approximation for gradient)
    backgroundToColor: '#fff1f2', // rose-50
    sectionBgColor: '#ffe4e6', // rose-100
  },
};


const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ onThemeSelect }) => { // Destructure the prop
  // Available themes (UI definition)
  const themes = [
    { name: 'Light', value: 'light', icon: '☀️' },
    { name: 'Dark', value: 'dark', icon: '🌙' },
    { name: 'Forest', value: 'forest', icon: '🌲' },
    { name: 'Ocean', value: 'ocean', icon: '🌊' },
    { name: 'Sunset', value: 'sunset', icon: '🌅' }
  ];

  // Get initial theme from localStorage or default to 'light'
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      // Ensure saved theme is one of the valid keys, otherwise default
      return savedTheme && themeConfigs[savedTheme] ? savedTheme : 'light';
    }
    return 'light';
  });

  // Apply theme class to HTML element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const themeValues = Object.keys(themeConfigs); // Use keys from our config
      document.documentElement.classList.remove(...themeValues);
      document.documentElement.classList.add(currentTheme);
      localStorage.setItem('theme', currentTheme);
    }
  }, [currentTheme]); // Removed themes from dependency array as it's stable

  // Handle theme change
  const handleThemeChange = (newThemeValue: string) => {
    const newThemeData = themeConfigs[newThemeValue];
    if (newThemeData) {
      setCurrentTheme(newThemeValue);
      onThemeSelect(newThemeData); // Call the callback with the selected theme's data
    } else {
      console.warn(`Theme data not found for: ${newThemeValue}`);
    }
  };

  return (
    <div className="theme-switcher">
      {/* Outer container styling might need adjustment based on StyleEditorTab layout */}
      <div className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2 bg-[var(--color-background-secondary)] rounded-lg border border-gray-300 dark:border-gray-700">
        <div className="flex space-x-1">
          {themes.map((theme) => (
            <button
              key={theme.value}
              onClick={() => handleThemeChange(theme.value)} // Use the updated handler
              // Styling uses CSS variables for theme awareness
              className={`p-1 sm:p-2 rounded-md text-xs sm:text-sm transition-colors duration-150 ${
                currentTheme === theme.value
                  ? 'bg-[var(--color-primary)] text-white shadow-md' // Add shadow for active
                  : 'bg-[var(--color-background-secondary)] text-[var(--color-text)] hover:bg-[var(--color-secondary)] hover:text-white'
              }`}
              title={theme.name}
            >
              <span className="flex items-center">
                <span className="mr-1">{theme.icon}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSwitcher;
