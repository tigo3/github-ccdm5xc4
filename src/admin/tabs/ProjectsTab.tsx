import React from 'react';

// Define the props type for the ProjectsTab component
interface ProjectsTabProps {
  data: any; // The 'projects' object from translations.en
  path: (string | number)[]; // The base path, e.g., ['projects']
  handleChange: (path: (string | number)[], value: string) => void;
  editingPath: string | null;
  setEditingPath: (path: string | null) => void;
  handleAddProject: () => void;
  handleDelete: (path: (string | number)[]) => void;
  renderFields: ( // Pass the original renderFields function for nested rendering
    data: any,
    path: (string | number)[],
    handleChange: (path: (string | number)[], value: string) => void,
    editingPath: string | null,
    setEditingPath: (path: string | null) => void,
    handleAddProject?: () => void,
    handleDelete?: (path: (string | number)[]) => void
  ) => React.ReactNode;
}

const ProjectsTab: React.FC<ProjectsTabProps> = ({
  data,
  path,
  handleChange,
  editingPath,
  setEditingPath,
  handleAddProject,
  handleDelete,
  renderFields, // Receive renderFields as a prop
}) => {
  // This logic is adapted from the original renderFields function's special handling for 'projects'
  return (
    <div key={path.join('.')} className="mb-6 p-4 border border-gray-200 rounded">
      <div className="flex justify-between items-center mb-3">
        {/* Use the title from the data if available, otherwise fallback */}
        <h4 className="text-lg font-semibold capitalize">
          {data?.title || String(path[0]).replace(/([A-Z])/g, ' $1')}
        </h4>
        <button
          onClick={handleAddProject}
          className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline"
        >
          + Add Project
        </button>
      </div>

      {/* Render the main 'projects' title field if it exists */}
      {data?.title !== undefined && typeof data.title === 'string' && (
         renderFields({ title: data.title }, path, handleChange, editingPath, setEditingPath, undefined, undefined)
      )}


      {/* Render the actual project cards */}
      {Object.entries(data).map(([key, value]) => {
        // Check if the key represents a project (exclude the 'title' field)
        if (key !== 'title' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
          const projectPath = [...path, key];
          return (
            <div key={projectPath.join('.')} className="mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm relative">
              <div className="flex justify-between items-start mb-3">
                <h5 className="text-lg font-semibold text-gray-700 mr-4">
                  Project: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{key}</span>
                </h5>
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete project "${key}"?`)) {
                      handleDelete(projectPath);
                    }
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline transition-colors duration-150"
                  aria-label={`Delete project ${key}`}
                >
                  Delete Project
                </button>
              </div>
              {/* Render project fields within the card using the passed renderFields */}
              <div className="space-y-4">
                {renderFields(value, projectPath, handleChange, editingPath, setEditingPath, undefined, handleDelete)}
              </div>
            </div>
          );
        }
        return null; // Ignore other direct children like 'title' here
      })}
    </div>
  );
};

export default ProjectsTab;
