import React from 'react';
import { TranslationsType } from '../types'; // Assuming types are defined here
import { renderFields } from '../utils'; // Import only renderFields

// Define the props the component will accept
interface GeneralInfoTabProps {
  translations: TranslationsType; // The full translations object
  handleInputChange: (path: (string | number)[], value: string) => void;
  editingPath: string | null;
  setEditingPath: (path: string | null) => void;
  handleDeleteItem: (path: (string | number)[]) => Promise<void>; // Assuming it's async
  renderFields: typeof renderFields; // Use typeof to get the function's type
  getStaticSectionName: (key: string) => string; // Pass the utility function
}

const GeneralInfoTab: React.FC<GeneralInfoTabProps> = ({
  translations,
  handleInputChange,
  editingPath,
  setEditingPath,
  handleDeleteItem,
  renderFields, // Use the passed renderFields
  getStaticSectionName, // Use the passed utility
}) => {
  // Ensure the necessary data exists before trying to render
  const generalInfoData = translations.en.generalInfo;
  const aboutData = translations.en.about;

  if (!generalInfoData) {
    // Handle the case where generalInfo data might be missing
    // This could be a loading state, an error message, or null
    // depending on how you want to handle missing initial data.
    console.warn("General Info data is missing.");
    // return <p>Loading General Info...</p>; // Or some other placeholder
  }

  return (
    <>
      {/* Render General Info section fields if data exists */}
      {generalInfoData && renderFields(
        generalInfoData,
        ['generalInfo'], // Path for the generalInfo section data
        handleInputChange,
        editingPath,
        setEditingPath,
        undefined, // No specific add handler for general fields here
        handleDeleteItem
      )}

      {/* Render About section content if data exists */}
      {aboutData && (
        <>
          <h4 className="text-lg font-semibold mt-6 mb-3 text-gray-600 capitalize">
            {getStaticSectionName('about')} Content (Merged)
          </h4>
          {renderFields(
            aboutData,
            ['about'], // Path for the about section data
            handleInputChange,
            editingPath,
            setEditingPath,
            undefined, // No specific add handler for general fields here
            handleDeleteItem
          )}
        </>
      )}
      {/* Display a message if aboutData is missing, if desired */}
      {!aboutData && (
         <p className="mt-4 text-gray-500">About section data not found.</p>
      )}
    </>
  );
};

export default GeneralInfoTab;
