import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Import useMemo
import { db } from '../../../config/firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, writeBatch } from 'firebase/firestore';
import { Trash2, Edit, PlusCircle, Save, XCircle, ArrowUp, ArrowDown } from 'lucide-react';

// Re-use the interface from App.tsx (consider moving to a shared types file later)
interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: string;
  order: number;
}

// List of available icons (should match App.tsx)
const availableIcons = [
  "Github", "Facebook", "Mail", "Instagram", "Linkedin", "Twitter" 
  // Add more here if needed and ensure they exist in App.tsx's iconComponents
];

const SocialLinksTab: React.FC = () => {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [currentLink, setCurrentLink] = useState<Omit<SocialLink, 'id'>>({ name: '', url: '', icon: availableIcons[0], order: 0 });

  // Memoize the collection reference to prevent re-creation on every render
  const linksCollectionRef = useMemo(() => db ? collection(db, 'socialLinks') : null, []); // Dependency array is empty as `db` is stable from import

  const fetchLinks = useCallback(async () => {
    if (!db || !linksCollectionRef) {
      setError("Firestore is not initialized correctly.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const q = query(linksCollectionRef, orderBy('order', 'asc'));
      const data = await getDocs(q);
      const fetchedLinks = data.docs.map((doc) => ({ ...doc.data(), id: doc.id } as SocialLink));
      setLinks(fetchedLinks);
    } catch (err) {
      // Keep console error for debugging potential fetch issues
      console.error("Error fetching social links:", err);
      setError("Failed to load social links. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [linksCollectionRef]);

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
      setError("Name, URL, and Icon are required.");
      return;
    }
    setError(null);
    if (!db || !linksCollectionRef) {
      setError("Firestore is not initialized correctly.");
      return;
    }
    try {
      await addDoc(linksCollectionRef, currentLink);
      resetForm();
      fetchLinks(); // Refresh list
    } catch (err) {
      console.error("Error adding link:", err);
      setError("Failed to add link. Please try again.");
    }
  };

  const handleUpdateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLinkId || !currentLink.name || !currentLink.url || !currentLink.icon) {
      setError("Name, URL, and Icon are required.");
      return;
    }
    setError(null);
    if (!db) {
       setError("Firestore is not initialized correctly.");
       return;
    }
    try {
      const linkDoc = doc(db, 'socialLinks', editingLinkId);
      await updateDoc(linkDoc, currentLink);
      resetForm();
      fetchLinks(); // Refresh list
    } catch (err) {
      console.error("Error updating link:", err);
      setError("Failed to update link. Please try again.");
    }
  };

  // Function to handle moving a link up
  const handleMoveUp = async (index: number) => {
    if (index === 0 || !db) return; // Cannot move the first item up or if db is not available
    setError(null);
    const linkToMove = links[index];
    const linkToSwapWith = links[index - 1];

    // Prepare batch write
    const batch = writeBatch(db);
    const linkToMoveRef = doc(db, 'socialLinks', linkToMove.id);
    const linkToSwapWithRef = doc(db, 'socialLinks', linkToSwapWith.id);

    // Swap order values
    batch.update(linkToMoveRef, { order: linkToSwapWith.order });
    batch.update(linkToSwapWithRef, { order: linkToMove.order });

    try {
      await batch.commit();
      fetchLinks(); // Refresh list with new order
    } catch (err) {
      console.error("Error moving link up:", err);
      setError("Failed to reorder link. Please try again.");
    }
  };

  // Function to handle moving a link down
  const handleMoveDown = async (index: number) => {
    if (index === links.length - 1 || !db) return; // Cannot move the last item down or if db is not available
    setError(null);
    const linkToMove = links[index];
    const linkToSwapWith = links[index + 1];

    // Prepare batch write
    const batch = writeBatch(db);
    const linkToMoveRef = doc(db, 'socialLinks', linkToMove.id);
    const linkToSwapWithRef = doc(db, 'socialLinks', linkToSwapWith.id);

    // Swap order values
    batch.update(linkToMoveRef, { order: linkToSwapWith.order });
    batch.update(linkToSwapWithRef, { order: linkToMove.order });

    try {
      await batch.commit();
      fetchLinks(); // Refresh list with new order
    } catch (err) {
      console.error("Error moving link down:", err);
      setError("Failed to reorder link. Please try again.");
    }
  };


  const handleDeleteLink = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this link?")) {
      setError(null);
       if (!db) {
          setError("Firestore is not initialized correctly.");
          return;
       }
      try {
        const linkDoc = doc(db, 'socialLinks', id);
        await deleteDoc(linkDoc);
        fetchLinks(); // Refresh list
      } catch (err) {
        console.error("Error deleting link:", err);
        setError("Failed to delete link. Please try again.");
      }
    }
  };

  const startEditing = (link: SocialLink) => {
    setEditingLinkId(link.id);
    setCurrentLink({ name: link.name, url: link.url, icon: link.icon, order: link.order });
    setIsAdding(false); // Ensure not in adding mode
  };

  return (
    <div className="p-4 md:p-6 bg-gray-800 rounded-lg shadow-lg text-gray-200">
      <h2 className="text-2xl font-semibold mb-4 text-white">Manage Social Links</h2>

      {error && <p className="text-red-400 bg-red-900/50 p-3 rounded mb-4">{error}</p>}
      {isLoading && <p>Loading links...</p>}

      {/* Add/Edit Form */}
      {(isAdding || editingLinkId) && (
        <form onSubmit={editingLinkId ? handleUpdateLink : handleAddLink} className="mb-6 p-4 bg-gray-700 rounded">
          <h3 className="text-xl font-medium mb-3 text-white">{editingLinkId ? 'Edit Link' : 'Add New Link'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <input
              type="text"
              name="name"
              placeholder="Link Name (e.g., GitHub)"
              value={currentLink.name}
              onChange={handleInputChange}
              className="p-2 rounded bg-gray-600 text-white border border-gray-500 focus:border-blue-400 focus:ring focus:ring-blue-400 focus:ring-opacity-50"
              required
            />
            <input
              type="url"
              name="url"
              placeholder="Full URL (e.g., https://github.com/user)"
              value={currentLink.url}
              onChange={handleInputChange}
              className="p-2 rounded bg-gray-600 text-white border border-gray-500 focus:border-blue-400 focus:ring focus:ring-blue-400 focus:ring-opacity-50"
              required
            />
            <select
              name="icon"
              value={currentLink.icon}
              onChange={handleInputChange}
              className="p-2 rounded bg-gray-600 text-white border border-gray-500 focus:border-blue-400 focus:ring focus:ring-blue-400 focus:ring-opacity-50"
              required
            >
              <option value="" disabled>Select Icon</option>
              {availableIcons.map(iconName => (
                <option key={iconName} value={iconName}>{iconName}</option>
              ))}
            </select>
            <input
              type="number"
              name="order"
              placeholder="Order (e.g., 1)"
              value={currentLink.order}
              onChange={handleInputChange}
              className="p-2 rounded bg-gray-600 text-white border border-gray-500 focus:border-blue-400 focus:ring focus:ring-blue-400 focus:ring-opacity-50"
              required
              min="0"
            />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out">
              <Save size={18} /> {editingLinkId ? 'Save Changes' : 'Add Link'}
            </button>
            <button type="button" onClick={resetForm} className="flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out">
              <XCircle size={18} /> Cancel
            </button>
          </div>
        </form>
      )}

      {/* Add New Link Button */}
      {!isAdding && !editingLinkId && (
        <button
          onClick={() => { setIsAdding(true); setCurrentLink({ name: '', url: '', icon: availableIcons[0], order: links.length > 0 ? Math.max(...links.map(l => l.order)) + 1 : 0 }); }}
          className="mb-6 flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
        >
          <PlusCircle size={18} /> Add New Link
        </button>
      )}

      {/* Links List */}
      {!isLoading && links.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-700 rounded">
            <thead>
              <tr className="bg-gray-600">
                <th className="text-left py-2 px-3 text-white">Order</th>
                <th className="text-left py-2 px-3 text-white">Name</th>
                <th className="text-left py-2 px-3 text-white">URL</th>
                <th className="text-left py-2 px-3 text-white">Icon</th>
                <th className="text-left py-2 px-3 text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link, index) => (
                <tr key={link.id} className="border-b border-gray-600 hover:bg-gray-600/50">
                  <td className="py-2 px-3">{link.order}</td>
                  <td className="py-2 px-3">{link.name}</td>
                  <td className="py-2 px-3"><a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate max-w-xs inline-block">{link.url}</a></td>
                  <td className="py-2 px-3">{link.icon}</td>
                  <td className="py-2 px-3 flex items-center gap-1">
                     {/* Move Up Button */}
                     <button
                       onClick={() => handleMoveUp(index)}
                       disabled={index === 0}
                       className={`p-1 ${index === 0 ? 'text-gray-500 cursor-not-allowed' : 'text-blue-400 hover:text-blue-300'}`}
                       title="Move Up"
                     >
                       <ArrowUp size={18} />
                     </button>
                     {/* Move Down Button */}
                     <button
                       onClick={() => handleMoveDown(index)}
                       disabled={index === links.length - 1}
                       className={`p-1 ${index === links.length - 1 ? 'text-gray-500 cursor-not-allowed' : 'text-blue-400 hover:text-blue-300'}`}
                       title="Move Down"
                     >
                       <ArrowDown size={18} />
                     </button>
                     {/* Edit Button */}
                    <button onClick={() => startEditing(link)} className="text-yellow-400 hover:text-yellow-300 p-1" title="Edit">
                      <Edit size={18} />
                    </button>
                    {/* Delete Button */}
                    <button onClick={() => handleDeleteLink(link.id)} className="text-red-500 hover:text-red-400 p-1" title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
       {!isLoading && links.length === 0 && !isAdding && (
         <p className="text-center text-gray-400 mt-4">No social links found. Add one!</p>
       )}
    </div>
  );
};

export default SocialLinksTab;
