import { useState, ChangeEvent, DragEvent, useRef, useEffect } from 'react'; // Removed useCallback
import supabase from '../../../config/supabaseConfig';
import { FileObject } from '@supabase/storage-js';
import { useNotifications } from '../../../context/NotificationContext'; // Import the hook

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';
// ToastType is now imported/managed by NotificationContext

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
  const [fileHistory, setFileHistory] = useState<FileObject[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyCopyStatus, setHistoryCopyStatus] = useState<{ fileId: string; message: string } | null>(null); // State for copy status
  const [editingFileId, setEditingFileId] = useState<string | null>(null); // State for tracking editing file
  const [newName, setNewName] = useState<string>('');
  const [renameError, setRenameError] = useState<string | null>(null);
  const [selectedHistoryFiles, setSelectedHistoryFiles] = useState<string[]>([]);
  // Removed duplicate state declaration

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use the notification hook
  const { showToast, requestConfirmation } = useNotifications();

  // --- Helper to get public URL ---
  const getPublicUrl = (filePath: string): string | null => {
    if (!supabase) return null;
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    return data?.publicUrl ?? null;
  };

  // --- History Functions ---
  const fetchHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    if (!supabase) {
        setHistoryError('Supabase client not initialized.');
        setHistoryLoading(false);
        return;
    }
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list('public', { // List files in the 'public' folder
          limit: 100, // Adjust limit as needed
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;
      if (data) {
        setFileHistory(data);
      }
    } catch (err) {
      console.error("Error fetching file history:", err);
      setHistoryError(`Failed to load history: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setHistoryLoading(false);
    }
  };

  // --- History Selection ---
  const handleHistorySelectionChange = (filePath: string, isSelected: boolean) => {
    setSelectedHistoryFiles(prevSelected => {
      if (isSelected) {
        // Add to selection if not already present
        return prevSelected.includes(filePath) ? prevSelected : [...prevSelected, filePath];
      } else {
        // Remove from selection
        return prevSelected.filter(path => path !== filePath);
      }
    });
  };

  const handleUseSelected = () => {
    if (!onUploadSuccess || selectedHistoryFiles.length === 0) return;

    let successfulUrls: string[] = [];
    let failedPaths: string[] = [];

    selectedHistoryFiles.forEach(filePath => {
      const publicUrl = getPublicUrl(filePath);
      if (publicUrl) {
        onUploadSuccess(publicUrl); // Call for each selected URL
        successfulUrls.push(publicUrl);
      } else {
        failedPaths.push(filePath);
        console.error("Could not get public URL for selected file:", filePath);
      }
    });

    if (failedPaths.length > 0) {
      // Use toast for error
      showToast(`Failed to get URLs for: ${failedPaths.map(p => p.split('/').pop()).join(', ')}`, 'error');
    }
    if (successfulUrls.length > 0) {
        // Use toast for success (optional, maybe just log)
        showToast(`${successfulUrls.length} URL(s) used successfully.`, 'success');
        console.log("Used URLs:", successfulUrls);
        // Clear selection after successful use? Or keep it? Let's clear it for now.
        setSelectedHistoryFiles([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (!supabase || selectedHistoryFiles.length === 0) return;

    const fileNames = selectedHistoryFiles.map(path => path.split('/').pop() || 'unknown file');
    const message = `Are you sure you want to delete ${selectedHistoryFiles.length} selected file(s)?\n\n- ${fileNames.join('\n- ')}\n\nThis cannot be undone.`;

    // Use confirmation from hook
    requestConfirmation({
      message,
      confirmText: 'Confirm Delete', // Specify button text
      onConfirm: async () => {
        // Check supabase *inside* the callback
        if (!supabase) {
          showToast('Supabase client not initialized.', 'error');
          return;
        }
        // Correctly placed try...catch block
        try {
          const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove(selectedHistoryFiles); // Pass the array of full paths

          if (error) throw error;

          console.log('Successfully deleted files:', data);
          // Use toast for success
          showToast(`${selectedHistoryFiles.length} file(s) deleted successfully.`, 'success');
          setSelectedHistoryFiles([]); // Clear selection
          fetchHistory(); // Refresh history

        } catch (err) {
          console.error("Error deleting selected files:", err);
          // Use toast for error
          showToast(`Failed to delete selected files: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
        }
      }, // Ensuring this comma is present
    });
  };

  // --- Other History Actions ---
  const handleCopyHistoryLink = async (url: string | null, fileId: string) => {
    if (!url) {
        setHistoryCopyStatus({ fileId, message: 'Error!' });
        setTimeout(() => setHistoryCopyStatus(null), 2000);
        return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setHistoryCopyStatus({ fileId, message: 'Copied!' });
      setTimeout(() => setHistoryCopyStatus(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy history link:', err);
      setHistoryCopyStatus({ fileId, message: 'Failed!' });
      setTimeout(() => setHistoryCopyStatus(null), 2000); // Reset after 2 seconds
    }
  };

  const handleEditClick = (fileId: string, currentName: string) => {
    setEditingFileId(fileId);
    setNewName(currentName); // Pre-fill input with current name
    setRenameError(null); // Clear previous rename errors
  };

  const handleCancelEdit = () => {
    setEditingFileId(null);
    setNewName('');
    setRenameError(null);
  };

 const handleSaveRename = async (fileId: string, oldName: string) => {
    if (!supabase) {
        setRenameError('Supabase client not initialized.');
        return;
    }
    if (!newName || newName.trim() === '' || newName === oldName) {
        setRenameError('Please enter a valid new name.');
        return;
    }

    // Basic validation for filename (prevent slashes, etc.) - adjust as needed
    if (newName.includes('/')) {
        setRenameError('Filename cannot contain slashes.');
        return;
    }

    // Preserve extension
    const oldExtension = oldName.includes('.') ? oldName.substring(oldName.lastIndexOf('.')) : '';
    let finalNewName = newName.trim();
    if (oldExtension && !finalNewName.endsWith(oldExtension)) {
        // If user removed or changed extension, add it back (or handle differently)
        finalNewName += oldExtension;
    }
     // Ensure the new name doesn't lose the extension if the user didn't type it
    const currentExtension = oldName.substring(oldName.lastIndexOf('.'));
    let targetNewName = newName.trim();
    if (!targetNewName.endsWith(currentExtension)) {
        targetNewName += currentExtension;
    }


    const oldFilePath = `public/${oldName}`;
    const newFilePath = `public/${targetNewName}`; // Use validated/adjusted new name

    setRenameError(null); // Clear previous errors

    try {
        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .move(oldFilePath, newFilePath);

        if (error) {
            // Handle potential errors, e.g., file already exists with the new name
            if (error.message.includes('already exists')) {
                 throw new Error(`A file named '${targetNewName}' already exists.`);
            }
            throw error;
        }

        // Success
        handleCancelEdit(); // Exit edit mode
        fetchHistory(); // Refresh the list
        // Use toast for success
        showToast('File renamed successfully!', 'success');

    } catch (err) {
        console.error("Error renaming file:", err);
        setRenameError(`Rename failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        // Keep edit mode active so user can see the error and try again or cancel
    }
};


  const handleDeleteFile = async (filePath: string) => {
    if (!supabase) {
        // Use toast for error
        showToast('Supabase client not initialized.', 'error');
        return;
    }
    const fileName = filePath.split('/').pop() || 'this file';
    const message = `Are you sure you want to delete ${fileName}? This cannot be undone.`;

    // Use confirmation from hook
    requestConfirmation({
      message,
      confirmText: 'Confirm Delete', // Specify button text
      onConfirm: async () => {
        // Check supabase *inside* the callback
        if (!supabase) {
          showToast('Supabase client not initialized.', 'error');
          return;
        }
        // Correctly placed try...catch block
        try {
          const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath]); // Pass the full path

          if (error) throw error;

          // Refresh history after successful deletion
          fetchHistory();
          // Use toast for success
          showToast('File deleted successfully.', 'success');

        } catch (err) {
          console.error("Error deleting file:", err);
          // Use toast for error
          showToast(`Failed to delete file: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
        }
      }, // Comma is correctly placed after the callback definition
    });
  };

  // Fetch history on component mount
  useEffect(() => {
    fetchHistory();
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- Upload Functions ---
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
      // Refresh history after successful upload
      fetchHistory();
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

   // --- Render History ---
   const renderHistory = () => (
    <div className="w-full max-w-2xl mt-8 bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-700">Uploaded Files History</h3>
        {/* Action buttons for selected files */}
        {selectedHistoryFiles.length > 0 && (
          <div className="flex items-center space-x-2">
             <span className="text-sm text-gray-600">
                {selectedHistoryFiles.length} selected
             </span>
            <button
              onClick={handleUseSelected}
              className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors disabled:opacity-50"
              title="Use selected image URLs"
              disabled={!onUploadSuccess} // Disable if no callback provided
            >
              Use Selected
            </button>
            <button
              onClick={handleDeleteSelected}
              className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
              title="Delete selected files permanently"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {historyLoading && <p className="text-gray-500">Loading history...</p>}
      {historyError && <p className="text-red-500">{historyError}</p>}
      {!historyLoading && !historyError && (
        <ul className="max-h-60 overflow-y-auto divide-y divide-gray-200 border rounded-md">
          {fileHistory.length === 0 ? (
            <li className="p-3 text-center text-gray-500">No files found in history.</li>
          ) : (
            fileHistory.map((file) => {
              const fileId = file.id || file.name; // Use consistent ID
              const currentName = file.name;
              const filePath = `public/${currentName}`;
              const publicUrl = getPublicUrl(filePath);
              const copyStatus = historyCopyStatus?.fileId === fileId ? historyCopyStatus.message : null;
              const isEditing = editingFileId === fileId;
              const isSelected = selectedHistoryFiles.includes(filePath); // Check if selected

              return (
              <li key={fileId} className={`p-3 flex justify-between items-center text-sm ${isSelected ? 'bg-blue-50' : ''}`}> {/* Highlight selected rows */}
                <div className="flex items-center space-x-3 flex-grow min-w-0 mr-2"> {/* Reduced mr */}
                   {/* Checkbox for Selection */}
                   <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleHistorySelectionChange(filePath, e.target.checked)}
                    className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                    aria-label={`Select file ${currentName}`}
                    disabled={isEditing} // Disable checkbox while editing name
                  />
                  {/* Image Preview */}
                  {publicUrl ? (
                    <img src={publicUrl} alt={`Preview of ${currentName}`} className="h-10 w-10 object-cover rounded flex-shrink-0" loading="lazy" />
                  ) : (
                    <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-gray-400 flex-shrink-0">?</div>
                  )}

                  {/* Filename Display or Edit Input */}
                  {isEditing ? (
                    <div className="flex-grow">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                        aria-label="New filename"
                      />
                      {renameError && <p className="text-red-500 text-xs mt-1">{renameError}</p>}
                    </div>
                  ) : (
                    <span className="text-gray-800 truncate" title={currentName}>{currentName}</span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-1 flex-shrink-0"> {/* Reduced space */}
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleSaveRename(fileId, currentName)}
                        className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                        title="Save new name"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                        title="Cancel editing"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Removed the individual 'Select' button */}
                      <button onClick={() => handleCopyHistoryLink(publicUrl, fileId)} className={`px-2 py-1 text-white text-xs rounded transition-colors ${copyStatus === 'Copied!' ? 'bg-green-600' : copyStatus === 'Failed!' || copyStatus === 'Error!' ? 'bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`} title="Copy image link" disabled={!publicUrl || !!copyStatus || isSelected}> {/* Disable if selected? Or allow? */}
                        {copyStatus || 'Copy'}
                      </button>
                       <button onClick={() => handleEditClick(fileId, currentName)} className="px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition-colors" title="Rename file" disabled={isSelected}> {/* Disable if selected */}
                        Edit
                      </button>
                      <button onClick={() => handleDeleteFile(filePath)} className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors" title="Delete this file permanently" disabled={isSelected}> {/* Disable if selected */}
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </li>
              );
            })
          )}
        </ul>
      )}
    </div>
   );

  // Removed the local ToastNotification component definition entirely

  return (
    // Removed relative positioning if not needed by other elements
    <div className="flex flex-col items-center justify-start min-h-[400px] bg-gray-100 p-4">
      {/* Toast and Modal are now rendered by NotificationProvider */}

      {/* Uploader Section */}
      <div className="w-full flex justify-center mb-4">
        {status === 'idle' && renderIdleState()}
        {status === 'uploading' && renderUploadingState()}
        {status === 'success' && renderSuccessState()}
        {status === 'error' && renderErrorState()}
      </div>

      {/* History Section */}
      {renderHistory()}
    </div>
  );
};

export default ImageUploader;
