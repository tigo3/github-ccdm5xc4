import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../../../config/firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, writeBatch } from 'firebase/firestore';
import {
  Trash2, Edit, PlusCircle, Save, XCircle, ArrowUp, ArrowDown,
  Github, Facebook, Mail, Instagram, Linkedin, Twitter, HelpCircle // Added social icons + HelpCircle for fallback
} from 'lucide-react';
import { useNotifications } from '../../../context/NotificationContext'; // Import the hook
import { SocialLink } from '../types'; // Import the shared type

// List of available icons (should match App.tsx)
const availableIcons = [
  "Github", "Facebook", "Mail", "Instagram", "Linkedin", "Twitter"
  // Add more here if needed and ensure they exist in App.tsx's iconComponents
];

// Map icon names to Lucide components (similar to App.tsx)
const iconComponents: { [key: string]: React.ComponentType<{ size?: number | string, className?: string }> } = {
  Github,
  Facebook,
  Mail,
  Instagram,
  Linkedin,
  Twitter,
  // Add more mappings here if availableIcons expands
};

const SocialLinksTab: React.FC = () => {
  const { showToast, requestConfirmation } = useNotifications(); // Get notification functions
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [currentLink, setCurrentLink] = useState<Omit<SocialLink, 'id'>>({ name: '', url: '', icon: availableIcons[0], order: 0 });

  // Memoize the collection reference to prevent re-creation on every render
  const linksCollectionRef = useMemo(() => db ? collection(db, 'socialLinks') : null, []); // Dependency array is empty as `db` is stable from import

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
  }, [linksCollectionRef, showToast]); // Add showToast dependency

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentLink(prev => ({ ...prev, [name]: name === 'order' ? parseInt(value, 10) || 0 : value }));
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingLinkId(null);
    setCurrentLink({ name: '', url: '', icon: availableIcons[0], order: 0 });
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLink.name || !currentLink.url || !currentLink.icon) {
      showToast("Name, URL, and Icon are required.", 'error');
      return;
    }
    if (!db || !linksCollectionRef) {
      showToast("Error: Firestore is not initialized.", 'error');
      return;
    }
    try {
      // Ensure order is set correctly for new links
      const newOrder = links.length > 0 ? Math.max(...links.map(l => l.order)) + 1 : 0;
      await addDoc(linksCollectionRef, { ...currentLink, order: newOrder });
      showToast('Link added successfully!', 'success'); // Success toast
      resetForm();
      fetchLinks(); // Refresh list
    } catch (err) {
      console.error("Error adding link:", err);
      showToast("Failed to add link. Please try again.", 'error');
    }
  };

  const handleUpdateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLinkId || !currentLink.name || !currentLink.url || !currentLink.icon) {
      showToast("Name, URL, and Icon are required.", 'error');
      return;
    }
    if (!db) {
       showToast("Error: Firestore is not initialized.", 'error');
       return;
    }
    try {
      const linkDoc = doc(db, 'socialLinks', editingLinkId);
      // Ensure order is included in the update
      await updateDoc(linkDoc, {
        name: currentLink.name,
        url: currentLink.url,
        icon: currentLink.icon,
        order: currentLink.order
      });
      showToast('Link updated successfully!', 'success'); // Success toast
      resetForm();
      fetchLinks(); // Refresh list
    } catch (err) {
      console.error("Error updating link:", err);
      showToast("Failed to update link. Please try again.", 'error');
    }
  };

  // Function to handle moving a link up
  const handleMoveUp = async (index: number) => {
    if (index === 0 || !db) return;
    const linkToMove = links[index];
    const linkToSwapWith = links[index - 1];

    const batch = writeBatch(db);
    const linkToMoveRef = doc(db, 'socialLinks', linkToMove.id);
    const linkToSwapWithRef = doc(db, 'socialLinks', linkToSwapWith.id);

    // Swap order values
    batch.update(linkToMoveRef, { order: linkToSwapWith.order });
    batch.update(linkToSwapWithRef, { order: linkToMove.order });

    try {
      await batch.commit();
      showToast('Link moved up successfully.', 'success');
      fetchLinks(); // Refresh list with new order
    } catch (err) {
      console.error("Error moving link up:", err);
      showToast("Failed to reorder link. Please try again.", 'error');
    }
  };

  // Function to handle moving a link down
  const handleMoveDown = async (index: number) => {
    if (index === links.length - 1 || !db) return;
    const linkToMove = links[index];
    const linkToSwapWith = links[index + 1];

    const batch = writeBatch(db);
    const linkToMoveRef = doc(db, 'socialLinks', linkToMove.id);
    const linkToSwapWithRef = doc(db, 'socialLinks', linkToSwapWith.id);

    // Swap order values
    batch.update(linkToMoveRef, { order: linkToSwapWith.order });
    batch.update(linkToSwapWithRef, { order: linkToMove.order });

    try {
      await batch.commit();
      showToast('Link moved down successfully.', 'success');
      fetchLinks(); // Refresh list with new order
    } catch (err) {
      console.error("Error moving link down:", err);
      showToast("Failed to reorder link. Please try again.", 'error');
    }
  };


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
    // Ensure order is correctly loaded into the form state
    setCurrentLink({ name: link.name, url: link.url, icon: link.icon, order: link.order });
    setIsAdding(false); // Ensure not in adding mode
  };

  return (
    <div className="p-4 md:p-6 bg-gray-800 rounded-lg shadow-lg text-gray-200">
      <h2 className="text-2xl font-semibold mb-6 text-white">Manage Social Links</h2> {/* Increased margin */}

      {isLoading && <p className="text-center text-gray-400">Loading links...</p>}

      {/* Add/Edit Form - Improved Layout */}
      {(isAdding || editingLinkId) && (
        <form onSubmit={editingLinkId ? handleUpdateLink : handleAddLink} className="mb-6 p-4 bg-gray-700 rounded-lg shadow-md">
          <h3 className="text-xl font-medium mb-4 text-white">{editingLinkId ? 'Edit Link' : 'Add New Link'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Name Input */}
            <div>
              <label htmlFor="link-name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input
                id="link-name"
                type="text"
                name="name"
                placeholder="Link Name (e.g., GitHub)"
                value={currentLink.name}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-600 text-white border border-gray-500 focus:border-blue-400 focus:ring focus:ring-blue-400 focus:ring-opacity-50"
                required
              />
            </div>
            {/* URL Input */}
            <div>
              <label htmlFor="link-url" className="block text-sm font-medium text-gray-300 mb-1">URL</label>
              <input
                id="link-url"
                type="url"
                name="url"
                placeholder="Full URL (e.g., https://github.com/user)"
                value={currentLink.url}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-600 text-white border border-gray-500 focus:border-blue-400 focus:ring focus:ring-blue-400 focus:ring-opacity-50"
                required
              />
            </div>
            {/* Icon Select */}
            <div>
              <label htmlFor="link-icon" className="block text-sm font-medium text-gray-300 mb-1">Icon</label>
              <div className="flex items-center gap-2"> {/* Container for select + preview */}
                <select
                  id="link-icon"
                  name="icon"
                  value={currentLink.icon}
                  onChange={handleInputChange}
                  className="flex-grow p-2 rounded bg-gray-600 text-white border border-gray-500 focus:border-blue-400 focus:ring focus:ring-blue-400 focus:ring-opacity-50"
                  required
                >
                  <option value="" disabled>Select Icon</option>
                  {availableIcons.map(iconName => (
                    <option key={iconName} value={iconName}>{iconName}</option>
                  ))}
                </select>
                {/* Icon Preview */}
                {(() => {
                  const IconComp = iconComponents[currentLink.icon] || HelpCircle;
                  return <IconComp size={24} className="text-gray-400 flex-shrink-0" />;
                })()}
              </div>
            </div>
            {/* Order Input */}
            <div>
              <label htmlFor="link-order" className="block text-sm font-medium text-gray-300 mb-1">Order</label>
              <input
                id="link-order"
                type="number"
                name="order"
                placeholder="Order (e.g., 1)"
                value={currentLink.order}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-600 text-white border border-gray-500 focus:border-blue-400 focus:ring focus:ring-blue-400 focus:ring-opacity-50"
                required
                min="0"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button type="submit" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out shadow hover:shadow-md">
              <Save size={18} /> {editingLinkId ? 'Save Changes' : 'Add Link'}
            </button>
            <button type="button" onClick={resetForm} className="flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out shadow hover:shadow-md">
              <XCircle size={18} /> Cancel
            </button>
          </div>
        </form>
      )}

      {/* Add New Link Button */}
      {!isAdding && !editingLinkId && !isLoading && (
        <button
          onClick={() => { setIsAdding(true); setCurrentLink({ name: '', url: '', icon: availableIcons[0], order: links.length > 0 ? Math.max(...links.map(l => l.order)) + 1 : 0 }); }}
          className="mb-6 flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out shadow hover:shadow-md"
        >
          <PlusCircle size={18} /> Add New Link
        </button>
      )}

      {/* Links List - Improved Layout */}
      {!isLoading && links.length > 0 && (
        <div className="space-y-3">
          {/* Header Row (Visible on Medium+ screens) - Improved Styling */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 bg-gray-600/80 rounded-t-lg p-3 font-semibold text-white items-center sticky top-0 z-10"> {/* Made header sticky */}
            <div className="col-span-1 text-center">Order</div> {/* Centered */}
            <div className="col-span-1 text-center">Icon</div> {/* Added Icon column, centered */}
            <div className="col-span-3">Name</div>
            <div className="col-span-4">URL</div>
            <div className="col-span-3 text-right pr-2">Actions</div> {/* Adjusted span and padding */}
          </div>

          {/* Link Items */}
          {links.map((link, index) => {
            const IconComponent = iconComponents[link.icon] || HelpCircle; // Get icon component or fallback
            const isFirst = index === 0;
            const isLast = index === links.length - 1;
            return (
              <div // Outer item div - Starts around line 322
                key={link.id}
                className="bg-gray-700 rounded-lg shadow p-4 md:grid md:grid-cols-12 md:gap-4 md:items-center md:bg-transparent md:hover:bg-gray-600/30 md:shadow-none md:rounded-none md:border-b md:border-gray-600 md:last:border-b-0 md:py-3 md:px-3 transition-colors duration-150" // Added transition
              >
                {/* Mobile Card Layout - Improved */}
                <div className="md:hidden space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2 min-w-0"> {/* Added min-w-0 for truncation */}
                      <IconComponent size={20} className="text-gray-300 flex-shrink-0" />
                      <span className="font-semibold text-lg text-white truncate">{link.name}</span> {/* Added truncate */}
                    </div>
                    <span className="text-sm text-gray-400 flex-shrink-0">(Order: {link.order})</span>
                  </div>
                  <div className="text-sm break-words"> {/* Use break-words */}
                    <span className="font-medium text-gray-400">URL: </span>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{link.url}</a>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-600 mt-3">
                    {/* Action Buttons - Mobile - Improved Disabled Style & Hover */}
                    <button onClick={() => handleMoveUp(index)} disabled={isFirst} className={`p-1 rounded ${isFirst ? 'text-gray-500 cursor-not-allowed opacity-50' : 'text-blue-400 hover:text-blue-300 hover:bg-gray-600/50'}`} title="Move Up"><ArrowUp size={18} /></button>
                    <button onClick={() => handleMoveDown(index)} disabled={isLast} className={`p-1 rounded ${isLast ? 'text-gray-500 cursor-not-allowed opacity-50' : 'text-blue-400 hover:text-blue-300 hover:bg-gray-600/50'}`} title="Move Down"><ArrowDown size={18} /></button>
                    <button onClick={() => startEditing(link)} className="text-yellow-400 hover:text-yellow-300 hover:bg-gray-600/50 p-1 rounded" title="Edit"><Edit size={18} /></button>
                    <button onClick={() => handleDeleteLink(link.id)} className="text-red-500 hover:text-red-400 hover:bg-gray-600/50 p-1 rounded" title="Delete"><Trash2 size={18} /></button>
                  </div>
                </div> {/* Closing Mobile div */}

                {/* Desktop Table-like Layout - Improved */}
                <div className="hidden md:contents"> {/* Use md:contents for grid layout */}
                  <div className="col-span-1 text-center">{link.order}</div>
                  <div className="col-span-1 flex items-center justify-center"> {/* Center icon */}
                    <IconComponent size={20} className="text-gray-300" /> {/* Removed title prop */}
                  </div>
                  <div className="col-span-3 truncate pr-2">{link.name}</div> {/* Added padding */}
                  <div className="col-span-4 truncate pr-2"> {/* Added padding */}
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{link.url}</a>
                  </div>
                  <div className="col-span-3 flex items-center justify-end gap-1 pr-2"> {/* Added padding */}
                    {/* Action Buttons - Desktop - Improved Disabled Style & Hover */}
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={isFirst}
                      className={`p-1 rounded ${isFirst ? 'text-gray-500 cursor-not-allowed opacity-50' : 'text-blue-400 hover:text-blue-300 hover:bg-gray-600/50'}`}
                      title="Move Up"
                    >
                      <ArrowUp size={18} />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={isLast}
                      className={`p-1 rounded ${isLast ? 'text-gray-500 cursor-not-allowed opacity-50' : 'text-blue-400 hover:text-blue-300 hover:bg-gray-600/50'}`}
                      title="Move Down"
                    >
                      <ArrowDown size={18} />
                    </button>
                    <button onClick={() => startEditing(link)} className="text-yellow-400 hover:text-yellow-300 hover:bg-gray-600/50 p-1 rounded" title="Edit">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDeleteLink(link.id)} className="text-red-500 hover:text-red-400 hover:bg-gray-600/50 p-1 rounded" title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </div> {/* Closing Desktop Action Buttons div */}
                </div> {/* Closing Desktop div */}
              </div> // Closing Outer item div
            ); // Closing return
          })} {/* Closing map */}
        </div> // Closing space-y-3 div
      )} {/* Closing conditional rendering for list */}

      {/* Improved Empty State */}
      {!isLoading && links.length === 0 && !isAdding && (
         <div className="text-center text-gray-400 mt-6 p-6 border border-dashed border-gray-600 rounded-lg bg-gray-700/30">
           <p className="font-medium">No social links found.</p>
           <p className="text-sm mt-1">Click "Add New Link" above to get started.</p>
         </div> // Closing empty state div
       )} {/* Closing conditional rendering for empty state */}
    </div> // Closing main component div
  ); // Closing return statement
}; // Closing component function

export default SocialLinksTab;
