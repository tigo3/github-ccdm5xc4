import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Custom Hooks
import { useGlobalStyles } from './hooks/useGlobalStyles';
import { useDynamicPages } from './hooks/useDynamicPages';

// Context
import { NotificationProvider } from './context/NotificationContext';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute'; // Import the extracted component
import ScrollToTopButton from './components/ScrollToTopButton';

// Pages
import LoginPage from './features/admin/views/LoginPage';
import AdminDashboard from './features/admin/views/AdminDashboard';
import DynamicPage from './pages/DynamicPage';
import MainSite from './pages/MainSite';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  // Apply global styles fetched from Firestore
  useGlobalStyles();

  // Fetch dynamic pages
  const { dynamicPages, loadingPages, errorPages } = useDynamicPages();

  // Loading state for dynamic pages
  if (loadingPages) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state for dynamic pages
  if (errorPages) {
    // Display a user-friendly error message
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-100 text-red-800 p-4 text-center">
        <h2 className="text-xl font-semibold mb-2">Error Loading Application Data</h2>
        <p>We encountered an issue fetching necessary data. Please try refreshing the page.</p>
        <p className="text-sm mt-2">Details: {errorPages.message}</p>
      </div>
    );
  }

  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          {/* Main site route, passing dynamic pages */}
          <Route path="/" element={<MainSite dynamicPages={dynamicPages} />} />

          {/* Dynamically create routes for fetched pages */}
          {dynamicPages.map(page => (
            <Route
              key={page.id}
              path={`/${page.slug}`}
              element={<DynamicPage page={page} />} // Pass the specific page data
            />
          ))}

          {/* Admin Routes */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          {/* Redirect base /admin to login */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <ScrollToTopButton />
      </BrowserRouter>
    </NotificationProvider>
  );
}

export default App;
