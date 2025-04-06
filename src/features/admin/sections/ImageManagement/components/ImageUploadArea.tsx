import React, { useState, DragEventHandler, MouseEventHandler, RefObject } from 'react';

interface ImageUploadAreaProps {
  isDragging: boolean;
  error: string | null;
  previewUrl: string | null; // Add previewUrl prop
  fileInputRef: RefObject<HTMLInputElement>;
  handleDrop: DragEventHandler<HTMLDivElement>;
  handleDragOver: DragEventHandler<HTMLDivElement>;
  handleDragLeave: DragEventHandler<HTMLDivElement>;
  triggerFileInput: MouseEventHandler<HTMLButtonElement>;
  handleInputChange: React.ChangeEventHandler<HTMLInputElement>;
  handleUrlUpload: (url: string) => void;
}

export const ImageUploadArea: React.FC<ImageUploadAreaProps> = ({
  isDragging,
  error,
  previewUrl, // Destructure previewUrl
  fileInputRef,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  triggerFileInput,
  handleInputChange,
  handleUrlUpload,
}) => {
  const [imageUrl, setImageUrl] = useState(''); // State for the URL input

  const handleUrlButtonClick = () => {
    if (imageUrl.trim()) {
      handleUrlUpload(imageUrl.trim());
      setImageUrl(''); // Clear input after triggering upload
    }
  };

  return (
    <div
      className={`w-full max-w-md bg-white rounded-xl shadow-lg p-6 text-center transition-all duration-300 ${isDragging ? 'border-blue-500 border-2' : 'border-gray-200 border'}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <h2 className="text-lg font-medium text-gray-700 mb-2">Upload your image</h2>
      <p className="text-xs text-gray-500 mb-6">File should be Jpeg, Png,...</p>
      {/* Drop Zone Area */}
      <div
        className={`relative bg-gray-50 border-2 border-dashed rounded-xl p-4 mb-6 transition-colors duration-300 min-h-[150px] flex flex-col items-center justify-center ${error ? 'border-red-500' : isDragging ? 'border-blue-400' : 'border-gray-300'} ${isDragging ? 'bg-blue-50' : ''}`}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Image preview"
            className="max-h-36 max-w-full object-contain rounded"
          />
        ) : (
          <>
            {/* Placeholder for image icon */}
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm text-gray-500">Drag & Drop your image here</p>
          </>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-6">Or</p>
      <button
        onClick={triggerFileInput}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
      >
        Choose a file
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*" // Accept any image type initially, validation happens in the hook
        onChange={handleInputChange}
        className="hidden"
        aria-label="File input"
      />
      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

      {/* URL Input Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-3 text-center">Or paste image URL</p>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.png"
            className={`flex-grow px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent text-sm ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
            aria-label="Image URL input"
          />
          <button
            onClick={handleUrlButtonClick}
            disabled={!imageUrl.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Upload URL
          </button>
        </div>
      </div>
    </div>
  );
};