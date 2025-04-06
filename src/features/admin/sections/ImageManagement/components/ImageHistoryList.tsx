import React from 'react';
import { FileObject, HistoryCopyStatus } from '../types/imageUploaderTypes'; // Assuming types are exported correctly

interface ImageHistoryListProps {
  fileHistory: FileObject[];
  historyLoading: boolean;
  historyError: string | null;
  selectedHistoryFiles: string[];
  editingFileId: string | null; // Full path like 'public/name.jpg'
  newName: string;
  renameError: string | null;
  historyCopyStatus: HistoryCopyStatus | null;
  getPublicUrl: (filePath: string) => string | null;
  handleHistorySelectionChange: (filePath: string, isSelected: boolean) => void;
  handleUseSelected: () => void;
  handleDeleteSelected: () => void;
  handleCopyHistoryLink: (filePath: string) => void;
  handleEditClick: (fileId: string, currentName: string) => void; // fileId is full path
  handleCancelEdit: () => void;
  handleSaveRename: (oldFilePath: string) => void;
  handleDeleteFile: (filePath: string) => void;
  setNewName: (name: string) => void;
}

// Helper to format bytes
const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const ImageHistoryList: React.FC<ImageHistoryListProps> = ({
  fileHistory,
  historyLoading,
  historyError,
  selectedHistoryFiles,
  editingFileId,
  newName,
  renameError,
  historyCopyStatus,
  getPublicUrl,
  handleHistorySelectionChange,
  handleUseSelected,
  handleDeleteSelected,
  handleCopyHistoryLink,
  handleEditClick,
  handleCancelEdit,
  handleSaveRename,
  handleDeleteFile,
  setNewName,
}) => {

  if (historyLoading) {
    return <div className="text-center p-4">Loading history...</div>;
  }

  if (historyError) {
    return <div className="text-center p-4 text-red-600">Error loading history: {historyError}</div>;
  }

  const getFilePath = (file: FileObject): string => `public/${file.name}`;

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Image History</h3>

      {/* Bulk Actions */}
      {selectedHistoryFiles.length > 0 && (
        <div className="mb-4 p-3 bg-gray-100 rounded-md flex items-center justify-between">
           <span className="text-sm text-gray-700">{selectedHistoryFiles.length} file(s) selected</span>
           <div>
             <button
                onClick={handleUseSelected}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors mr-2"
                title="Use selected image URL(s)"
             >
                Use Selected
             </button>
             <button
                onClick={handleDeleteSelected}
                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                title="Delete selected files"
             >
                Delete Selected
             </button>
           </div>
        </div>
      )}

      {fileHistory.length === 0 ? (
        <p className="text-gray-500 text-sm text-center">No images uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-h-[500px] overflow-y-auto p-1">
          {fileHistory.map((file) => {
            // Define variables within the map scope
            const filePath = getFilePath(file);
            const publicUrl = getPublicUrl(filePath);
            const isSelected = selectedHistoryFiles.includes(filePath);
            const isEditing = editingFileId === filePath;
            const copyStatus = historyCopyStatus?.fileId === filePath ? historyCopyStatus.message : 'Copy Link';

            // Return the JSX for each grid item
            return (
              <div key={filePath} className={`relative group bg-white rounded-lg shadow-sm border transition-colors flex flex-col overflow-hidden ${isSelected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200 hover:border-gray-300'}`}>
                 {/* Checkbox - Positioned top-left */}
                 <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleHistorySelectionChange(filePath, e.target.checked)}
                    className="absolute top-2 left-2 z-10 form-checkbox h-4 w-4 text-blue-600 bg-white border-gray-400 rounded focus:ring-blue-500 focus:ring-offset-0 checked:border-transparent"
                    aria-label={`Select ${file.name}`}
                    onClick={(e) => e.stopPropagation()} // Prevent card click when clicking checkbox
                 />

                 {/* Image Preview Area */}
                 <div className="relative w-full aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                   {publicUrl ? (
                      <img src={publicUrl} alt={file.name} className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105" />
                   ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                   )}
                 </div>

                 {/* Content Area */}
                 <div className="p-2 flex flex-col flex-grow">
                   {isEditing ? (
                     // Editing State
                     <div className="flex flex-col space-y-1 flex-grow">
                       <input
                         type="text"
                         value={newName}
                         onChange={(e) => setNewName(e.target.value)}
                         className="text-xs p-1 border border-gray-300 rounded w-full focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                         aria-label="New file name"
                         onClick={(e) => e.stopPropagation()} // Prevent card click
                       />
                       {renameError && <p className="text-red-500 text-xs mt-1">{renameError}</p>}
                       <div className="flex justify-end space-x-1 mt-auto pt-1">
                         <button onClick={(e) => { e.stopPropagation(); handleSaveRename(filePath); }} className="text-xs text-green-600 hover:text-green-800 p-0.5" title="Save">✓</button>
                         <button onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }} className="text-xs text-red-600 hover:text-red-800 p-0.5" title="Cancel">✕</button>
                       </div>
                     </div>
                   ) : (
                     // Normal State
                     <>
                       <p className="text-xs font-medium text-gray-700 truncate mb-0.5" title={file.name}>{file.name}</p>
                       <p className="text-xxs text-gray-500 mb-1"> {/* Adjusted text size */}
                         {formatBytes(file.metadata?.size ?? 0)} - {file.created_at ? new Date(file.created_at).toLocaleDateString() : 'Invalid Date'}
                       </p>
                       {/* Action Buttons - Placed at the bottom */}
                       <div className="mt-auto pt-1 flex items-center justify-between space-x-1">
                         <button
                           onClick={(e) => { e.stopPropagation(); handleCopyHistoryLink(filePath); }}
                           className={`text-xxs px-1.5 py-0.5 rounded transition-colors flex-grow text-center ${copyStatus === 'Copied!' ? 'bg-green-100 text-green-700' : copyStatus === 'Failed!' || copyStatus === 'Error!' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                           disabled={copyStatus !== 'Copy Link'}
                           title="Copy image URL"
                         >
                           {copyStatus === 'Copy Link' ? 'Copy' : copyStatus} {/* Shorter text */}
                         </button>
                         <button
                           onClick={(e) => { e.stopPropagation(); handleEditClick(filePath, file.name); }}
                           className="text-gray-500 hover:text-gray-700 p-0.5"
                           title="Rename file"
                         >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                         </button>
                         <button
                           onClick={(e) => { e.stopPropagation(); handleDeleteFile(filePath); }}
                           className="text-red-500 hover:text-red-700 p-0.5"
                           title="Delete file"
                         >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                         </button>
                       </div>
                     </>
                   )}
                 </div>
              </div> // End Grid Item Card
            ); // End return
          })} {/* End map */}
        </div> // End Grid container
      )}
    </div> // End main container
  );
}; // End component