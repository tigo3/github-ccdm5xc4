import React from 'react';
import { TranslationsType } from '../../../../types/translations'; // Corrected path

// Define the props the component will accept
interface GeneralInfoSectionProps {
  translations: TranslationsType; // The full translations object
  handleInputChange: (path: (string | number)[], value: string) => void;
  editingPath: string | null;
  setEditingPath: (path: string | null) => void;
  // handleDeleteItem prop is removed as it's not typically used for individual general/about fields
  getStaticSectionName: (key: string) => string; // Pass the utility function
}

// Simple reusable component for rendering an editable field
const EditableField: React.FC<{
  fieldKey: string;
  value: string;
  path: (string | number)[];
  handleChange: (path: (string | number)[], value: string) => void;
  editingPath: string | null;
  setEditingPath: (path: string | null) => void;
}> = ({ fieldKey, value, path, handleChange, editingPath, setEditingPath }) => {
  const keyString = path.join('.');
  const isEditing = editingPath === keyString;
  // Generate a user-friendly label from the key
  const label = fieldKey.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  // Determine if the field is likely a URL based on its key
  const isUrlField = /url|link/i.test(fieldKey);

  return (
    <div key={keyString} className="mb-4">
      <label htmlFor={keyString} className="block text-sm font-medium text-gray-700 capitalize mb-1">
        {label}
      </label>
      {isEditing ? (
        isUrlField ? (
          <input
            type="url" // Use URL type for better mobile keyboard/validation
            id={keyString}
            name={keyString}
            className="block w-full flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white transition-shadow duration-150 ease-in-out"
            value={value}
            onChange={(e) => handleChange(path, e.target.value)}
            onBlur={() => setEditingPath(null)} // Stop editing when focus is lost
            autoFocus // Automatically focus the input when editing starts
          />
        ) : (
          <textarea
            id={keyString}
            name={keyString}
            // Adjust rows based on content length, providing a reasonable default
            rows={value.length > 100 ? 5 : 3}
            className="block w-full flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white transition-shadow duration-150 ease-in-out"
            value={value}
            onChange={(e) => handleChange(path, e.target.value)}
            onBlur={() => setEditingPath(null)} // Stop editing when focus is lost
            autoFocus // Automatically focus the textarea when editing starts
          />
        )
      ) : (
        <div
          className="block w-full flex-1 rounded-md border border-gray-200 bg-gray-50 p-2 cursor-pointer hover:bg-gray-100 min-h-[40px] whitespace-pre-wrap text-gray-800 transition-colors duration-150 ease-in-out break-words" // Adjusted min-height and added break-words
          onClick={() => setEditingPath(keyString)} // Start editing on click
        >
          {/* Display placeholder text if the value is empty */}
          {value || <span className="text-gray-400 italic">Click to edit...</span>}
        </div>
      )}
    </div>
  );
};


const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({
  translations,
  handleInputChange,
  editingPath,
  setEditingPath,
  getStaticSectionName,
}) => {
  // Extract data for easier access
  const generalInfoData = translations.en.generalInfo;
  const aboutData = translations.en.about;

  return (
    // Use CSS Grid: 1 column by default, 2 columns on medium screens and up
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

      {/* General Info Section Column */}
      <div className="space-y-4"> {/* Vertical spacing between elements in this column */}
        {generalInfoData ? (
          // Iterate over generalInfoData entries and render an EditableField for each string value
          Object.entries(generalInfoData).map(([key, value]) => {
            if (typeof value === 'string') {
              return (
                <EditableField
                  key={key}
                  fieldKey={key}
                  value={value}
                  path={['generalInfo', key]} // Construct the path for state updates
                  handleChange={handleInputChange}
                  editingPath={editingPath}
                  setEditingPath={setEditingPath}
                />
              );
            }
            // Add handling for other data types (objects, arrays) within generalInfo if needed in the future
            return null;
          })
        ) : (
          // Display a message if data is missing
          <p className="text-gray-500 italic">General Info data not available.</p>
        )}
      </div>

      {/* About Section Column */}
      <div className="space-y-4"> {/* Vertical spacing between elements in this column */}
         <h3 className="text-xl font-semibold text-gray-800 capitalize border-b border-gray-300 pb-2 mb-4">
           {getStaticSectionName('about')}
         </h3>
        {aboutData ? (
          // Iterate over aboutData entries and render an EditableField for each string value
          Object.entries(aboutData).map(([key, value]) => {
            if (typeof value === 'string') {
              return (
                <EditableField
                  key={key}
                  fieldKey={key}
                  value={value}
                  path={['about', key]} // Construct the path for state updates
                  handleChange={handleInputChange}
                  editingPath={editingPath}
                  setEditingPath={setEditingPath}
                />
              );
            }
             // Add handling for other data types (objects, arrays) within about if needed in the future
            return null;
          })
        ) : (
           // Display a message if data is missing
          <p className="text-gray-500 italic">About section data not available.</p>
        )}
      </div>

    </div>
  );
};

export default GeneralInfoSection;
