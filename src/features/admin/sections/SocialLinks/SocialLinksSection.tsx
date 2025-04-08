import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../../../../config/firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, writeBatch } from 'firebase/firestore';
import { PlusCircle } from 'lucide-react';
import { useNotifications } from '../../../../contexts/NotificationContext';
import { SocialLink } from './types'; // Corrected path
import SocialLinkForm from './components/SocialLinkForm'; // Corrected path
import SocialLinkItem from './components/SocialLinkItem'; // Corrected path

const SocialLinksSection: React.FC = () => {
  const { showToast, requestConfirmation } = useNotifications();
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  // State to hold data for the form when editing
  const [currentEditData, setCurrentEditData] = useState<Omit<SocialLink, 'id'> | null>(null);

  // Memoize the collection reference
  const linksCollectionRef = useMemo(() => db ? collection(db, 'socialLinks') : null, []);

  const fetchLinks = useCallback(async () => {
    if (!db || !linksCollectionRef) {
      showToast("Error: Firestore is not initialized.", 'error');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const q = query(linksCollectionRef, orderBy('order', 'asc'));
      const data = await getDocs(q);
      const fetchedLinks = data.docs.map((doc) => ({ ...doc.data(), id: doc.id } as SocialLink));
      setLinks(fetchedLinks);
    } catch (err) {
      console.error("Error fetching social links:", err);
      showToast("Failed to load social links. Please try again.", 'error');
    } finally {
      setIsLoading(false);
    }
  }, [linksCollectionRef, showToast]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const resetFormState = () => {
    setIsAdding(false);
    setEditingLinkId(null);
    setCurrentEditData(null); // Clear editing data
  };

  const handleAddLink = async (formData: Omit<SocialLink, 'id'>) => {
    if (!db || !linksCollectionRef) {
      showToast("Error: Firestore is not initialized.", 'error');
      return;
    }
    try {
      // Ensure order is set correctly for new links (append to the end)
      const newOrder = links.length > 0 ? Math.max(...links.map(l => l.order)) + 1 : 0;
      // Use formData directly from the form component
      await addDoc(linksCollectionRef, { ...formData, order: newOrder });
      showToast('Link added successfully!', 'success');
      resetFormState();
      fetchLinks(); // Refresh list
    } catch (err) {
      console.error("Error adding link:", err);
      showToast("Failed to add link. Please try again.", 'error');
    }
  };

  const handleUpdateLink = async (formData: Omit<SocialLink, 'id'>) => {
    if (!editingLinkId || !db) {
      showToast("Error: Cannot update link or Firestore is not initialized.", 'error');
      return;
    }
    try {
      const linkDoc = doc(db, 'socialLinks', editingLinkId);
      // Use formData directly from the form component, including the order
      await updateDoc(linkDoc, formData);
      showToast('Link updated successfully!', 'success');
      resetFormState();
      fetchLinks(); // Refresh list
    } catch (err) {
      console.error("Error updating link:", err);
      showToast("Failed to update link. Please try again.", 'error');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
     if (!db) {
        showToast("Error: Firestore is not initialized.", 'error');
        return;
     }
     const swapIndex = direction === 'up' ? index - 1 : index + 1;
     if (swapIndex < 0 || swapIndex >= links.length) return; // Boundary check

     const linkToMove = links[index];
     const linkToSwapWith = links[swapIndex];

     const batch = writeBatch(db);
     const linkToMoveRef = doc(db, 'socialLinks', linkToMove.id);
     const linkToSwapWithRef = doc(db, 'socialLinks', linkToSwapWith.id);

     // Swap order values
     batch.update(linkToMoveRef, { order: linkToSwapWith.order });
     batch.update(linkToSwapWithRef, { order: linkToMove.order });

     try {
       await batch.commit();
       showToast(`Link moved ${direction} successfully.`, 'success');
       fetchLinks(); // Refresh list with new order
     } catch (err) {
       console.error(`Error moving link ${direction}:`, err);
       showToast("Failed to reorder link. Please try again.", 'error');
     }
   };

  const handleMoveUp = (index: number) => handleMove(index, 'up');
  const handleMoveDown = (index: number) => handleMove(index, 'down');

  const handleDeleteLink = async (id: string) => {
    const linkToDelete = links.find(l => l.id === id);
    if (!linkToDelete) return;

    requestConfirmation({
      message: `Are you sure you want to delete the link "${linkToDelete.name}"?`,
      onConfirm: async () => {
        if (!db) {
           showToast("Error: Firestore is not initialized.", 'error');
           return;
        }
        try {
          const linkDoc = doc(db, 'socialLinks', id);
          await deleteDoc(linkDoc);
          showToast('Link deleted successfully!', 'success');
          fetchLinks(); // Refresh list
          // If the deleted link was being edited, reset the form
          if (editingLinkId === id) {
            resetFormState();
          }
        } catch (err) {
          console.error("Error deleting link:", err);
          showToast("Failed to delete link. Please try again.", 'error');
        }
      },
      confirmText: 'Delete Link',
      title: 'Confirm Deletion'
    });
  };

  const startEditing = (link: SocialLink) => {
    setEditingLinkId(link.id);
    // Set the data needed for the form
    setCurrentEditData({ name: link.name, url: link.url, icon: link.icon, order: link.order });
    setIsAdding(false); // Ensure not in adding mode
  };

  const handleFormSubmit = (formData: Omit<SocialLink, 'id'>) => {
    if (editingLinkId) {
      handleUpdateLink(formData);
    } else {
      handleAddLink(formData);
    }
  };

  return (
    // Removed dark mode classes, added light mode defaults
    <div className="p-4 md:p-6 bg-white rounded-lg shadow-lg text-gray-800">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">Manage Social Links</h2>

      {isLoading && <p className="text-center text-gray-500">Loading links...</p>}
      {/* TODO: Add error display if needed */}

      {/* Add/Edit Form */}
      {(isAdding || editingLinkId) && (
        <SocialLinkForm
          key={editingLinkId || 'add-form'} // Add key to force re-render/reset state when switching between add/edit
          initialData={currentEditData}
          isEditing={!!editingLinkId}
          onSubmit={handleFormSubmit}
          onCancel={resetFormState}
        />
      )}

      {/* Add New Link Button */}
      {!isAdding && !editingLinkId && !isLoading && (
        <button // Adjusted button style for light background
          onClick={() => { setIsAdding(true); setEditingLinkId(null); setCurrentEditData(null); }}
          className="mb-6 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out shadow hover:shadow-md"
        >
          <PlusCircle size={18} /> Add New Link
        </button>
      )}

      {/* Links List */}
      {!isLoading && links.length > 0 && (
        <div className="space-y-3">
          {/* Header Row - Adjusted for light theme */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 bg-gray-100 border-b border-gray-300 rounded-t-lg p-3 font-semibold text-gray-600 items-center sticky top-0 z-10">
            <div className="col-span-1 text-center">Order</div>
            <div className="col-span-1 text-center">Icon</div>
            <div className="col-span-3">Name</div>
            <div className="col-span-4">URL</div>
            <div className="col-span-3 text-right pr-2">Actions</div>
          </div>

          {/* Link Items */}
          {links.map((link, index) => (
            <SocialLinkItem
              key={link.id}
              link={link}
              index={index}
              isFirst={index === 0}
              isLast={index === links.length - 1}
              onEdit={startEditing}
              onDelete={handleDeleteLink}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          ))}
        </div>
      )}

      {/* Empty State - Adjusted for light theme */}
      {!isLoading && links.length === 0 && !isAdding && (
         <div className="text-center text-gray-500 mt-6 p-6 border border-dashed border-gray-300 rounded-lg bg-gray-50">
           <p className="font-medium">No social links found.</p>
           <p className="text-sm mt-1">Click "Add New Link" above to get started.</p>
         </div>
       )}
    </div>
  );
};

export default SocialLinksSection;
