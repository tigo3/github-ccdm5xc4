import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Removed useRef
// Import necessary types and Firebase functions
import { Page } from '../types'; // Use the defined Page type
import QuillEditor from '../components/QuillEditor'; // Import the new QuillEditor component
import { db } from '../../../config/firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, writeBatch } from 'firebase/firestore'; // Import Firestore functions, added writeBatch
import { Trash2, Edit, Save, XCircle, ArrowUp, ArrowDown } from 'lucide-react'; // Added icons

const PagesTab: React.FC = () => {
  // State for managing pages
  const [pages, setPages] = useState<Page[]>([]); // Use the Page type
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for the form (add/edit)
  const [isEditing, setIsEditing] = useState<string | null>(null); // Store ID of page being edited
  const [pageTitle, setPageTitle] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [pageContent, setPageContent] = useState(''); // Or use a richer editor state
  const [pageOrder, setPageOrder] = useState(0); // Add state for order

  // Memoize collection ref
  const pagesCollectionRef = useMemo(() => db ? collection(db, 'pages') : null, []);
  // Removed quillRef

  // Fetch pages from Firestore on component mount
  const fetchPages = useCallback(async () => {
    if (!db || !pagesCollectionRef) {
      setError("Firestore database is not initialized.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching pages from Firestore...');
      // Order pages by the 'order' field
      const pagesQuery = query(pagesCollectionRef, orderBy('order', 'asc')); // Changed orderBy field
      const pageSnapshot = await getDocs(pagesQuery);
      const pagesList = pageSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Page));
      setPages(pagesList);
    } catch (err) {
      console.error("Error fetching pages:", err);
      setError('Failed to load pages. Ensure the "pages" collection exists and has an "order" field.'); // Updated error message
    } finally {
      setIsLoading(false);
    }
   }, [pagesCollectionRef]); // Add dependency

  useEffect(() => {
    fetchPages();
  }, [fetchPages]); // Use the useCallback version

  // Removed the useEffect hook for preventing page jump (moved to QuillEditor)

  // Implement form submission logic (add/update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageTitle || !pageSlug || !pageContent) {
        setError("Title, Slug, and Content are required.");
        return;
    }
    setIsLoading(true);
    setError(null);
    if (!db) {
      setError("Firestore database is not initialized. Cannot save page.");
      setIsLoading(false);
      return;
    }
    // Calculate order for new page
    const orderForNewPage = pages.length > 0 ? Math.max(...pages.map(p => p.order)) + 1 : 0;
    const currentOrder = isEditing ? pageOrder : orderForNewPage;

    // Create page data object without the ID for saving
    const pageData: Omit<Page, 'id'> = {
        title: pageTitle,
        slug: pageSlug,
        content: pageContent,
        order: currentOrder // Include order
    };

    try {
      if (isEditing) {
        // Update existing page
        console.log('Updating page in Firestore:', isEditing, pageData);
        const pageRef = doc(db, 'pages', isEditing);
        await updateDoc(pageRef, pageData);
        console.log('Page updated successfully.');
      } else {
        // Add new page
        console.log('Adding new page to Firestore:', pageData);
        if (!pagesCollectionRef) throw new Error("Collection reference not available");
        await addDoc(pagesCollectionRef, pageData);
        console.log('Page added successfully.');
      }
      // Reset form and fetch updated list
      resetForm();
      fetchPages(); // Fetch updated list including the new/updated item and correct order
    } catch (err) {
      console.error("Error saving page:", err);
      setError('Failed to save page. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Implement delete logic
  const handleDelete = async (id: string) => {
    if (!id) {
        console.error("Cannot delete page without ID.");
        setError("Cannot delete page: Invalid ID.");
        return;
    }
    if (window.confirm(`Are you sure you want to delete the page with ID: ${id}?`)) {
      setIsLoading(true);
      setError(null);
      if (!db) {
        setError("Firestore database is not initialized. Cannot delete page.");
        setIsLoading(false);
        return;
      }
      try {
        console.log('Deleting page from Firestore:', id);
        const pageRef = doc(db, 'pages', id);
        await deleteDoc(pageRef);
        // Remove from local state
        setPages(pages.filter(p => p.id !== id));
        console.log('Page deleted successfully.');
        // If deleting the page currently being edited, reset the form
        if (isEditing === id) {
            resetForm();
        }
      } catch (err) {
        console.error("Error deleting page:", err);
        setError('Failed to delete page. Check console for details.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Function to start editing a page
  const startEditing = (page: Page) => { // Use Page type
    if (!page.id) {
        console.error("Cannot edit page without ID.");
        setError("Cannot edit page: Invalid ID.");
        return;
    }
    setIsEditing(page.id);
    setPageTitle(page.title);
    setPageSlug(page.slug);
    setPageContent(page.content);
    setPageOrder(page.order); // Set order when editing
  };

  // Function to reset the form
  const resetForm = () => {
    setIsEditing(null);
    setPageTitle('');
    setPageSlug('');
    setPageContent('');
    setPageOrder(0); // Reset order
  };

  // --- Add Move Up/Down Handlers ---
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= pages.length || !db || !pagesCollectionRef) return; // Boundary checks and db check

    setError(null);
    setIsLoading(true); // Indicate activity

    const pageToMove = pages[index];
    const pageToSwapWith = pages[newIndex];

    // Prepare batch write
    const batch = writeBatch(db);
    const pageToMoveRef = doc(pagesCollectionRef, pageToMove.id!);
    const pageToSwapWithRef = doc(pagesCollectionRef, pageToSwapWith.id!);

    // Swap order values
    batch.update(pageToMoveRef, { order: pageToSwapWith.order });
    batch.update(pageToSwapWithRef, { order: pageToMove.order });

    try {
      await batch.commit();
      fetchPages(); // Refresh list with new order
    } catch (err) {
      console.error(`Error moving page ${direction}:`, err);
      setError(`Failed to reorder page. Please try again.`);
      setIsLoading(false); // Ensure loading state is reset on error
    }
    // setIsLoading(false) will be called in fetchPages' finally block
  };

  const handleMoveUp = (index: number) => handleMove(index, 'up');
  const handleMoveDown = (index: number) => handleMove(index, 'down');
  // --- End Move Up/Down Handlers ---

  // Removed Quill modules and formats (moved to QuillEditor)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Manage Pages</h2>

      {error && <p className="text-red-500 bg-red-100 p-3 rounded">{error}</p>}

      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm bg-white space-y-4">
        <h3 className="text-lg font-medium">{isEditing ? 'Edit Page' : 'Add New Page'}</h3>
        <div>
          <label htmlFor="pageTitle" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            id="pageTitle"
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="pageSlug" className="block text-sm font-medium text-gray-700">Slug (URL Path, e.g., 'about-us')</label>
          <input
            type="text"
            id="pageSlug"
            value={pageSlug}
            onChange={(e) => setPageSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            pattern="^[a-z0-9-]+$"
            title="Slug can only contain lowercase letters, numbers, and hyphens."
          />
        </div>
        <div className="relative quill-editor-wrapper">
          <label htmlFor="pageContent" className="block text-sm font-medium text-gray-700">Content</label>
          {/* Use the new QuillEditor component */}
          <QuillEditor
            value={pageContent}
            onChange={setPageContent}
            placeholder="Enter page content here..."
            // style and className are handled by the QuillEditor component defaults
          />
        </div>
        {/* Add some padding top to separate buttons from editor */}
        <div className="flex justify-end space-x-3 pt-4">
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Cancel Edit
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : (isEditing ? 'Update Page' : 'Add Page')}
          </button>
        </div>
      </form>

      {/* Pages List */}
      <div className="mt-6 border rounded shadow-sm bg-white">
        <h3 className="text-lg font-medium p-4 border-b">Existing Pages</h3>
        {isLoading && !pages.length ? (
          <p className="p-4 text-gray-500">Loading pages...</p>
        ) : pages.length === 0 ? (
          <p className="p-4 text-gray-500">No pages found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {pages.map((page, index) => ( // Added index here
              <li key={page.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                   {/* Order Display (Optional but helpful) */}
                   <span className="text-xs font-mono text-gray-400 w-6 text-right">{page.order}</span>
                   {/* Page Info */}
                   <div>
                     <p className="font-medium text-gray-900">{page.title}</p>
                     <p className="text-sm text-gray-500">/{page.slug}</p>
                   </div>
                </div>
                <div className="flex items-center space-x-1">
                   {/* Move Up Button */}
                   <button
                     onClick={() => handleMoveUp(index)}
                     disabled={isLoading || index === 0}
                     className={`p-1 rounded ${isLoading || index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-100'}`}
                     title="Move Up"
                   >
                     <ArrowUp size={18} />
                   </button>
                   {/* Move Down Button */}
                   <button
                     onClick={() => handleMoveDown(index)}
                     disabled={isLoading || index === pages.length - 1}
                     className={`p-1 rounded ${isLoading || index === pages.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-100'}`}
                     title="Move Down"
                   >
                     <ArrowDown size={18} />
                   </button>
                   {/* Edit Button */}
                   <button
                     onClick={() => startEditing(page)}
                     disabled={isLoading}
                     className="p-1 rounded text-gray-500 hover:text-indigo-600 hover:bg-indigo-100 disabled:opacity-50"
                     title="Edit"
                   >
                     <Edit size={18} />
                   </button>
                   {/* Delete Button */}
                   {page.id && (
                     <button
                       onClick={() => handleDelete(page.id!)}
                       disabled={isLoading}
                       className="p-1 rounded text-gray-500 hover:text-red-600 hover:bg-red-100 disabled:opacity-50"
                       title="Delete"
                     >
                       <Trash2 size={18} />
                     </button>
                   )}
                 </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PagesTab;
