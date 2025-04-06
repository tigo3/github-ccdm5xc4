import React from 'react';
import { UploadStatus } from '../types/imageUploaderTypes';

interface ImageUploadStatusProps {
  status: UploadStatus;
  previewUrl: string | null;
  uploadedUrl: string | null;
  error: string | null;
  copyButtonText: string;
  handleCopyLink: () => void;
  resetState: () => void; // Function to go back to the idle state
}

export const ImageUploadStatus: React.FC<ImageUploadStatusProps> = ({
  status,
  previewUrl,
  uploadedUrl,
  error,
  copyButtonText,
  handleCopyLink,
  resetState,
}) => {
  const renderProcessingState = (message: string) => (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 text-center relative">
      {previewUrl && (
        <div className="mb-4 rounded-xl overflow-hidden border border-gray-200 opacity-50">
          <img src={previewUrl} alt="Processing preview" className="max-w-full max-h-48 object-contain mx-auto" />
        </div>
      )}
      <div className={`absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-75 rounded-xl ${!previewUrl ? 'relative' : ''}`}>
        {/* Simple spinner */}
        <svg className="animate-spin mx-auto h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h2 className="text-lg font-medium text-gray-700">{message}</h2>
      </div>
    </div>
  );

  const renderSuccessState = () => (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 text-center">
      {/* Checkmark icon */}
      <svg className="mx-auto h-10 w-10 text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
      <h2 className="text-lg font-medium text-gray-700 mb-4">Uploaded Successfully!</h2>
      {previewUrl && (
        <div className="mb-6 rounded-xl overflow-hidden border border-gray-200">
          <img src={previewUrl} alt="Uploaded preview" className="max-w-full max-h-64 object-contain mx-auto" />
        </div>
      )}
      <div className="flex items-center border border-gray-300 rounded-lg p-2 bg-gray-50 mb-4">
        <input
          type="text"
          value={uploadedUrl ?? ''}
          readOnly
          className="flex-grow text-xs text-gray-700 bg-transparent border-none focus:ring-0 p-1 truncate"
          aria-label="Uploaded image link"
        />
        <button
          onClick={handleCopyLink}
          className="ml-2 px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-300 flex-shrink-0"
        >
          {copyButtonText}
        </button>
      </div>
       <button
        onClick={resetState}
        className="text-sm text-blue-600 hover:underline"
      >
        Upload another image
      </button>
    </div>
  );

  const renderErrorState = () => (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 text-center">
      {/* Error icon */}
       <svg className="mx-auto h-10 w-10 text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <h2 className="text-lg font-medium text-gray-700 mb-2">Upload Failed</h2>
      <p className="text-red-500 text-sm mb-6">{error || 'An unknown error occurred.'}</p>
      {previewUrl && (
        <div className="mb-4 rounded-xl overflow-hidden border border-gray-200 opacity-70">
          <img src={previewUrl} alt="Upload failed preview" className="max-w-full max-h-48 object-contain mx-auto" />
        </div>
      )}
      <button
        onClick={resetState}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
      >
        Try Again
      </button>
    </div>
  );

  switch (status) {
    case 'fetching_url':
        return renderProcessingState('Fetching image from URL...');
    case 'uploading':
      return renderProcessingState('Uploading...');
    case 'success':
      return renderSuccessState();
    case 'error':
      return renderErrorState();
    default: // Should not happen if used correctly, but good practice
      return null;
  }
};