import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4" style={{ background: 'linear-gradient(to bottom right, var(--background-from-color, #111827), var(--background-to-color, #1F2937))', color: 'var(--text-color, #c6d3e2)' }}>
      <h1 className="text-6xl font-bold mb-4" style={{ color: 'var(--primary-color, #60a5fa)' }}>404</h1>
      <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
      <p className="mb-8 max-w-md">
        Sorry, the page you are looking for does not exist. It might have been moved or deleted.
      </p>
      {/* Use Tailwind classes for background and hover effect */}
      <Link
        to="/"
        className="px-6 py-2 rounded text-white transition-colors bg-primary hover:brightness-110"
        // Apply primary color using CSS variable for background as fallback or if Tailwind isn't configured for it
        style={{ backgroundColor: 'var(--primary-color)' }}
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFoundPage;