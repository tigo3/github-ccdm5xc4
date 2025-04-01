// theme-switcher.js
import { useState, useEffect } from 'react';

const ThemeSwitcher = () => {
  // Available themes
  const themes = [
    { name: 'Light', value: 'light', icon: '☀️' },
    { name: 'Dark', value: 'dark', icon: '🌙' },
    { name: 'Forest', value: 'forest', icon: '🌲' },
    { name: 'Ocean', value: 'ocean', icon: '🌊' },
    { name: 'Sunset', value: 'sunset', icon: '🌅' }
  ];

  // Get initial theme from localStorage or default to 'light'
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme || 'light';
    }
    return 'light';
  });

  // Apply theme class to HTML element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Remove all theme classes
      document.documentElement.classList.remove(...themes.map(t => t.value));
      
      // Add current theme class
      document.documentElement.classList.add(currentTheme);
      
      // Save to localStorage
      localStorage.setItem('theme', currentTheme);
    }
  }, [currentTheme]);

  // Handle theme change
  const handleThemeChange = (newTheme) => {
    setCurrentTheme(newTheme);
  };

  return (
    <div className="theme-switcher">
      <div className="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme:</span>
        <div className="flex space-x-1">
          {themes.map((theme) => (
            <button
              key={theme.value}
              onClick={() => handleThemeChange(theme.value)}
              className={`p-2 rounded-md ${
                currentTheme === theme.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              title={theme.name}
            >
              <span className="flex items-center">
                <span className="mr-1">{theme.icon}</span>
                <span className="text-xs">{theme.name}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSwitcher;