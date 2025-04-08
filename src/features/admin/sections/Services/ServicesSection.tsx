import React, { useState } from 'react';
import { Trash2, Edit, ChevronDown, ChevronUp } from 'lucide-react'; // Import icons
import { useNotifications } from '../../../../contexts/NotificationContext'; // Import notification hook

import { ServiceItem } from './types';

interface ServicesData {
  title: string;
  list: ServiceItem[];
}

interface ServicesSectionProps {
  data: ServicesData;
  path: (string | number)[];
  handleChange: (path: (string | number)[], value: string) => void;
  handleDelete: (path: (string | number)[], index?: number) => void;
  handleAddService: () => void;
  // editingPath and setEditingPath are not used in this version
}

const ServicesSection: React.FC<ServicesSectionProps> = ({
  data,
  path,
  handleChange,
  handleDelete,
  handleAddService,
}) => {
  const { requestConfirmation } = useNotifications(); // Get confirmation function
  // State to track the expanded state of each item { index: boolean }
  const [expandedItems, setExpandedItems] = useState<{ [key: number]: boolean }>({});

  // Ensure data and data.list exist before rendering
  if (!data || typeof data !== 'object') {
    return <p className="text-red-500">Error: Services data is missing or invalid.</p>;
  }
  const servicesList = Array.isArray(data.list) ? data.list : [];
  const sectionTitlePath = [...path, 'title'];

  const toggleItemExpansion = (index: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index] // Toggle the state for the specific index
    }));
  };

  return (
    <div className="space-y-6">
      {/* Section Title Input */}
      <div>
        <label htmlFor="services-section-title" className="block text-sm font-medium text-gray-700 mb-1">
          Section Title
        </label>
        <input
          id="services-section-title"
          type="text"
          value={data.title || ''}
          onChange={(e) => handleChange(sectionTitlePath, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter the title for the services section"
        />
      </div>

      {/* Add New Service Button */}
      <div className="flex justify-end">
        <button
          onClick={handleAddService}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2"
          aria-label="Add new service item"
        >
          <Edit size={16} /> Add New Service
        </button>
      </div>

      {/* Service Items List */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-800 border-b pb-2 mb-3">
          Service Items ({servicesList.length})
        </h3>
        {servicesList.length === 0 ? (
          <p className="text-gray-500 italic">No services added yet. Click "Add New Service" to begin.</p>
        ) : (
          servicesList.map((service, index) => {
            const itemBasePath = [...path, 'list', index];
            const titlePath = [...itemBasePath, 'title'];
            const descriptionPath = [...itemBasePath, 'description'];
            const isExpanded = expandedItems[index] || false; // Default to collapsed

            return (
              <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                {/* Clickable Header */}
                <div
                  className="flex items-center p-3 cursor-pointer hover:bg-gray-100 relative group"
                  onClick={() => toggleItemExpansion(index)}
                  role="button" // Add role for accessibility
                  tabIndex={0} // Make it focusable
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleItemExpansion(index); }} // Keyboard interaction
                  aria-expanded={isExpanded}
                  aria-controls={`service-content-${index}`} // Link to content
                >
                  {/* Chevron Icon */}
                  <div className="mr-3 text-gray-500">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>

                  {/* Service Title Input (inside header) */}
                  <div className="flex-grow mr-2">
                    <label htmlFor={`service-title-${index}`} className="sr-only">
                      Service Title #{index + 1}
                    </label>
                    <input
                      id={`service-title-${index}`}
                      type="text"
                      value={service.title || ''}
                      onChange={(e) => {
                        e.stopPropagation(); // Prevent accordion toggle when typing in title
                        handleChange(titlePath, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()} // Prevent toggle on click inside input
                      className="w-full px-2 py-1 border border-transparent rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-transparent hover:border-gray-300 focus:bg-white"
                      placeholder={`Service Title #${index + 1}`}
                    />
                  </div>

                  {/* Delete Button (inside header) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent accordion toggle
                      requestConfirmation({
                        message: `Are you sure you want to delete service "${service.title || `Item #${index + 1}`}"?\nThis action cannot be undone.`,
                        onConfirm: () => handleDelete([...path, 'list', index]), // Pass the full path including index
                        confirmText: 'Delete Service',
                        title: 'Confirm Deletion'
                      });
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-1 focus:ring-red-500 rounded-full z-10" // Ensure button is clickable over input hover styles
                    aria-label={`Delete service ${index + 1}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Collapsible Content (Description) */}
                {isExpanded && (
                  <div id={`service-content-${index}`} className="p-4 border-t border-gray-200 bg-white">
                    <label htmlFor={`service-description-${index}`} className="block text-sm font-medium text-gray-600 mb-1">
                      Description
                    </label>
                    <textarea
                      id={`service-description-${index}`}
                      value={service.description || ''}
                      onChange={(e) => handleChange(descriptionPath, e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter service description"
                    />
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

export default ServicesSection;
