import React, { useState, useEffect } from 'react';
// Import necessary types and Firebase functions
import { Page } from '../types'; // Use the defined Page type
import { db } from '../../firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore'; // Import Firestore functions

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

  // Fetch pages from Firestore on component mount
  useEffect(() => {
    const fetchPages = async () => {
      setIsLoading(true);
      setError(null);
      if (!db) {
        setError("Firestore database is not initialized.");
        setIsLoading(false);
        return;
      }
      try {
        console.log('Fetching pages from Firestore...');
        const pagesCol = collection(db, 'pages');
        // Optional: Order pages by title or another field
        const pagesQuery = query(pagesCol, orderBy('title'));
        const pageSnapshot = await getDocs(pagesQuery);
        const pagesList = pageSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Page));
        setPages(pagesList);
      } catch (err) {
        console.error("Error fetching pages:", err);
        setError('Failed to load pages. Ensure the "pages" collection exists in Firestore.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPages();
  }, []);

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
    // Create page data object without the ID for saving
    const pageData: Omit<Page, 'id'> = { title: pageTitle, slug: pageSlug, content: pageContent };

    try {
      if (isEditing) {
        // Update existing page
        console.log('Updating page in Firestore:', isEditing, pageData);
        const pageRef = doc(db, 'pages', isEditing);
        await updateDoc(pageRef, pageData);
        // Update local state
        setPages(pages.map(p => p.id === isEditing ? { ...pageData, id: isEditing } : p));
        console.log('Page updated successfully.');
      } else {
        // Add new page
        console.log('Adding new page to Firestore:', pageData);
        const pagesCol = collection(db, 'pages');
        const docRef = await addDoc(pagesCol, pageData);
        // Add to local state with new ID
        setPages([...pages, { ...pageData, id: docRef.id }]);
        console.log('Page added successfully with ID:', docRef.id);
      }
      // Reset form and exit editing mode
      resetForm();
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
  };

  // Function to reset the form
  const resetForm = () => {
    setIsEditing(null);
    setPageTitle('');
    setPageSlug('');
    setPageContent('');
  };

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
        <div>
          <label htmlFor="pageContent" className="block text-sm font-medium text-gray-700">Content</label>
          <textarea
            id="pageContent"
            value={pageContent}
            onChange={(e) => setPageContent(e.target.value)}
            rows={10}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter page content here. You can use Markdown or HTML depending on how you render it."
          />
          {/* Consider replacing textarea with a Rich Text Editor component */}
        </div>
        <div className="flex justify-end space-x-3">
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
            {pages.map((page) => (
              <li key={page.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{page.title}</p>
                  <p className="text-sm text-gray-500">/{page.slug}</p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => startEditing(page)}
                    disabled={isLoading}
                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium disabled:opacity-50"
                  >
                    Edit
                  </button>
                  {/* Ensure page.id exists before calling handleDelete */}
                  {page.id && (
                    <button
                      onClick={() => handleDelete(page.id!)} // Use non-null assertion as we checked page.id
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
                    >
                      Delete
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
