import React from 'react';

interface AdminHeaderProps {
  resetToDefaults: () => Promise<void>;
  handleLogout: () => Promise<void>;
  logoutError: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  resetToDefaults,
  handleLogout,
  logoutError,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-300 gap-4">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
      {/* Reverted container */}
      <div className="flex gap-2 flex-wrap justify-center sm:justify-end"> 
        {/* Removed ThemeSwitcher component */}
        <button
          onClick={resetToDefaults}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm transition-colors"
          title="Reset text content (About, Contact, Services, General Info) to defaults. Does not affect Projects, Styles, or Social Links."
        >
          Reset Text Defaults
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm transition-colors"
        >
          Logout
        </button>
      </div>
      {logoutError && <p className="text-red-500 text-xs italic w-full text-center sm:text-right mt-2">{logoutError}</p>}
    </div>
  );
};

export default AdminHeader;
