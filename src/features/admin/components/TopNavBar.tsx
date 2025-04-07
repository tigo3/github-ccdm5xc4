import React, { useState } from 'react';
import { Menu, User, ChevronDown, LogOut } from 'lucide-react';

interface TopNavBarProps {
  isMobile: boolean;
  isSidebarOpen: boolean;
  isDesktopSidebarCollapsed: boolean;
  onToggleMobileSidebar: () => void;
  onToggleDesktopSidebar: () => void;
  onLogout: () => void;
}

const TopNavBar: React.FC<TopNavBarProps> = ({
  onToggleMobileSidebar,
  onToggleDesktopSidebar,
  onLogout,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav className="bg-white shadow-md fixed w-full z-10">
      <div className="px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile Sidebar Toggle Button */}
          <button
            onClick={onToggleMobileSidebar}
            className="text-gray-500 hover:text-gray-700 md:hidden" // Show only on mobile
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>
          {/* Desktop Sidebar Toggle */}
          <button
            onClick={onToggleDesktopSidebar}
            className="text-gray-500 hover:text-gray-700 hidden md:block" // Show only on desktop
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              <User size={20} />
              <span>Admin</span>
              <ChevronDown size={16} />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200">
                <button
                  onClick={() => {
                    onLogout();
                    setShowUserMenu(false); // Close menu after click
                  }}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar;