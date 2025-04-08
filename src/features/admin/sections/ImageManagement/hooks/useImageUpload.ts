import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import supabase from '../../../../../config/supabaseConfig'; // Corrected path
import { useNotifications } from '../../../../../contexts/NotificationContext'; // Corrected path
import { UploadStatus } from '../types/imageUploaderTypes';

const BUCKET_NAME = 'img'; // Define bucket name

interface UseImageUploadProps {
  onUploadSuccess?: (url: string) => void;
  onUploadComplete?: () => void; // Callback to signal upload process finished (success or error)
}

export const useImageUpload = ({ onUploadSuccess, onUploadComplete }: UseImageUploadProps) => {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('Copy Link');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useNotifications();

  const resetState = () => {
    setStatus('idle');
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadedUrl(null);
    setError(null);
    setIsDragging(false);
    setCopyButtonText('Copy Link');
    // Reset file input visually if possible (though value reset happens in handleInputChange)
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError(null);
      setStatus('idle'); // Reset status
      setUploadedUrl(null); // Clear previous URL
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
      // Automatically start upload
      handleUpload(file);
      // Clean up previous preview URL if it exists
      // Note: This might revoke the URL before the success screen uses it if upload is instant.
      // Consider revoking it when the component unmounts or a new file is selected.
      // For simplicity here, we'll rely on the browser's garbage collection or revoke later.
    } else {
      setSelectedFile(null);
      setPreviewUrl(null); // Also clear preview
      if (file) {
        setError('Please select an image file.');
        showToast('Please select an image file.', 'error');
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
    if (!supabase) {
      setError('Supabase client is not initialized.');
      setStatus('error');
      showToast('Supabase client not initialized.', 'error');
      onUploadComplete?.();
      return;
    }
    if (!fileToUpload) {
      setError('No file selected for upload.');
      setStatus('error');
      // No need for toast here, handleFileSelect handles invalid selections
      onUploadComplete?.();
      return;
    }

    setStatus('uploading');
    setError(null);
    setCopyButtonText('Copy Link'); // Reset copy button text

    const timestamp = Date.now();
    const filePath = `public/${timestamp}_${fileToUpload.name}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      if (!urlData || !urlData.publicUrl) {
        throw new Error('Failed to retrieve public URL after upload.');
      }

      const publicUrl = urlData.publicUrl;
      setUploadedUrl(publicUrl);
      setStatus('success');
      showToast('Image uploaded successfully!', 'success');
      onUploadSuccess?.(publicUrl);

    } catch (err) {
      console.error("Upload process failed:", err);
      const errorMessage = `Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      setStatus('error');
      showToast(errorMessage, 'error');
    } finally {
        onUploadComplete?.(); // Signal completion regardless of success/error
    }
  };

  const handleCopyLink = async () => {
    if (!uploadedUrl) return;
    try {
      await navigator.clipboard.writeText(uploadedUrl);
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy Link'), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      const copyError = 'Failed to copy link to clipboard.';
      setError(copyError);
      showToast(copyError, 'error');
    }
  };

  // --- New Function: Handle Upload from URL ---
  const handleUrlUpload = async (imageUrl: string) => {
    if (!supabase) {
      setError('Supabase client is not initialized.');
      setStatus('error');
      showToast('Supabase client not initialized.', 'error');
      onUploadComplete?.();
      return;
    }

    setStatus('fetching_url'); // Set status to fetching URL first
    setError(null);
    setPreviewUrl(null); // Clear previous preview
    setSelectedFile(null); // Clear any selected file
    setUploadedUrl(null); // Clear previous upload URL
    setCopyButtonText('Copy Link');

    try {
      // --- Add check for blob: URLs ---
      if (imageUrl.startsWith('blob:')) {
        throw new Error('Pasting blob: URLs is not supported. Please upload the original image file directly.');
      }
      // --- End check ---

      // 1. Fetch the image data
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      // 2. Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error('URL does not point to a valid image file.');
      }

      // 3. Get image data as Blob
      const blob = await response.blob();

      // 4. Create a File object
      // Try to get filename from URL, fallback to a generic name
      let filename = 'uploaded_image';
      try {
        const urlParts = new URL(imageUrl);
        const pathParts = urlParts.pathname.split('/');
        if (pathParts.length > 0 && pathParts[pathParts.length - 1]) {
          filename = pathParts[pathParts.length - 1];
        }
      } catch (e) {
        console.warn("Could not parse filename from URL, using default.");
      }
      // Ensure filename has an extension based on MIME type if possible
      const extension = contentType.split('/')[1];
      if (extension && !filename.includes('.')) {
          filename = `${filename}.${extension}`;
      } else if (!filename.includes('.')) {
          filename = `${filename}.png`; // Default fallback extension
      }


      const imageFile = new File([blob], filename, { type: contentType });

      // 5. Set preview (optional but good UX)
      const newPreviewUrl = URL.createObjectURL(imageFile);
      setPreviewUrl(newPreviewUrl); // Show preview while uploading

      // 6. Call the existing upload handler
      await handleUpload(imageFile);

    } catch (err) {
      console.error("URL Upload process failed:", err);
      // Check for specific errors like CORS
      let errorMessage = `URL Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`;
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
          // This often indicates a CORS issue or network problem
          errorMessage += ". This might be due to network issues or CORS restrictions on the image server.";
      }
      setError(errorMessage);
      setStatus('error');
      showToast(errorMessage, 'error');
      onUploadComplete?.(); // Ensure completion callback is called on error
    }
    // Note: handleUpload calls onUploadComplete in its finally block,
    // so we don't need to call it here on success.
  };
  // --- End New Function ---

  // Clean up preview URL when the hook unmounts or selectedFile changes
  // useEffect(() => {
  //   let currentPreviewUrl = previewUrl; // Capture the URL
  //   return () => {
  //     if (currentPreviewUrl) {
  //       URL.revokeObjectURL(currentPreviewUrl);
  //     }
  //   };
  // }, [previewUrl]); // Dependency on previewUrl itself

  return {
    status,
    selectedFile,
    previewUrl,
    uploadedUrl,
    error,
    isDragging,
    copyButtonText,
    fileInputRef,
    handleInputChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    triggerFileInput,
    handleCopyLink,
    resetState, // Expose reset function
    handleUrlUpload, // Expose the new function
  };
};