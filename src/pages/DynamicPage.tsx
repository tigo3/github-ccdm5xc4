import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Page } from '../features/admin/sections/Pages/types'; // Import the Page type
import 'react-quill/dist/quill.snow.css'; // Import Quill styles to apply formatting

// Simple component to render dynamic page content
const DynamicPage: React.FC<{ page: Page | undefined }> = ({ page }) => {
  const location = useLocation(); // Get location to show if page not found

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

  // Basic rendering - consider using Markdown or HTML renderer based on content type
  // Apply base styles and ensure content area has min-height
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen text-center px-4min-h-screen text-text ltr bg-gradient-to-br from-background to-background-secondary"
    >
      <div className="container mx-auto px-4 py-16  backdrop-blur-sm">
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
        <div className="mt-12 text-center">
            <Link to="/" className="text-secondary hover:text-primary underline">
                &larr; Back to Home
            </Link>
        </div>
      </div>
    </div>
  );
};

export default DynamicPage;
