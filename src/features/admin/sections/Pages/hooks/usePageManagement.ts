import { useState, useEffect, useCallback, useMemo } from 'react';
import { Page } from '../types'; // Corrected path
import { db } from '../../../../../config/firebaseConfig'; // Corrected path
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, writeBatch } from 'firebase/firestore';
import { useNotifications } from '../../../../../contexts/NotificationContext'; // Corrected path

// --- usePageManagement Hook ---
export const usePageManagement = () => {
  const { showToast, requestConfirmation } = useNotifications();
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const pagesCollectionRef = useMemo(() => db ? collection(db, 'pages') : null, []);

  const fetchPages = useCallback(async () => {
    if (!db || !pagesCollectionRef) {
      showToast("Error: Firestore database is not initialized.", 'error');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const pagesQuery = query(pagesCollectionRef, orderBy('order', 'asc'));
      const pageSnapshot = await getDocs(pagesQuery);
      const pagesList = pageSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Page));
      setPages(pagesList);
    } catch (err) {
      console.error("Error fetching pages:", err);
      showToast('Failed to load pages. Check console for details.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [pagesCollectionRef, showToast]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const resetForm = useCallback(() => {
    setIsEditing(null);
  }, []);

  const handleFormSubmit = useCallback(async (formData: Omit<Page, 'id' | 'order'>) => {
    setIsLoading(true);
    if (!db) { // Add check right before Firestore operation
      showToast("Error: Firestore database is not initialized.", 'error');
      setIsLoading(false);
      return;
    }
    try {
      let currentOrder: number;
      if (isEditing) {
        const editingPage = pages.find(p => p.id === isEditing);
        currentOrder = editingPage?.order ?? 0;
      } else {
        currentOrder = pages.length > 0 ? Math.max(...pages.map(p => p.order)) + 1 : 0;
      }

      const pageData: Omit<Page, 'id'> = { ...formData, order: currentOrder };

      if (isEditing) {
        const pageRef = doc(db, 'pages', isEditing); // db is now guaranteed non-null here
        await updateDoc(pageRef, pageData);
        showToast('Page updated successfully!', 'success');
      } else {
        if (!pagesCollectionRef) throw new Error("Collection reference not available"); // Ensure ref is checked too
        await addDoc(pagesCollectionRef, pageData);
        showToast('Page added successfully!', 'success');
      }
      resetForm();
      fetchPages(); // Refetch after successful save
    } catch (err) {
      console.error("Error saving page:", err);
      showToast('Failed to save page. Check console for details.', 'error');
      setIsLoading(false); // Ensure loading stops on error
    }
    // No finally setIsLoading(false) here, as fetchPages handles it
  }, [db, pagesCollectionRef, isEditing, pages, showToast, fetchPages, resetForm]);

  const handleDelete = useCallback((id: string) => {
    if (!id) {
        showToast("Cannot delete page: Invalid ID.", 'error');
        return;
    }
    requestConfirmation({
      message: `Are you sure you want to delete the page "${pages.find(p => p.id === id)?.title || id}"?\nThis action cannot be undone.`,
      onConfirm: async () => {
        if (!db) { // Add check inside onConfirm
          showToast("Error: Firestore database is not initialized.", 'error');
          setIsLoading(false); // Stop loading if db is null
          return;
        }
        setIsLoading(true);
        try {
          const pageRef = doc(db, 'pages', id); // db is now guaranteed non-null here
          await deleteDoc(pageRef);
          showToast('Page deleted successfully!', 'success');
          if (isEditing === id) {
            resetForm();
          }
          fetchPages(); // Refetch after delete
        } catch (err) {
          console.error("Error deleting page:", err);
          showToast('Failed to delete page. Check console for details.', 'error');
          setIsLoading(false); // Ensure loading stops on error
        }
        // No finally setIsLoading(false) here, as fetchPages handles it
      },
      confirmText: 'Delete Page',
      title: 'Confirm Deletion'
    });
  }, [db, pages, isEditing, showToast, requestConfirmation, fetchPages, resetForm]);

  const startEditing = useCallback((page: Page) => {
    if (!page.id) {
      showToast("Cannot edit page: Invalid ID.", 'error');
      return;
    }
    setIsEditing(page.id);
  }, [showToast]);

  const handleMove = useCallback(async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= pages.length) return; // Boundary checks

    if (!db || !pagesCollectionRef) { // Add check right before Firestore operation
        showToast("Error: Firestore database or collection ref is not initialized.", 'error');
        return;
    }
    setIsLoading(true);
    const pageToMove = pages[index];
    const pageToSwapWith = pages[newIndex];
    const batch = writeBatch(db); // db is now guaranteed non-null here
    const pageToMoveRef = doc(pagesCollectionRef, pageToMove.id!); // pagesCollectionRef is also checked
    const pageToSwapWithRef = doc(pagesCollectionRef, pageToSwapWith.id!); // pagesCollectionRef is also checked

    batch.update(pageToMoveRef, { order: pageToSwapWith.order });
    batch.update(pageToSwapWithRef, { order: pageToMove.order });

    try {
      await batch.commit();
      showToast(`Page moved ${direction} successfully.`, 'success');
      fetchPages(); // Refetch after move
    } catch (err) {
      console.error(`Error moving page ${direction}:`, err);
      showToast(`Failed to reorder page. Please try again.`, 'error');
      setIsLoading(false); // Ensure loading stops on error
    }
     // No finally setIsLoading(false) here, as fetchPages handles it
  }, [db, pagesCollectionRef, pages, showToast, fetchPages]);

  const handleMoveUp = useCallback((index: number) => handleMove(index, 'up'), [handleMove]);
  const handleMoveDown = useCallback((index: number) => handleMove(index, 'down'), [handleMove]);

  return {
    pages,
    isLoading,
    isEditing,
    // fetchPages, // Not needed externally
    handleFormSubmit,
    handleDelete,
    startEditing,
    resetForm,
    handleMoveUp,
    handleMoveDown,
  };
};