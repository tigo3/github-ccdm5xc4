import React, { useState, useEffect } from 'react'; // Removed unused: useMemo, useCallback, lazy, Suspense
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // Removed unused: Link, useLocation
// Icons are now imported within useSocialLinks hook
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, collection, getDocs, query, orderBy } from 'firebase/firestore'; // Removed unused: getDoc
import { auth, db } from './config/firebaseConfig';
// Removed defaultTranslations import, now handled by the hook
import { Page } from './features/admin/sections/Pages/types'; // Import the Page type
import LoginPage from './features/admin/views/LoginPage';
import AdminDashboard from './features/admin/views/AdminDashboard';
// Removed getProjectsData import (used in MainSite)
// Removed Logo import (used in MainSite)
import DynamicPage from './pages/DynamicPage'; // Import from new location
import ScrollToTopButton from './components/ScrollToTopButton'; // Import the new component
import { NotificationProvider } from './context/NotificationContext'; // Import NotificationProvider
// Removed useTranslations import (used in MainSite)
// Removed useSocialLinks import (used in MainSite)
import MainSite from './pages/MainSite'; // Import MainSite from its new location
import NotFoundPage from './pages/NotFoundPage'; // Import the 404 page

// Removed lazy loaded sections (moved to MainSite)



// Removed TranslationsType, now inferred within the hook

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div></div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

// MainSite component definition removed (moved to src/pages/MainSite.tsx)

interface StyleData {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  titleColor?: string;
  h3TitleColor?: string;
  textColor?: string;
  backgroundFromColor?: string;
  backgroundToColor?: string;
  sectionBgColor?: string;
}

// Removed DynamicPage component definition from here

function App() {
  const [dynamicPages, setDynamicPages] = useState<Page[]>([]);
  const [loadingPages, setLoadingPages] = useState(true);

  // Effect for loading styles
  useEffect(() => {
    if (!db) {
      console.error("App.tsx: Firestore not initialized correctly for loading styles.");
      return;
    }
    const stylesDocRef = doc(db, 'settings', 'styles');
    console.log("App.tsx: Setting up real-time listener for global styles...");

    const unsubscribe = onSnapshot(stylesDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as StyleData;
        console.log('App.tsx: Received style update from Firestore:', data);
        document.documentElement.style.setProperty('--primary-color', data.primaryColor);
        document.documentElement.style.setProperty('--secondary-color', data.secondaryColor);
        document.documentElement.style.setProperty('--font-family', data.fontFamily);
        document.documentElement.style.setProperty('--title-color', data.titleColor || '#d7e3ee');
        document.documentElement.style.setProperty('--h3title-color', data.h3TitleColor || '#d7e3ee');
        document.documentElement.style.setProperty('--text-color', data.textColor || '#c6d3e2');
        document.documentElement.style.setProperty('--background-from-color', data.backgroundFromColor || '#111827');
        document.documentElement.style.setProperty('--background-to-color', data.backgroundToColor || '#1F2937');
        document.documentElement.style.setProperty('--section-bg-color', data.sectionBgColor || '#374151');
      } else {
        console.log("App.tsx: No global styles document found in Firestore, applying CSS defaults.");
      }
    }, (error) => {
      console.error("App.tsx: Error listening to global styles:", error);
    });

    return () => {
      console.log("App.tsx: Unsubscribing from global styles listener.");
      unsubscribe();
    };
  }, []);

  // Effect for loading dynamic pages
  useEffect(() => {
    setLoadingPages(true);
    if (!db) {
      console.error("App.tsx: Firestore not initialized correctly for loading pages.");
      setLoadingPages(false);
      return;
    }
    const fetchPages = async () => {
      // Add check for db before using it
      if (!db) {
        console.error("App.tsx: Firestore not initialized correctly for loading pages.");
        setLoadingPages(false);
        return;
      }
      try {
        const pagesCollection = collection(db, 'pages');
        // Fetch pages ordered by the 'order' field
        const pagesQuery = query(pagesCollection, orderBy('order', 'asc'));
        const pagesSnapshot = await getDocs(pagesQuery);
        const pagesList = pagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Page));
        setDynamicPages(pagesList);
        console.log("App.tsx: Fetched dynamic pages:", pagesList);
      } catch (error) {
        console.error("App.tsx: Error fetching dynamic pages:", error);
      } finally {
        setLoadingPages(false);
      }
    };

    fetchPages();
  }, []);


  // Show loading indicator while pages are loading
  if (loadingPages) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <NotificationProvider> {/* Wrap with NotificationProvider */}
      <BrowserRouter>
        <Routes>
          {/* Pass dynamicPages to MainSite */}
          <Route path="/" element={<MainSite dynamicPages={dynamicPages} />} />
        {/* Dynamically create routes for fetched pages */}
        {dynamicPages.map(page => (
          <Route
            key={page.id}
            path={`/${page.slug}`}
            element={<DynamicPage page={page} />}
          />
        ))}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          {/* Catch-all route for 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <ScrollToTopButton /> {/* Add the button here */}
      </BrowserRouter>
    </NotificationProvider>
  );
}

export default App;
