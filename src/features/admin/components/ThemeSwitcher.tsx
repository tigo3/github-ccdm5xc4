import React, { useState, useEffect } from 'react'; // Import React

const ThemeSwitcher: React.FC = () => { // Define as Functional Component
  // Available themes
  const themes = [
    { name: 'Light', value: 'light', icon: '☀️' },
    { name: 'Dark', value: 'dark', icon: '🌙' },
    { name: 'Forest', value: 'forest', icon: '🌲' },
    { name: 'Ocean', value: 'ocean', icon: '🌊' },
    { name: 'Sunset', value: 'sunset', icon: '🌅' }
  ];

  // Get initial theme from localStorage or default to 'light'
  const [currentTheme, setCurrentTheme] = useState<string>(() => { // Add type for state
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme || 'light';
    }
    return 'light';
  });

  // Apply theme class to HTML element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Define theme values for removal
      const themeValues = themes.map(t => t.value);
      // Remove all theme classes
      document.documentElement.classList.remove(...themeValues);

      // Add current theme class
      document.documentElement.classList.add(currentTheme);

      // Save to localStorage
      localStorage.setItem('theme', currentTheme);
    }
  }, [currentTheme, themes]); // Include themes in dependency array

  // Handle theme change
  const handleThemeChange = (newTheme: string) => { // Add type for parameter
    setCurrentTheme(newTheme);
  };

  return (
    <div className="theme-switcher">
      <div className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {/* Optional: Hide label on smaller screens if needed */}
        {/* <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">Theme:</span> */}
        <div className="flex space-x-1">
          {themes.map((theme) => (
            <button
              key={theme.value}
              onClick={() => handleThemeChange(theme.value)}
              // Updated styling to use CSS variables for theme awareness
              className={`p-1 sm:p-2 rounded-md text-xs sm:text-sm transition-colors duration-150 ${
                currentTheme === theme.value
                  ? 'bg-[var(--color-primary)] text-white' // Use primary color for active theme
                  : 'bg-[var(--color-background-secondary)] text-[var(--color-text)] hover:bg-[var(--color-secondary)] hover:text-white' // Use theme background/text/secondary for inactive/hover
              }`}
              title={theme.name}
            >
              <span className="flex items-center">
                <span className="mr-1">{theme.icon}</span>
                {/* Optional: Hide name on smaller screens */}
                {/* <span className="hidden sm:inline text-xs">{theme.name}</span> */}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSwitcher;
