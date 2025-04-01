import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Page } from '../admin/types'; // Import the Page type
import 'react-quill/dist/quill.snow.css'; // Import Quill styles to apply formatting

// Simple component to render dynamic page content
const DynamicPage: React.FC<{ page: Page | undefined }> = ({ page }) => {
  const location = useLocation(); // Get location to show if page not found

  if (!page) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-white min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-xl">The page you requested ({location.pathname}) could not be found.</p>
        <Link to="/" className="mt-6 inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Go Home
        </Link>
      </div>
    );
  }

  // Basic rendering - consider using Markdown or HTML renderer based on content type
  // Apply base styles and ensure content area has min-height
  return (
    <div
      className="min-h-screen text-white"
      style={{
        background: `linear-gradient(to bottom right, var(--background-from-color, #111827), var(--background-to-color, #1F2937))`
      }}
    >
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-6" style={{ color: 'var(--title-color)' }}>{page.title}</h1>
        {/* Render content using Quill's CSS classes */}
        {/* WARNING: Ensure page.content is sanitized if it comes from untrusted sources */}
        <div className="prose prose-invert max-w-none text-text"> {/* Keep prose for overall page styling */}
          {/* Apply ql-snow and ql-editor for Quill styles */}
          <div className="ql-snow">
            <div className="ql-editor" dangerouslySetInnerHTML={{ __html: page.content }}></div>
          </div>
        </div>
        {/* Alternative for plain text: <p className="text-lg leading-relaxed text-text">{page.content}</p> */}
        <div className="mt-12 text-center">
            <Link to="/" className="text-blue-400 hover:text-blue-300 underline">
                &larr; Back to Home
            </Link>
        </div>
      </div>
    </div>
  );
};

export default DynamicPage;
