import React from 'react';
import { useImageUpload } from '../hooks/useImageUpload';
import { useImageHistory } from '../hooks/useImageHistory';
import { ImageUploadArea } from './ImageUploadArea';
import { ImageUploadStatus } from './ImageUploadStatus';
import { ImageHistoryList } from './ImageHistoryList';
import { ImageUploaderProps } from '../types/imageUploaderTypes';

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUploadSuccess }) => {
  const historyHook = useImageHistory({ onFileSelect: onUploadSuccess }); // Pass onUploadSuccess as onFileSelect

  const uploadHook = useImageUpload({
    onUploadSuccess: (url) => {
      // Call the original callback if provided
      onUploadSuccess?.(url);
      // Refresh history after a successful new upload
      historyHook.fetchHistory();
    },
    // Reset history selection when upload completes (optional, maybe confusing?)
    // onUploadComplete: () => historyHook.setSelectedHistoryFiles([]),
  });

  return (
    <div className="space-y-6">
      {/* Top Section: Upload Area or Status */}
      {uploadHook.status === 'idle' ? (
        <ImageUploadArea
          isDragging={uploadHook.isDragging}
          error={uploadHook.error} // Show upload-specific errors here
          previewUrl={uploadHook.previewUrl} // Pass previewUrl down
          fileInputRef={uploadHook.fileInputRef}
          handleDrop={uploadHook.handleDrop}
          handleDragOver={uploadHook.handleDragOver}
          handleDragLeave={uploadHook.handleDragLeave}
          triggerFileInput={uploadHook.triggerFileInput}
          handleInputChange={uploadHook.handleInputChange}
          handleUrlUpload={uploadHook.handleUrlUpload}
        />
      ) : (
        <ImageUploadStatus
          status={uploadHook.status}
          previewUrl={uploadHook.previewUrl}
          uploadedUrl={uploadHook.uploadedUrl}
          error={uploadHook.error}
          copyButtonText={uploadHook.copyButtonText}
          handleCopyLink={uploadHook.handleCopyLink}
          resetState={uploadHook.resetState} // Allow resetting back to idle
        />
      )}

      {/* Bottom Section: History List */}
      <ImageHistoryList
        fileHistory={historyHook.fileHistory}
        historyLoading={historyHook.historyLoading}
        // Display history errors separately from upload errors
        historyError={historyHook.historyError}
        selectedHistoryFiles={historyHook.selectedHistoryFiles}
        editingFileId={historyHook.editingFileId}
        newName={historyHook.newName}
        renameError={historyHook.renameError}
        historyCopyStatus={historyHook.historyCopyStatus}
        getPublicUrl={historyHook.getPublicUrl}
        handleHistorySelectionChange={historyHook.handleHistorySelectionChange}
        handleUseSelected={historyHook.handleUseSelected} // Uses the onFileSelect passed to the hook
        handleDeleteSelected={historyHook.handleDeleteSelected}
        handleCopyHistoryLink={historyHook.handleCopyHistoryLink}
        handleEditClick={historyHook.handleEditClick}
        handleCancelEdit={historyHook.handleCancelEdit}
        handleSaveRename={historyHook.handleSaveRename}
        handleDeleteFile={historyHook.handleDeleteFile}
        setNewName={historyHook.setNewName}
      />
    </div>
  );
};

export default ImageUploader; // Assuming it's the default export
