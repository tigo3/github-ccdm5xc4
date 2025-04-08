import React, { useState } from 'react';
import { useNotifications } from '../../../../contexts/NotificationContext';
import { Trash2, Edit, ChevronDown, ChevronUp } from 'lucide-react'; // Import icons
import { Project } from './types'; // Import the Project type

// Define the structure for the data prop passed to ProjectsSection
interface ProjectsData {
  title: string;
  // Index signature for project items, ensuring they match the Project type
  [key: string]: Project | string;
}

// Define the props type for the ProjectsSection component
interface ProjectsSectionProps {
  data: ProjectsData; // Expect the whole projects object structure
  path: (string | number)[]; // The base path, e.g., ['projects']
  handleChange: (path: (string | number)[], value: string | string[]) => void; // Allow string[] for tags
  handleAddProject: () => void;
  handleDelete: (path: (string | number)[]) => void; // Path to the project object to delete
  // renderFields, editingPath, setEditingPath are no longer needed
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  data,
  path,
  handleChange,
  handleAddProject,
  handleDelete,
}) => {
  const { requestConfirmation } = useNotifications();
  // State to track the expanded state of each item { projectKey: boolean }
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});

  // Ensure data exists
  if (!data || typeof data !== 'object') {
    return <p className="text-red-500">Error: Projects data is missing or invalid.</p>;
  }

  const sectionTitlePath = [...path, 'title'];

  // Filter out the 'title' key to get only project objects
  const projectEntries = Object.entries(data).filter(
    ([key, value]) => key !== 'title' && typeof value === 'object' && value !== null
  ) as [string, Project][]; // Type assertion

  const toggleItemExpansion = (projectKey: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [projectKey]: !prev[projectKey] // Toggle state for the specific project key
    }));
  };

  // State for the current tag input value for each project
  const [tagInputValue, setTagInputValue] = useState<{ [key: string]: string }>({});

  // Handle adding a new tag
  const handleAddTag = (projectKey: string, projectPath: (string | number)[], currentTags: string[]) => {
    const newTag = (tagInputValue[projectKey] || '').trim();
    if (newTag && !currentTags.includes(newTag)) {
      handleChange(projectPath, [...currentTags, newTag]);
      setTagInputValue(prev => ({ ...prev, [projectKey]: '' })); // Clear input
    } else if (!newTag) {
      // If input is empty but user pressed Enter/Comma, just clear (prevents adding empty tags)
       setTagInputValue(prev => ({ ...prev, [projectKey]: '' }));
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (projectPath: (string | number)[], currentTags: string[], tagToRemove: string) => {
    handleChange(projectPath, currentTags.filter(tag => tag !== tagToRemove));
  };

  // Handle input change for the tag input field
  const handleTagInputChange = (projectKey: string, value: string) => {
     // Prevent adding comma itself as part of the tag
    if (value.endsWith(',')) {
       setTagInputValue(prev => ({ ...prev, [projectKey]: value.slice(0, -1) })); // Update state without comma
    } else {
       setTagInputValue(prev => ({ ...prev, [projectKey]: value }));
    }
  };

  // Handle key down events (Enter or Comma) for adding tags
  const handleTagInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, projectKey: string, projectPath: (string | number)[], currentTags: string[]) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault(); // Prevent form submission or comma appearing in input
      handleAddTag(projectKey, projectPath, currentTags);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Title Input */}
      <div>
        <label htmlFor="projects-section-title" className="block text-sm font-medium text-gray-700 mb-1">
          Section Title
        </label>
        <input
          id="projects-section-title"
          type="text"
          value={typeof data.title === 'string' ? data.title : ''}
          onChange={(e) => handleChange(sectionTitlePath, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter the title for the projects section"
        />
      </div>

      {/* Add New Project Button */}
      <div className="flex justify-end">
        <button
          onClick={handleAddProject}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
          aria-label="Add new project item"
        >
          <Edit size={16} /> Add New Project
        </button>
      </div>

      {/* Project Items List */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-800 border-b pb-2 mb-3">
          Project Items ({projectEntries.length})
        </h3>
        {projectEntries.length === 0 ? (
          <p className="text-gray-500 italic">No projects added yet. Click "Add New Project" to begin.</p>
        ) : (
          projectEntries.map(([projectKey, projectData]) => {
            const projectPath = [...path, projectKey];
            const titlePath = [...projectPath, 'title'];
            const descriptionPath = [...projectPath, 'description'];
            const tagsPath = [...projectPath, 'tags'];
            const linkPath = [...projectPath, 'link'];
            const isExpanded = expandedItems[projectKey] || false; // Default to collapsed

            // Ensure projectData has expected fields (provide defaults if necessary)
            const currentTitle = projectData?.title || '';
            const currentDescription = projectData?.description || '';
            const currentTags = Array.isArray(projectData?.tags) ? projectData.tags : [];
            const currentLink = projectData?.link || '';

            return (
              <div key={projectKey} className="bg-gray-50 rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                {/* Clickable Header */}
                <div
                  className="flex items-center p-3 cursor-pointer hover:bg-gray-100 relative group"
                  onClick={() => toggleItemExpansion(projectKey)}
                  role="button" // Add role for accessibility
                  tabIndex={0} // Make it focusable
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleItemExpansion(projectKey); }} // Keyboard interaction
                  aria-expanded={isExpanded}
                  aria-controls={`project-content-${projectKey}`}
                >
                  {/* Chevron Icon */}
                  <div className="mr-3 text-gray-500">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>

                  {/* Project Title (Display Only in Header) */}
                  <div className="flex-grow mr-2 font-medium text-gray-700 truncate">
                    {currentTitle || `Project: ${projectKey}`} {/* Show title or key */}
                  </div>

                  {/* Delete Button (inside header) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent accordion toggle
                      requestConfirmation({
                        message: `Are you sure you want to delete project "${currentTitle || projectKey}"?\nThis action cannot be undone.`,
                        onConfirm: () => handleDelete(projectPath),
                        confirmText: 'Delete Project',
                        title: 'Confirm Deletion'
                      });
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-1 focus:ring-red-500 rounded-full z-10"
                    aria-label={`Delete project ${currentTitle || projectKey}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Collapsible Content */}
                {isExpanded && (
                  <div id={`project-content-${projectKey}`} className="p-4 border-t border-gray-200 bg-white space-y-4">
                    {/* Project Title Input */}
                    <div>
                      <label htmlFor={`project-title-${projectKey}`} className="block text-sm font-medium text-gray-600 mb-1">
                        Project Title
                      </label>
                      <input
                        id={`project-title-${projectKey}`}
                        type="text"
                        value={currentTitle}
                        onChange={(e) => handleChange(titlePath, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter project title"
                      />
                    </div>

                    {/* Project Description Input */}
                    <div>
                      <label htmlFor={`project-description-${projectKey}`} className="block text-sm font-medium text-gray-600 mb-1">
                        Description
                      </label>
                      <textarea
                        id={`project-description-${projectKey}`}
                        value={currentDescription}
                        onChange={(e) => handleChange(descriptionPath, e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter project description"
                      />
                    </div>

                    {/* Improved Project Tags Input */}
                    <div>
                      <label htmlFor={`project-tags-input-${projectKey}`} className="block text-sm font-medium text-gray-600 mb-1">
                        Tags (add with Enter or comma)
                      </label>
                      <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-md bg-white">
                        {currentTags.map((tag, index) => (
                          <span key={index} className="flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tagsPath, currentTags, tag)}
                              className="ml-1.5 text-blue-600 hover:text-blue-800 focus:outline-none"
                              aria-label={`Remove tag ${tag}`}
                            >
                              &times; {/* Multiplication sign as 'x' */}
                            </button>
                          </span>
                        ))}
                        <input
                          id={`project-tags-input-${projectKey}`}
                          type="text"
                          value={tagInputValue[projectKey] || ''}
                          onChange={(e) => handleTagInputChange(projectKey, e.target.value)}
                          onKeyDown={(e) => handleTagInputKeyDown(e, projectKey, tagsPath, currentTags)}
                          className="flex-grow px-1 py-0.5 border-none focus:ring-0 focus:outline-none text-sm"
                          placeholder={currentTags.length === 0 ? "e.g., react, typescript" : "Add tag..."}
                        />
                      </div>
                    </div>

                    {/* Project Link Input */}
                    <div>
                      <label htmlFor={`project-link-${projectKey}`} className="block text-sm font-medium text-gray-600 mb-1">
                        Project Link (URL)
                      </label>
                      <input
                        id={`project-link-${projectKey}`}
                        type="url"
                        value={currentLink}
                        onChange={(e) => handleChange(linkPath, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProjectsSection;
