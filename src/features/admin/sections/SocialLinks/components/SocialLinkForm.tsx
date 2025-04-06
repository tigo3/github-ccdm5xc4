import React, { useState, useEffect } from 'react';
import { Save, XCircle, HelpCircle } from 'lucide-react';
import { SocialLink } from '../types'; // Corrected path
import { availableIcons, iconComponents } from '../constants/socialLinkConstants'; // Corrected path

interface SocialLinkFormProps {
  initialData?: Omit<SocialLink, 'id'> | null; // Allow null for adding
  isEditing: boolean;
  onSubmit: (data: Omit<SocialLink, 'id'>) => void;
  onCancel: () => void;
}

const SocialLinkForm: React.FC<SocialLinkFormProps> = ({
  initialData,
  isEditing,
  onSubmit,
  onCancel,
}) => {
  const defaultFormData: Omit<SocialLink, 'id'> = { name: '', url: '', icon: availableIcons[0] || '', order: 0 };
  const [formData, setFormData] = useState<Omit<SocialLink, 'id'>>(initialData || defaultFormData);

  // Update form data if initialData changes (e.g., when switching from add to edit)
  useEffect(() => {
    setFormData(initialData || defaultFormData);
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value, 10) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.url || !formData.icon) {
      // Basic validation, more robust validation could be added
      alert("Name, URL, and Icon are required."); // Consider using a toast notification system passed via props if available
      return;
    }
    onSubmit(formData);
  };

  const IconComp = iconComponents[formData.icon] || HelpCircle;

  return (
    // Adjusted styles for light theme
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-md">
      <h3 className="text-xl font-medium mb-4 text-gray-800">{isEditing ? 'Edit Link' : 'Add New Link'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Name Input */}
        <div>
          <label htmlFor="link-name" className="block text-sm font-medium text-gray-600 mb-1">Name</label>
          <input
            id="link-name"
            type="text"
            name="name"
            placeholder="Link Name (e.g., GitHub)"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-white text-gray-800 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            required
          />
        </div>
        {/* URL Input */}
        <div>
          <label htmlFor="link-url" className="block text-sm font-medium text-gray-600 mb-1">URL</label>
          <input
            id="link-url"
            type="url"
            name="url"
            placeholder="Full URL (e.g., https://github.com/user)"
            value={formData.url}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-white text-gray-800 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            required
          />
        </div>
        {/* Icon Select */}
        <div>
          <label htmlFor="link-icon" className="block text-sm font-medium text-gray-600 mb-1">Icon</label>
          <div className="flex items-center gap-2"> {/* Container for select + preview */}
            <select
              id="link-icon"
              name="icon"
              value={formData.icon}
              onChange={handleInputChange}
              className="flex-grow p-2 rounded bg-white text-gray-800 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              required
            >
              <option value="" disabled>Select Icon</option>
              {availableIcons.map(iconName => (
                <option key={iconName} value={iconName}>{iconName}</option>
              ))}
            </select>
            {/* Icon Preview */}
            <IconComp size={24} className="text-gray-500 flex-shrink-0" />
          </div>
        </div>
        {/* Order Input */}
        <div>
          <label htmlFor="link-order" className="block text-sm font-medium text-gray-600 mb-1">Order</label>
          <input
            id="link-order"
            type="number"
            name="order"
            placeholder="Order (e.g., 1)"
            value={formData.order}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-white text-gray-800 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            required
            min="0"
          />
        </div>
      </div>
      <div className="flex items-center gap-3 mt-4">
        {/* Buttons adjusted slightly for better contrast/standard light theme */}
        <button type="submit" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out shadow hover:shadow-md">
          <Save size={18} /> {isEditing ? 'Save Changes' : 'Add Link'}
        </button>
        <button type="button" onClick={onCancel} className="flex items-center gap-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded transition duration-150 ease-in-out shadow hover:shadow-md border border-gray-300">
          <XCircle size={18} /> Cancel
        </button>
      </div>
    </form>
  );
};

export default SocialLinkForm;