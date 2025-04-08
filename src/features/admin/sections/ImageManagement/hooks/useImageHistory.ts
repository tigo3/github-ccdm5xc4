import { useState, useEffect, useCallback } from 'react';
import supabase from '../../../../../config/supabaseConfig'; // Corrected path
import { FileObject } from '@supabase/storage-js';
import { useNotifications } from '../../../../../contexts/NotificationContext'; // Corrected path
import { HistoryCopyStatus } from '../types/imageUploaderTypes';

const BUCKET_NAME = 'img'; // Define bucket name

interface UseImageHistoryProps {
  onFileSelect?: (url: string) => void; // Callback when a file is selected to be "used"
}

export const useImageHistory = ({ onFileSelect }: UseImageHistoryProps) => {
  const [fileHistory, setFileHistory] = useState<FileObject[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyCopyStatus, setHistoryCopyStatus] = useState<HistoryCopyStatus | null>(null);
  const [editingFileId, setEditingFileId] = useState<string | null>(null); // Use file.id (which includes name)
  const [newName, setNewName] = useState<string>('');
  const [renameError, setRenameError] = useState<string | null>(null);
  const [selectedHistoryFiles, setSelectedHistoryFiles] = useState<string[]>([]); // Store full paths (e.g., 'public/filename.jpg')

  const { showToast, requestConfirmation } = useNotifications();

  // --- Helper to get public URL ---
  const getPublicUrl = useCallback((filePath: string): string | null => {
    if (!supabase) return null;
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    return data?.publicUrl ?? null;
  }, []); // No dependencies needed if supabase instance is stable

  // --- History Fetching ---
  const fetchHistory = useCallback(async () => {
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
        .list('public', { // Assuming files are in 'public' folder
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;
      if (data) {
        // Filter out potential placeholder files if Supabase adds them
        const validFiles = data.filter(file => file.name !== '.emptyFolderPlaceholder');
        setFileHistory(validFiles);
      }
    } catch (err) {
      console.error("Error fetching file history:", err);
      const message = `Failed to load history: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setHistoryError(message);
      showToast(message, 'error');
    } finally {
      setHistoryLoading(false);
    }
  }, [showToast]); // Dependency on showToast

  // Fetch history on mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // --- History Selection ---
  const handleHistorySelectionChange = (filePath: string, isSelected: boolean) => {
    setSelectedHistoryFiles(prevSelected => {
      if (isSelected) {
        return prevSelected.includes(filePath) ? prevSelected : [...prevSelected, filePath];
      } else {
        return prevSelected.filter(path => path !== filePath);
      }
    });
  };

  const handleUseSelected = () => {
    if (!onFileSelect || selectedHistoryFiles.length === 0) return;

    let successfulUrls: string[] = [];
    let failedPaths: string[] = [];

    selectedHistoryFiles.forEach(filePath => {
      const publicUrl = getPublicUrl(filePath);
      if (publicUrl) {
        onFileSelect(publicUrl); // Call callback for each selected URL
        successfulUrls.push(publicUrl);
      } else {
        failedPaths.push(filePath);
        console.error("Could not get public URL for selected file:", filePath);
      }
    });

    if (failedPaths.length > 0) {
      showToast(`Failed to get URLs for: ${failedPaths.map(p => p.split('/').pop()).join(', ')}`, 'error');
    }
    if (successfulUrls.length > 0) {
      showToast(`${successfulUrls.length} URL(s) selected successfully.`, 'success');
      // Clear selection after successful use
      setSelectedHistoryFiles([]);
    }
  };

  // --- History Actions (Delete, Rename, Copy) ---
  const handleDeleteFile = useCallback(async (filePath: string) => {
    if (!supabase) {
      showToast('Supabase client not initialized.', 'error');
      return;
    }
    const fileName = filePath.split('/').pop() || 'this file';
    const message = `Are you sure you want to delete ${fileName}? This cannot be undone.`;

    requestConfirmation({
      message,
      confirmText: 'Confirm Delete',
      onConfirm: async () => {
        if (!supabase) { // Re-check inside callback
          showToast('Supabase client not initialized.', 'error');
          return;
        }
        try {
          const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath]); // Pass the full path in an array

          if (error) throw error;

          showToast('File deleted successfully.', 'success');
          fetchHistory(); // Refresh history
          // Also remove from selection if it was selected
          setSelectedHistoryFiles(prev => prev.filter(p => p !== filePath));
        } catch (err) {
          console.error("Error deleting file:", err);
          showToast(`Failed to delete file: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
        }
      },
    });
  }, [supabase, showToast, requestConfirmation, fetchHistory]);

  const handleDeleteSelected = useCallback(async () => {
    if (!supabase || selectedHistoryFiles.length === 0) return;

    const fileNames = selectedHistoryFiles.map(path => path.split('/').pop() || 'unknown file');
    const message = `Are you sure you want to delete ${selectedHistoryFiles.length} selected file(s)?\n\n- ${fileNames.join('\n- ')}\n\nThis cannot be undone.`;

    requestConfirmation({
      message,
      confirmText: 'Confirm Delete',
      onConfirm: async () => {
        if (!supabase) { // Re-check inside callback
          showToast('Supabase client not initialized.', 'error');
          return;
        }
        try {
          const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove(selectedHistoryFiles); // Pass the array of full paths

          if (error) throw error;

          console.log('Successfully deleted files:', data);
          showToast(`${selectedHistoryFiles.length} file(s) deleted successfully.`, 'success');
          setSelectedHistoryFiles([]); // Clear selection
          fetchHistory(); // Refresh history
        } catch (err) {
          console.error("Error deleting selected files:", err);
          showToast(`Failed to delete selected files: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
        }
      },
    });
  }, [supabase, selectedHistoryFiles, showToast, requestConfirmation, fetchHistory]);

  const handleCopyHistoryLink = useCallback(async (filePath: string) => {
    const url = getPublicUrl(filePath);
    const fileId = filePath; // Use filePath as the unique ID for status

    if (!url) {
      setHistoryCopyStatus({ fileId, message: 'Error!' });
      setTimeout(() => setHistoryCopyStatus(null), 2000);
      showToast('Could not get public URL.', 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setHistoryCopyStatus({ fileId, message: 'Copied!' });
      setTimeout(() => setHistoryCopyStatus(null), 2000);
    } catch (err) {
      console.error('Failed to copy history link:', err);
      setHistoryCopyStatus({ fileId, message: 'Failed!' });
      setTimeout(() => setHistoryCopyStatus(null), 2000);
      showToast('Failed to copy link.', 'error');
    }
  }, [getPublicUrl, showToast]);

  const handleEditClick = (fileId: string, currentName: string) => {
    setEditingFileId(fileId); // fileId is the full path like 'public/name.jpg'
    // Extract just the name without extension for editing
    const nameWithoutExtension = currentName.substring(0, currentName.lastIndexOf('.'));
    setNewName(nameWithoutExtension);
    setRenameError(null);
  };

  const handleCancelEdit = () => {
    setEditingFileId(null);
    setNewName('');
    setRenameError(null);
  };

  const handleSaveRename = useCallback(async (oldFilePath: string) => {
    if (!supabase) {
      setRenameError('Supabase client not initialized.');
      showToast('Supabase client not initialized.', 'error');
      return;
    }

    const oldName = oldFilePath.split('/').pop();
    if (!oldName) {
        setRenameError('Invalid old file path.');
        return;
    }

    const trimmedNewName = newName.trim();
    if (!trimmedNewName || trimmedNewName === oldName.substring(0, oldName.lastIndexOf('.'))) {
      setRenameError('Please enter a valid new name.');
      return;
    }
    if (trimmedNewName.includes('/')) {
      setRenameError('Filename cannot contain slashes.');
      return;
    }

    const extension = oldName.includes('.') ? oldName.substring(oldName.lastIndexOf('.')) : '';
    const finalNewName = trimmedNewName + extension;
    const newFilePath = `public/${finalNewName}`;

    if (newFilePath === oldFilePath) {
        setRenameError('New name is the same as the old name.');
        return;
    }

    setRenameError(null);

    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .move(oldFilePath, newFilePath);

      if (error) {
        if (error.message.includes('already exists')) {
          throw new Error(`A file named '${finalNewName}' already exists.`);
        }
        throw error;
      }

      showToast('File renamed successfully!', 'success');
      handleCancelEdit(); // Exit edit mode
      fetchHistory(); // Refresh the list
      // Update selection if the renamed file was selected
      setSelectedHistoryFiles(prev => prev.map(p => p === oldFilePath ? newFilePath : p));


    } catch (err) {
      console.error("Error renaming file:", err);
      const message = `Rename failed: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setRenameError(message);
      showToast(message, 'error');
      // Keep edit mode active
    }
  }, [supabase, newName, fetchHistory, showToast]);

  return {
    fileHistory,
    historyLoading,
    historyError,
    historyCopyStatus,
    editingFileId,
    newName,
    renameError,
    selectedHistoryFiles,
    fetchHistory,
    handleHistorySelectionChange,
    handleUseSelected,
    handleDeleteFile,
    handleDeleteSelected,
    handleCopyHistoryLink,
    handleEditClick,
    handleCancelEdit,
    handleSaveRename,
    setNewName,
    getPublicUrl, // Expose if needed by UI directly
  };
};