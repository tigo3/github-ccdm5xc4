import React from 'react';
// Removed unused import for utils - functions are passed as props

// Define the type for the keys of the 'en' object in translations
// We might need to import defaultTranslations here too, or pass the type
// For simplicity, let's assume isValidTranslationKey handles the type check internally
// based on how it's defined in utils.tsx

interface AdminTabsProps {
  activeTab: string | null;
  setActiveTab: (tab: string | null) => void;
  // Pass the utility functions as props
  isValidTranslationKey: (key: string | null) => boolean;
  getStaticSectionName: (key: string) => string;
}

// Define the order of tabs
const TAB_ORDER = ['generalInfo', 'socialLinks', 'projects', 'services', 'pages', 'contact', 'styleEditor'];

const AdminTabs: React.FC<AdminTabsProps> = ({
  activeTab,
  setActiveTab,
  isValidTranslationKey,
  getStaticSectionName,
}) => {
  return (
    <div className="mb-6 border-b border-gray-300">
      <nav className="-mb-px flex space-x-4 sm:space-x-6 overflow-x-auto pb-px" aria-label="Tabs">
        {TAB_ORDER.map((key) => {
          let tabTitle: string;

          // Determine tab title based on key
          if (key === 'styleEditor') {
            tabTitle = 'Style Editor';
          } else if (key === 'socialLinks') {
            tabTitle = 'Social Links';
          } else if (key === 'pages') {
            tabTitle = 'Pages'; // Add specific handling for 'pages'
          } else if (isValidTranslationKey(key)) {
            // Use the static helper function for dynamic tabs
            tabTitle = getStaticSectionName(key);
          } else {
            // Skip rendering if the key is invalid (shouldn't happen with the hardcoded array)
            console.warn(`Invalid tab key encountered in TAB_ORDER: ${key}`);
            return null;
          }

          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`${
                activeTab === key
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-3 px-3 border-b-2 font-medium text-sm capitalize transition-colors duration-150`}
              aria-current={activeTab === key ? 'page' : undefined}
            >
              {tabTitle}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminTabs;
