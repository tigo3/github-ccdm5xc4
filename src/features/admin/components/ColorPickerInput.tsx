import React from 'react';
import { Copy } from 'lucide-react';
import { useNotifications } from '../../../contexts/NotificationContext';

interface ColorPickerInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

const ColorPickerInput: React.FC<ColorPickerInputProps> = ({
  label,
  value,
  onChange,
  description,
}) => {
  const { showToast } = useNotifications();

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Basic validation for hex format as user types
    const newValue = e.target.value;
    if (newValue.match(/^#?[0-9A-Fa-f]{0,6}$/)) {
      onChange(newValue.startsWith('#') ? newValue : `#${newValue}`);
    }
  };

  const handleHexInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Ensure full hex code on blur if valid prefix
    let finalValue = e.target.value;
    if (!finalValue.startsWith('#')) finalValue = `#${finalValue}`;

    // Pad with zeros if incomplete but valid start (e.g., #abc -> #abc000)
    if (finalValue.length > 1 && finalValue.length < 7) {
      finalValue = finalValue.padEnd(7, finalValue.substring(finalValue.length - 1).repeat(7 - finalValue.length)); // Pad with last char
      // A simpler padding strategy: finalValue = finalValue.padEnd(7, '0');
    }

    if (finalValue.match(/^#[0-9A-Fa-f]{6}$/i)) {
      onChange(finalValue);
    } else {
      // Revert to original valid value if invalid on blur
      onChange(value); // Revert to the last known valid value passed in props
      showToast("Invalid hex color format. Reverted.", 'error');
    }
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(value);
    showToast('Color code copied!', 'success');
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
        <input
          type="color"
          value={value} // Ensure the color picker itself uses the validated hex value
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-10 p-1 border border-gray-300 rounded cursor-pointer self-start sm:self-center bg-white" // Removed dark: classes
        />
        <input
          type="text"
          value={value}
          onChange={handleHexInputChange}
          onBlur={handleHexInputBlur}
          className="w-full sm:flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900" // Removed dark: classes
          maxLength={7}
          placeholder="#rrggbb"
        />
        <button
          onClick={handleCopyClick}
          className="p-2 text-gray-500 hover:text-gray-700 self-start sm:self-center" // Removed dark: classes
          title="Copy color code"
          type="button" // Prevent form submission if wrapped in a form
        >
          <Copy size={20} />
        </button>
      </div>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p> // Removed dark: class
      )}
    </div>
  );
};

export default ColorPickerInput;