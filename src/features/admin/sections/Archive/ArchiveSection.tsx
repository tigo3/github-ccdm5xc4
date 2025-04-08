import React, { useState } from 'react';
import { useNotifications } from '../../../../contexts/NotificationContext'; // Import notification hook
import supabase from '../../../../config/supabaseConfig'; // Import supabase client
import { db } from '../../../../config/firebaseConfig'; // Import firebase db
import { collection, getDocs, doc, writeBatch, getDoc } from 'firebase/firestore'; // Import firestore functions, added getDoc

const ArchiveSection: React.FC = () => {
  const { showToast, requestConfirmation } = useNotifications(); // Get showToast and requestConfirmation
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [availableBackups, setAvailableBackups] = useState<{ name: string; created_at: string }[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);

  // Function to fetch all relevant data from Firestore
  const fetchAllSiteData = async () => {
    // IMPORTANT: Define ALL collections/documents that constitute a full site backup.
    // Include 'settings' collection for the styles document, remove 'styles'
    const collectionsToBackup = ['translations', 'projects', 'services', 'pages', 'socialLinks', 'generalInfo', 'settings']; // Example list - ADJUST THIS
    const backupData: { [key: string]: any } = {};

    try {
      if (!db) {
        throw new Error("Firestore database instance is not available.");
      }
      for (const collectionName of collectionsToBackup) {
        // Handle potential single-document "collections" like generalInfo or styles
        // Handle single-document collections/paths
        if (collectionName === 'generalInfo') {
           // Assuming 'generalInfo' is stored as a single document with ID 'main'
           const docRef = doc(db, 'generalInfo', 'main'); // db is checked above
           const docSnap = await getDoc(docRef);
           if (docSnap.exists()) {
             backupData[collectionName] = { [docSnap.id]: docSnap.data() };
           } else {
             console.warn(`Document 'main' not found in collection 'generalInfo'`);
           }
        } else if (collectionName === 'settings') {
           // Fetch the specific 'styles' document from the 'settings' collection
           const docRef = doc(db, 'settings', 'styles'); // db is checked above
           const docSnap = await getDoc(docRef);
           if (docSnap.exists()) {
             // Store it under 'settings' key, with 'styles' as the doc ID key
             backupData[collectionName] = { styles: docSnap.data() };
           } else {
             console.warn(`Document 'styles' not found in collection 'settings'`);
           }
        } else {
          // Handle regular collections with multiple documents
          const querySnapshot = await getDocs(collection(db, collectionName)); // db is checked above
          const docsData: { [key: string]: any } = {};
          querySnapshot.forEach((doc) => {
            docsData[doc.id] = doc.data();
          });
          if (Object.keys(docsData).length > 0) {
             backupData[collectionName] = docsData;
          } else {
             console.warn(`No documents found in collection '${collectionName}'`);
          }
        }
      }
      console.log('Data fetched for backup:', backupData);
      return backupData;
    } catch (error) {
      console.error("Error fetching data from Firestore:", error);
      throw new Error("Failed to fetch site data for backup.");
    }
  };

  // Function to list backups from Supabase
  const listBackups = async () => {
      if (!supabase) return;
      try {
          const { data: files, error: listError } = await supabase.storage
              .from('backups')
              .list('', { limit: 100, offset: 0, sortBy: { column: 'created_at', order: 'desc' } }); // List latest 100

          if (listError) throw listError;

          if (files) {
              setAvailableBackups(files.map(f => ({ name: f.name, created_at: f.created_at || new Date().toISOString() })));
          } else {
              setAvailableBackups([]);
          }
      } catch (error: any) {
          console.error('Failed to list backups:', error);
          showToast(`Failed to list backups: ${error.message}`, 'error');
          setAvailableBackups([]);
      }
  };

  // Fetch backups on component mount
  React.useEffect(() => {
      listBackups();
  }, []);


  const handleBackup = async () => {
    console.log("Backup process started."); // Log start
    if (!supabase) {
      console.error("handleBackup: Supabase client is null."); // Log error
      showToast('Supabase client not initialized.', 'error');
      return;
    }
    setIsBackingUp(true);
    // Assuming 'info' maps to 'success' for ToastType
    showToast('Starting site backup...', 'success');

    try {
      console.log("handleBackup: Attempting to fetch site data..."); // Log fetch attempt
      const siteData = await fetchAllSiteData();
      console.log("handleBackup: Site data fetched:", siteData); // Log fetched data

      if (!siteData || Object.keys(siteData).length === 0) {
         console.warn("handleBackup: No site data found or fetch failed."); // Log warning
         // Assuming 'warning' maps to 'error' for ToastType
         showToast('No data found to backup.', 'error');
         setIsBackingUp(false);
         return;
      }

      const jsonData = JSON.stringify(siteData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `backup-${timestamp}.json`;
      console.log(`handleBackup: Preparing to upload file: ${fileName}`); // Log upload prep

      // supabase is checked at the start of the function
      const { data, error } = await supabase.storage
        .from('backups') // Ensure this bucket name is correct
        .upload(fileName, blob, { cacheControl: '3600', upsert: false });

      if (error) {
        console.error("handleBackup: Supabase upload error:", error); // Log Supabase error
        throw new Error(error.message || 'Failed to upload backup to Supabase.');
      }

      console.log('handleBackup: Supabase upload successful:', data); // Log success
      showToast('Site backup successful!', 'success');
      await listBackups(); // Refresh backup list

    } catch (error: any) {
      console.error('Backup failed:', error);
      showToast(`Backup failed: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setIsBackingUp(false);
    }
  };

  // Function to write restored data back to Firestore
  const writeDataToFirestore = async (dataToRestore: { [key: string]: any }) => {
      if (!db) {
        throw new Error("Firestore database instance is not available for writing.");
      }
      const batch = writeBatch(db); // db is checked above

      for (const collectionName in dataToRestore) {
          const collectionOrDocData = dataToRestore[collectionName];
          // Check if it's the specific settings/styles document structure
          if (collectionName === 'settings' && collectionOrDocData.hasOwnProperty('styles')) {
              const docRef = doc(db, 'settings', 'styles'); // db is checked above
              batch.set(docRef, collectionOrDocData.styles); // Restore the styles document
          } else {
              // Handle regular collections
              for (const docId in collectionOrDocData) {
                  const docData = collectionOrDocData[docId];
                  const docRef = doc(db, collectionName, docId); // db is checked above
                  batch.set(docRef, docData); // Use set to overwrite existing documents
              }
          }
      }

      await batch.commit();
  };


  const handleRestore = async () => {
    if (!selectedBackup) {
        // Assuming 'warning' maps to 'error' for ToastType
        showToast('Please select a backup file to restore.', 'error');
        return;
    }
    if (!supabase) {
      showToast('Supabase client not initialized.', 'error');
      return;
    }

    requestConfirmation({
        title: 'Confirm Restore',
        message: `Are you sure you want to restore the site from backup "${selectedBackup}"? This will overwrite current site data. This action cannot be undone.`,
        confirmText: 'Restore Now',
        cancelText: 'Cancel',
        onConfirm: async () => {
            setIsRestoring(true);
            // Assuming 'info' maps to 'success' for ToastType
            showToast(`Starting restore from ${selectedBackup}...`, 'success');

            try {
                // 1. Download the selected backup file
                // Add explicit null check for supabase inside the callback
                if (!supabase) {
                    showToast('Supabase client is not available.', 'error');
                    setIsRestoring(false); // Ensure state is reset
                    return;
                }
                const { data: downloadData, error: downloadError } = await supabase.storage
                    .from('backups')
                    .download(selectedBackup);

                if (downloadError) throw downloadError;
                if (!downloadData) throw new Error('Failed to download backup file.');

                // 2. Parse the JSON data
                const text = await downloadData.text();
                const restoredData = JSON.parse(text);
                console.log("Data to restore:", restoredData);

                if (typeof restoredData !== 'object' || restoredData === null) {
                    throw new Error('Invalid backup file format.');
                }

                // 3. Write data back to Firestore
                await writeDataToFirestore(restoredData);

                showToast('Site restore successful!', 'success');

            } catch (error: any) {
                console.error('Restore failed:', error);
                showToast(`Restore failed: ${error.message || 'Unknown error'}`, 'error');
            } finally {
                setIsRestoring(false);
            }
        },
    });
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Archive & Restore (Supabase)</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        Backup your site configuration and data from Firestore to Supabase Storage, or restore from a previous backup.
      </p>

      {/* Backup Button */}
      <div className="mb-6">
        <button
          onClick={handleBackup}
          className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200 flex items-center justify-center w-full md:w-auto ${isBackingUp ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isBackingUp || isRestoring}
        >
          {isBackingUp ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Backing up...
            </>
          ) : (
            'Backup Site Data Now'
          )}
        </button>
      </div>

      {/* Restore Section */}
      <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-3">Restore from Backup</h3>
          {availableBackups.length > 0 ? (
              <>
                  <label htmlFor="backup-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Backup File:</label>
                  <select
                      id="backup-select"
                      value={selectedBackup || ''}
                      onChange={(e) => setSelectedBackup(e.target.value)}
                      className="block w-full md:w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      disabled={isRestoring || isBackingUp}
                  >
                      <option value="" disabled>-- Select a backup --</option>
                      {availableBackups.map((backup) => (
                          <option key={backup.name} value={backup.name}>
                              {backup.name} ({new Date(backup.created_at).toLocaleString()})
                          </option>
                      ))}
                  </select>

                  <button
                      onClick={handleRestore}
                      className={`mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-200 flex items-center justify-center w-full md:w-auto ${isRestoring || !selectedBackup ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={isRestoring || isBackingUp || !selectedBackup}
                  >
                      {isRestoring ? (
                          <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Restoring...
                          </>
                      ) : (
                          'Restore Selected Backup'
                      )}
                  </button>
                  <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                      Warning: Restoring will overwrite all current site data with the content from the selected backup.
                  </p>
              </>
          ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No backups found in Supabase Storage bucket 'backups'.</p>
          )}
      </div>
    </div>
  );
};

export default ArchiveSection;