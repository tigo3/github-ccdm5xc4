import { translations as defaultTranslations } from '../../../../config/translations';

// Define the type for the keys of the 'en' object in translations based on the imported default
// This might be better placed in a shared types file if used elsewhere, but keep here for now if only used by isValidTranslationKey
type TranslationSectionKey = keyof typeof defaultTranslations.en;

// Helper function to recursively render form fields for nested objects
export const renderFields = (
    data: any,
    path: (string | number)[],
    handleChange: (path: (string | number)[], value: string) => void,
    editingPath: string | null, // Pass editing state down
    setEditingPath: (path: string | null) => void, // Pass setter down
    handleAddProject?: () => void, // Optional callback for adding projects
    handleDelete?: (path: (string | number)[]) => void // Optional callback for deleting items
    ) => {
  // Special handling for the main 'projects' object to add the "Add Project" button
  if (path.length === 1 && path[0] === 'projects' && typeof data === 'object' && data !== null && !Array.isArray(data)) {
      return (
          <div key={path.join('.')} className="mb-6 p-4 border border-gray-200 rounded">
              <div className="flex justify-between items-center mb-3">
                 <h4 className="text-lg font-semibold capitalize">{String(path[0]).replace(/([A-Z])/g, ' $1')}</h4>
                 {handleAddProject && (
                      <button
                          onClick={handleAddProject}
                          className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline"
                      >
                          + Add Project
                      </button>
                  )}
              </div>
              {/* Render the actual project fields */}
              {Object.entries(data).map(([key, value]) => {
                  // Check if the key represents a project (Improved Card Styling)
                  // Assuming 'value' here conforms to the 'Project' interface structure
                  if (key !== 'title' && typeof value === 'object' && value !== null && !Array.isArray(value)) { // Exclude the main 'projects' title from this block
                      const projectPath = [...path, key];
                      // Use more distinct card styling
                      return (
                          <div key={projectPath.join('.')} className="mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm relative">
                              <div className="flex justify-between items-start mb-3"> {/* Use items-start for better alignment */}
                                {/* Display the project key/ID - consider making this editable later */}
                                <h5 className="text-lg font-semibold text-gray-700 mr-4">Project: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{key}</span></h5>
                                {handleDelete && (
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`Are you sure you want to delete project "${key}"?`)) {
                                                handleDelete(projectPath);
                                            }
                                        }}
                                        // Slightly larger delete button, moved to top right
                                        className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline transition-colors duration-150"
                                        aria-label={`Delete project ${key}`}
                                    >
                                        Delete Project
                                    </button>
                                )}
                              </div>
                              {/* Render project fields within the card */}
                              <div className="space-y-4"> {/* Add spacing between fields */}
                                {/* Pass undefined for project-specific handlers */}
                                {renderFields(value, projectPath, handleChange, editingPath, setEditingPath, undefined, handleDelete)}
                              </div>
                          </div>
                      );
                  } else if (key === 'title' && typeof value === 'string') {
                    // Render the main 'projects' title field (click-to-edit)
                    const titlePath = [...path, key];
                    const titleKeyString = titlePath.join('.');
                    const isEditingTitle = editingPath === titleKeyString;
                    return (
                        <div key={titleKeyString} className="mb-4">
                            <label htmlFor={titleKeyString} className="block text-sm font-medium text-gray-700 capitalize mb-1">
                                {key.replace(/([A-Z])/g, ' $1')}
                            </label>
                            {isEditingTitle ? (
                                <input
                                    type="text"
                                    id={titleKeyString}
                                    name={titleKeyString}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                                    value={value}
                                    onChange={(e) => handleChange(titlePath, e.target.value)}
                                    onBlur={() => setEditingPath(null)}
                                    autoFocus
                                />
                            ) : (
                                <div
                                    className="mt-1 block w-full rounded-md border border-transparent p-2 cursor-pointer hover:bg-gray-100 min-h-[38px]"
                                    onClick={() => setEditingPath(titleKeyString)}
                                >
                                    {value || <span className="text-gray-400 italic">Click to edit...</span>}
                                </div>
                            )}
                        </div>
                    );
                 }
                  return null; // Ignore other direct children of 'projects' object if any
              })}
          </div>
      );
  }


  // Original rendering logic for other fields
  return Object.entries(data).map(([key, value]) => {
    const currentPath = [...path, key];
    const keyString = currentPath.map(String).join('.');
    const isEditing = editingPath === keyString;

    if (typeof value === 'string') {
      return (
        // Add responsive padding to the container div for slight spacing adjustment on mobile
        <div key={keyString} className="mb-4 px-1 sm:px-0">
          <label htmlFor={keyString} className="block text-sm font-medium text-gray-700 capitalize mb-1">
            {/* More descriptive labels */}
            {key.replace(/([A-Z])/g, ' $1')}
          </label>
          {isEditing ? (
            <textarea
              id={keyString}
              name={keyString}
              rows={value.length > 100 ? 4 : 2} // Keep dynamic rows
              // Removed mt-1, label already has mb-1. Ensure consistent padding. Added flex-1.
              className="block w-full flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white"
              value={value}
              onChange={(e) => handleChange(currentPath, e.target.value)}
              onBlur={() => setEditingPath(null)} // Hide input on blur
              autoFocus // Focus when editing starts
            />
          ) : (
            // Improved display for non-editing state
            <div
              // Removed mt-1, label already has mb-1. Ensure consistent padding. Added flex-1.
              className="block w-full flex-1 rounded-md border border-gray-200 bg-gray-50 p-2 cursor-pointer hover:bg-gray-100 min-h-[50px] whitespace-pre-wrap text-gray-800"
              onClick={() => setEditingPath(keyString)} // Enable editing on click
            >
              {value || <span className="text-gray-400 italic">Click to edit...</span>}
            </div>
          )}
        </div>
      );
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
       // This case handles nested objects *within* a project field if any (unlikely for current structure)
       // Or handles other top-level sections like 'services'
      // Render nested object fields
      return (
        <div key={keyString} className="mb-6 p-4 border border-gray-200 rounded">
          <h4 className="text-lg font-semibold mb-3 capitalize">{String(key).replace(/([A-Z])/g, ' $1')}</h4>
          {/* Pass editing state down */}
          {renderFields(value, currentPath, handleChange, editingPath, setEditingPath, undefined, handleDelete)}
        </div>
      );
    } else if (Array.isArray(value)) {
       // Handle arrays (e.g., project tags, or items in other sections like 'services')
       // Assuming 'item' here conforms to 'ServiceItem' if path[0] is 'services'
       return (
         // Keep styling consistent for array sections
         <div key={keyString} className="mb-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
           <h4 className="text-lg font-semibold mb-3 capitalize text-gray-700">{String(key).replace(/([A-Z])/g, ' $1')}</h4>
           {/* Add button for arrays (e.g., Add Tag) - Placeholder for future enhancement */}
           {/* <button className="text-sm text-blue-600 hover:text-blue-800 mb-3">+ Add Item</button> */}
           <div className="space-y-3"> {/* Add spacing for array items */}
             {value.map((item, index) => {
               const itemPath = [...currentPath, index];
               const itemKeyString = itemPath.map(String).join('.');
               const isEditingItem = editingPath === itemKeyString;

               if (typeof item === 'string') {
                  // Simple array of strings (like tags) - Improved styling
                  return (
                      <div key={itemKeyString} className="flex items-center space-x-2">
                          {isEditingItem ? (
                              <input
                                  type="text"
                                  id={itemKeyString}
                                  name={itemKeyString}
                                  className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white"
                                  value={item}
                                  onChange={(e) => handleChange(itemPath, e.target.value)}
                                  onBlur={() => setEditingPath(null)}
                                  autoFocus
                              />
                          ) : (
                              <div
                                  className="flex-grow rounded-md border border-gray-200 bg-gray-50 p-2 cursor-pointer hover:bg-gray-100 min-h-[38px] text-gray-800"
                                  onClick={() => setEditingPath(itemKeyString)}
                              >
                                  {item || <span className="text-gray-400 italic">Click to edit...</span>}
                              </div>
                          )}
                          {handleDelete && ( // Keep delete button for array items
                              <button
                                  onClick={() => {
                                      if (window.confirm(`Are you sure you want to delete this item?`)) {
                                          handleDelete(itemPath);
                                      }
                                  }}
                                  className="bg-red-400 hover:bg-red-600 text-white text-xs font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline transition-colors duration-150"
                                  aria-label={`Delete item ${index + 1}`}
                              >
                                  Delete
                              </button>
                          )}
                      </div>
                  );
               } else if (typeof item === 'object' && item !== null) {
                 // Array of objects (like services) - Keep existing structure but apply consistent styling
                 return ( // <<< Return for object item
                   <div key={itemKeyString} className="mb-4 p-3 border border-gray-100 rounded relative"> {/* Added relative */}
                    <div className="flex justify-between items-center mb-2"> {/* Wrapper for title and delete button */}
                        <h5 className="text-md font-medium">Item {index + 1}</h5>
                        {handleDelete && ( // Add delete button for array items (objects)
                            <button
                                onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete Item ${index + 1}?`)) {
                                        handleDelete(itemPath);
                                    }
                                }}
                                className="bg-red-400 hover:bg-red-600 text-white text-xs font-bold py-0.5 px-1.5 rounded focus:outline-none focus:shadow-outline"
                                aria-label={`Delete item ${index + 1}`}
                            >
                                Delete
                            </button>
                        )}
                    </div>
                   {/* Pass editing state and delete handler down */}
                   {renderFields(item, itemPath, handleChange, editingPath, setEditingPath, undefined, handleDelete)}
                 </div>
               );
             }
             return null;
           })}
           </div> {/* <<< Closing div for space-y-3 */}
         </div> // <<< Closing div for array section container
       );
    }
    return null;
  });
};

// Type guard to check if a key is a valid TranslationSectionKey
export const isValidTranslationKey = (key: string | null): key is TranslationSectionKey => {
  if (key === null) return false;
  // Check against the keys of the imported default translations
  return key in defaultTranslations.en;
};