import React, { DragEventHandler, MouseEventHandler, RefObject } from 'react';

interface ImageUploadAreaProps {
  isDragging: boolean;
  error: string | null;
  fileInputRef: RefObject<HTMLInputElement>;
  handleDrop: DragEventHandler<HTMLDivElement>;
  handleDragOver: DragEventHandler<HTMLDivElement>;
  handleDragLeave: DragEventHandler<HTMLDivElement>;
  triggerFileInput: MouseEventHandler<HTMLButtonElement>;
  handleInputChange: React.ChangeEventHandler<HTMLInputElement>;
}

export const ImageUploadArea: React.FC<ImageUploadAreaProps> = ({
  isDragging,
  error,
  fileInputRef,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  triggerFileInput,
  handleInputChange,
}) => {
  return (
    <div
      className={`w-full max-w-md bg-white rounded-xl shadow-lg p-6 text-center transition-all duration-300 ${isDragging ? 'border-blue-500 border-2' : 'border-gray-200 border'}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <h2 className="text-lg font-medium text-gray-700 mb-2">Upload your image</h2>
      <p className="text-xs text-gray-500 mb-6">File should be Jpeg, Png,...</p>
      <div className={`bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-10 mb-6 transition-colors duration-300 ${isDragging ? 'border-blue-400 bg-blue-50' : ''}`}>
        {/* Placeholder for image icon */}
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-sm text-gray-500">Drag & Drop your image here</p>
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
    </div>
  );
};