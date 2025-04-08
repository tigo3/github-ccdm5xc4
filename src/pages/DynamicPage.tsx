import React, { useEffect } from 'react'; // Removed useState import
import { Link, useLocation } from 'react-router-dom';
import { Page } from '../features/admin/sections/Pages/types'; // Import the Page type
import 'react-quill/dist/quill.snow.css'; // Import Quill styles to apply formatting
import { useTranslations } from '../hooks/useTranslations'; // Added useTranslations import

// Simple component to render dynamic page content
const DynamicPage: React.FC<{ page: Page | undefined }> = ({ page }) => {
  const location = useLocation(); // Get location to show if page not found
  const { t, isLoading: isLoadingTranslations, error: translationsError } = useTranslations('en'); // Added translations hook
  // Removed isAdminLinkVisible state

  // Removed admin link visibility toggle useEffect

  // Log translation errors if any
  useEffect(() => {
    if (translationsError) {
      console.error("DynamicPage: Error loading translations:", translationsError);
    }
  }, [translationsError]);

  if (!page) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-text  min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-xl">The page you requested ({location.pathname}) could not be found.</p>
        <Link to="/" className="mt-6 inline-block  hover:bg-secondary text-text font-bold py-2 px-4 ">
          Go Home
        </Link>
      </div>
    );
  }

  // Use isLoading state from the hook
  if (isLoadingTranslations) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div></div>;
  }
  // Optionally handle translationsError state here, e.g., show an error message

  // Basic rendering - consider using Markdown or HTML renderer based on content type
  // Apply base styles and ensure content area has min-height
  return (
    // Modified flex container to push footer down
    <div
      className="flex flex-col min-h-screen text-text ltr bg-gradient-to-br from-background to-background-secondary pb-20"
    >
      {/* Content container that grows */}
      <div className="flex-grow container mx-auto px-4 py-16 backdrop-blur-sm relative text-center">
        {/* Icon Link added at the top */}
        <Link to="/" className="absolute top-6 left-6 text-secondary hover:text-primary text-2xl" aria-label="Back to Home">
          &larr;
        </Link>
        <h1 className="text-4xl bg-section font-bold container mx-auto px-4 py-16  backdrop-blur-sm text-title" text-titel>{page.title}</h1>
        {/* Render content using Quill's CSS classes */}
        {/* WARNING: Ensure page.content is sanitized if it comes from untrusted sources */}
        <div className="p-6 prose bg-section prose-invert max-w-none text-text"> {/* Keep prose for overall page styling */}
          {/* Apply ql-snow and ql-editor for Quill styles */}
          <div className="ql-snow">
            <div className="ql-editor" dangerouslySetInnerHTML={{ __html: page.content }}></div>
          </div>
        </div>
        {/* Alternative for plain text: <p className="text-lg leading-relaxed text-text">{page.content}</p> */}
        {/* Removed the old text link from the bottom */}
      </div>
      {/* Footer updated: Removed Admin Dashboard link */}
      <footer className="container mx-auto px-4 py-8 text-center"> {/* Removed relative positioning */}
        <p className="text-secondary mb-4">{t.generalInfo.footerText}</p>
        {/* Removed Admin Dashboard Link component */}
      </footer>
    </div>
  );
};

export default DynamicPage;
