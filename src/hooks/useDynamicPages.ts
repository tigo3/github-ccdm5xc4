import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { Page } from '../features/admin/sections/Pages/types'; // Ensure the Page type is imported

export const useDynamicPages = () => {
  const [dynamicPages, setDynamicPages] = useState<Page[]>([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [errorPages, setErrorPages] = useState<Error | null>(null); // Add error state

  useEffect(() => {
    setLoadingPages(true);
    setErrorPages(null); // Reset error state on new fetch attempt

    if (!db) {
      console.error("useDynamicPages: Firestore not initialized correctly.");
      setErrorPages(new Error("Firestore not initialized correctly."));
      setLoadingPages(false);
      return;
    }

    const fetchPages = async () => {
      // Add the null check here again to satisfy TypeScript
      if (!db) {
          console.error("useDynamicPages: Firestore not initialized inside fetchPages.");
          setErrorPages(new Error("Firestore not initialized."));
          setLoadingPages(false); // Ensure loading stops
          return;
      }
      try {
        const pagesCollection = collection(db, 'pages');
        // Fetch pages ordered by the 'order' field
        const pagesQuery = query(pagesCollection, orderBy('order', 'asc'));
        const pagesSnapshot = await getDocs(pagesQuery);
        const pagesList = pagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Page));
        setDynamicPages(pagesList);
        // console.log("useDynamicPages: Fetched dynamic pages:", pagesList); // Removed log
      } catch (error) {
        // Keep error logging for debugging purposes, but remove the success log.
        console.error("useDynamicPages: Error fetching dynamic pages:", error);
        setErrorPages(error instanceof Error ? error : new Error('An unknown error occurred'));
      } finally {
        setLoadingPages(false);
      }
    };

    fetchPages();
    // No cleanup needed for getDocs, but if using onSnapshot, add unsubscribe here.
  }, []); // Empty dependency array ensures this runs only once on mount

  return { dynamicPages, loadingPages, errorPages };
};