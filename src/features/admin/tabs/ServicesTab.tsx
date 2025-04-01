import React from 'react';

// Define the structure of a single service item
interface ServiceItem {
  title: string;
  description: string;
  // Add other fields if necessary, e.g., icon: string;
}

// Define the structure for the data prop passed to ServicesTab
// Matches the 'services' structure in EnglishTranslations (types.ts)
interface ServicesData {
  title: string; // Title for the services section
  list: ServiceItem[]; // Array of service items (corrected from 'items')
  // Add other top-level fields for the services section if they exist
}

// Define the props type for the ServicesTab component
interface ServicesTabProps {
  data: ServicesData; // Expect the whole services object structure
  path: (string | number)[]; // The base path, e.g., ['services']
  handleChange: (path: (string | number)[], value: string) => void;
  editingPath: string | null;
  setEditingPath: (path: string | null) => void;
  handleDelete: (path: (string | number)[]) => void; // To delete an item from the array or a field
  handleAddService: () => void; // Function to add a new service item to the 'items' array
  renderFields: ( // Pass the original renderFields function
    data: any,
    path: (string | number)[],
    handleChange: (path: (string | number)[], value: string) => void,
    editingPath: string | null,
    setEditingPath: (path: string | null) => void,
    handleAdd?: () => void,
    handleDelete?: (path: (string | number)[]) => void
  ) => React.ReactNode;
}

const ServicesTab: React.FC<ServicesTabProps> = ({
  data,
  path,
  handleChange,
  editingPath,
  setEditingPath,
  handleDelete,
  handleAddService, // Receive add handler prop
  renderFields, // Receive renderFields as a prop
}) => {
  // Ensure data and data.items exist before rendering the button and fields
  if (!data || typeof data !== 'object') {
    return <p>Error: Services data is missing or invalid.</p>;
  }
  // Check for the 'list' array
  if (!Array.isArray(data.list)) {
     // Or render an error/message
     console.warn("Services data is missing 'list' array.");
     // It's better to handle initialization in the state update logic (AdminDashboard)
     // rather than trying to mutate props here.
  }


  return (
    <>
      {/* Button to trigger adding a new service item to the 'list' array */}
      <button
        onClick={handleAddService}
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-opacity-50"
        aria-label="Add new service item"
      >
        Add New Service Item
      </button>

      {/* Use the passed renderFields function to render the entire services section */}
      {/* renderFields will handle the 'title' field and iterate through the 'list' array */}
      {renderFields(
        data, // Pass the whole services object (e.g., { title: '...', list: [...] })
        path, // Pass the base path for the services object (e.g., ['services'])
        handleChange,
        editingPath,
        setEditingPath,
        undefined, // renderFields handles add/delete internally based on array/object structure and passed handlers
        handleDelete // Pass the delete handler
      )}
    </>
  );
};

export default ServicesTab;
