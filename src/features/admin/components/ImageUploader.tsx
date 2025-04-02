import { useState, ChangeEvent, DragEvent, useRef } from 'react'; // Removed useMemo
import supabase from '../../../config/supabaseConfig'; // Import Supabase client

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

const BUCKET_NAME = 'img'; // Define bucket name

const ImageUploader = ({ onUploadSuccess }: { onUploadSuccess?: (url: string) => void }) => {
  // Removed Firebase storage initialization

  const [status, setStatus] = useState<UploadStatus>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Removed progress state
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('Copy Link');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError(null);
      setStatus('idle'); // Reset status if a new file is selected
      setUploadedUrl(null); // Clear previous upload URL
      setPreviewUrl(URL.createObjectURL(file)); // Create preview for success state
      // Automatically start upload after selection
      handleUpload(file);
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
      if (file) { // If a file was selected but wasn't an image
        setError('Please select an image file.');
      }
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event.target.files?.[0] ?? null);
     // Reset file input value to allow selecting the same file again
     if (event.target) {
        event.target.value = '';
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    handleFileSelect(event.dataTransfer.files?.[0] ?? null);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    // Check if the relatedTarget (where the mouse is going) is outside the drop zone
     if (!event.currentTarget.contains(event.relatedTarget as Node)) {
        setIsDragging(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (fileToUpload: File) => {
    // Check if Supabase client is initialized
    if (!supabase) {
      setError('Supabase client is not initialized. Check configuration.');
      setStatus('error');
      return;
    }
    if (!fileToUpload) {
      setError('No file selected for upload.');
      setStatus('error');
      return;
    }

    setStatus('uploading');
    setError(null);
    // setProgress(0); // Progress removed
    setCopyButtonText('Copy Link');

    const timestamp = Date.now();
    // Define a file path matching the policy: public/timestamp_filename.jpg
    const filePath = `public/${timestamp}_${fileToUpload.name}`;

    try {
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, fileToUpload, {
          cacheControl: '3600', // Optional: Cache control header
          upsert: false, // Optional: Don't overwrite existing file with same name
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        throw uploadError; // Throw error to be caught below
      }

      console.log('Supabase upload successful:', uploadData);

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      if (!urlData || !urlData.publicUrl) {
           console.error('Could not get public URL for:', filePath);
           throw new Error('Failed to retrieve public URL after upload.');
      }

      const publicUrl = urlData.publicUrl;
      console.log('File available at:', publicUrl);
      setUploadedUrl(publicUrl);
      setStatus('success');
      if (onUploadSuccess) {
        onUploadSuccess(publicUrl);
      }
      // Keep selectedFile and previewUrl for the success screen

    } catch (err) {
      console.error("Upload process failed:", err);
      setError(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setStatus('error');
      // Optionally clear preview/selection on error
      // setSelectedFile(null);
      // setPreviewUrl(null);
    }
  };

   const handleCopyLink = async () => {
    if (!uploadedUrl) return;
    try {
      await navigator.clipboard.writeText(uploadedUrl);
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy Link'), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
      setError('Failed to copy link to clipboard.');
    }
  };


  // --- Render Logic ---

  const renderIdleState = () => (
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
        accept="image/jpeg" // Restrict to JPG as per policy
        onChange={handleInputChange}
        className="hidden"
      />
       {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
    </div>
  );

  // Simplified uploading state without progress bar
  const renderUploadingState = () => (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 text-center">
       {/* Simple spinner or loading indicator */}
       <svg className="animate-spin mx-auto h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <h2 className="text-lg font-medium text-gray-700">Uploading...</h2>
    </div>
  );

  const renderSuccessState = () => (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 text-center">
       {/* Placeholder for checkmark icon */}
       <svg className="mx-auto h-10 w-10 text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
      <h2 className="text-lg font-medium text-gray-700 mb-4">Uploaded Successfully!</h2>
      {previewUrl && (
        <div className="mb-6 rounded-xl overflow-hidden border border-gray-200">
          <img src={previewUrl} alt="Uploaded preview" className="max-w-full max-h-64 object-contain mx-auto" />
        </div>
      )}
      <div className="flex items-center border border-gray-300 rounded-lg p-2 bg-gray-50">
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
       {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
    </div>
  );

   const renderErrorState = () => (
     <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 text-center">
        {/* Placeholder for error icon */}
        <svg className="mx-auto h-10 w-10 text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h2 className="text-lg font-medium text-red-700 mb-4">Upload Failed</h2>
        <p className="text-sm text-gray-600 mb-6">{error || 'An unknown error occurred.'}</p>
        {/* Optionally add a retry button or allow selecting a new file */}
        <button
            onClick={() => { setStatus('idle'); setError(null); setSelectedFile(null); setPreviewUrl(null); }}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300"
        >
            Try Again
        </button>
     </div>
   );


  return (
    <div className="flex items-center justify-center min-h-[300px] bg-gray-100 p-4">
      {status === 'idle' && renderIdleState()}
      {status === 'uploading' && renderUploadingState()}
      {status === 'success' && renderSuccessState()}
      {status === 'error' && renderErrorState()}
    </div>
  );
};

export default ImageUploader;
