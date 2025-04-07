import React from 'react';

// Define the structure for a navigation item
interface NavItem {
  icon: React.ReactNode;
  label: string;
  tab: string;
}

interface SidebarProps {
  isMobile: boolean;
  isSidebarOpen: boolean;
  isDesktopSidebarCollapsed: boolean;
  activeTab: string | null;
  navItems: NavItem[];
  onTabClick: (tab: string) => void;
  onCloseMobileSidebar: () => void; // For the overlay click
}

const Sidebar: React.FC<SidebarProps> = ({
  isMobile,
  isSidebarOpen,
  isDesktopSidebarCollapsed,
  activeTab,
  navItems,
  onTabClick,
  onCloseMobileSidebar,
}) => {
  return (
    <>
      {/* Overlay for Mobile Sidebar */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" // Ensure overlay is only for mobile
          onClick={onCloseMobileSidebar}
          aria-hidden="true" // Hide from screen readers when not visible
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 h-[calc(100vh-4rem)] bg-gray-800 text-white transition-transform duration-300 ease-in-out z-30 md:translate-x-0 md:transition-all md:duration-300
          ${isMobile ? (isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64') : (isDesktopSidebarCollapsed ? 'w-20' : 'w-64')}
        `}
        aria-label="Main Navigation"
      >
        <nav className="p-4 overflow-y-auto h-full">
          {navItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => onTabClick(item.tab)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.tab
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              aria-current={activeTab === item.tab ? 'page' : undefined} // Indicate active page
            >
              {item.icon}
              {/* Show label only when sidebar is expanded */}
              <span className={`${(isMobile && isSidebarOpen) || (!isMobile && !isDesktopSidebarCollapsed) ? 'inline' : 'hidden'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;