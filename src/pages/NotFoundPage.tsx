import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4min-h-screen text-text ltr bg-gradient-to-br from-background to-background-secondary">
      <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
      <h2 className="text-2xl font-semibold mb-6 text-primary">Page Not Found</h2>
      <p className="mb-8 max-w-md text-secondary">
        Sorry, the page you are looking for does not exist. It might have been moved or deleted.
      </p>
      {/* Use Tailwind classes for background and hover effect */}
      <Link
        to="/"
        className="px-6 py-2 text-secondary bg-primary hover:bg-gradient-to-br from-background to-background-secondary transition">
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFoundPage;