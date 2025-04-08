import React from 'react';
import { usePageManagement } from './hooks/usePageManagement'; // Corrected path
import PageForm from './components/PageForm'; // Corrected path
import PageListItem from './components/PageListItem'; // Corrected path


// --- PagesTab Component ---
const PagesSection: React.FC = () => {
  // Use the custom hook to manage state and logic
  const {
    pages,
    isLoading,
    isEditing,
    handleFormSubmit,
    handleDelete,
    startEditing,
    resetForm,
    handleMoveUp,
    handleMoveDown,
  } = usePageManagement();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Manage Pages</h2>

      {/* Error display removed, handled by toasts */}
      {/* {error && <p className="text-red-500 bg-red-100 p-3 rounded">{error}</p>} */}

      {/* Render PageForm */}
      <PageForm
        key={isEditing || 'add'} // Force re-render/reset when switching between add/edit
        initialData={isEditing ? pages.find(p => p.id === isEditing) : undefined}
        onSubmit={handleFormSubmit}
        onCancel={resetForm} // Pass resetForm as the cancel handler
        isLoading={isLoading}
      />

      {/* Pages List */}
      <div className="mt-6 border rounded shadow-sm bg-white">
        <h3 className="text-lg font-medium p-4 border-b">Existing Pages</h3>
        {isLoading && !pages.length ? (
          <p className="p-4 text-gray-500">Loading pages...</p>
        ) : pages.length === 0 ? (
          <p className="p-4 text-gray-500">No pages found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {pages.map((page, index) => (
              <PageListItem
                key={page.id}
                page={page}
                index={index}
                pageCount={pages.length}
                isLoading={isLoading}
                onEdit={startEditing}
                onDelete={handleDelete}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PagesSection;
