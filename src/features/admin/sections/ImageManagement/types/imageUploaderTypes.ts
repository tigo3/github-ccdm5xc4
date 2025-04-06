import { FileObject } from '@supabase/storage-js';

export type UploadStatus = 'idle' | 'fetching_url' | 'uploading' | 'success' | 'error';

export interface ImageUploaderProps {
  onUploadSuccess?: (url: string) => void;
}

export interface HistoryCopyStatus {
  fileId: string;
  message: string;
}

// Re-export FileObject if needed elsewhere specifically for this feature
export type { FileObject };