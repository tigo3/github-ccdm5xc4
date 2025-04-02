import React, { useState, useEffect } from 'react'; // Removed useCallback
import { useNavigate } from 'react-router-dom';
import { signOut } from "firebase/auth";
import { 
  LayoutDashboard, 
  FileEdit, 
  Palette, 
  Link2, 
  Settings, 
  LogOut,
  Image,
  ChevronDown,
  User,
  Menu, // Added Menu icon
  Eye,
  MessageSquare,
  FileText,
  Star
} from 'lucide-react';
import { auth } from '../../config/firebaseConfig';

// Import Hooks and Components
import { useAdminData } from './hooks/useAdminData';
// import AdminTabs from './components/AdminTabs'; // Removed unused component

// Import Tab Components
import ProjectsTab from './tabs/ProjectsTab';
import ServicesTab from './tabs/ServicesTab';
import StyleEditorTab from './tabs/StyleEditorTab';
import SocialLinksTab from './tabs/SocialLinksTab';
import GeneralInfoTab from './tabs/GeneralInfoTab';
import PagesTab from './tabs/PagesTab';

// Import Utilities and Types
import { renderFields, getStaticSectionName, isValidTranslationKey } from './utils';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Controls mobile overlay

  // Initialize desktop sidebar state from localStorage, default to false (expanded)
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem('desktopSidebarCollapsed');
    return savedState ? JSON.parse(savedState) : false;
  });

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // md breakpoint

  // Effect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(false); // Close mobile overlay if resizing to desktop
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effect to save desktop sidebar state to localStorage
  useEffect(() => {
    // Only run this effect if not on mobile, as localStorage is for desktop state
    if (!isMobile) {
      localStorage.setItem('desktopSidebarCollapsed', JSON.stringify(isDesktopSidebarCollapsed));
    }
    // If switching to mobile, ensure the desktop state doesn't affect mobile overlay
    // (localStorage state is ignored when isMobile is true)
  }, [isDesktopSidebarCollapsed, isMobile]);

  // Use the custom hook for data management
  const {
    translations,
    isLoading,
    saveStatus,
    handleInputChange,
    handleAddNewProject,
    handleAddNewService,
    saveChanges,
    handleDeleteItem,
    // resetToDefaults, // Removed unused variable
  } = useAdminData();

  // Local UI state
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [editingPath, setEditingPath] = useState<string | null>(null);
  // const [logoutError, setLogoutError] = useState(''); // Removed unused state

  // Mock data for dashboard widgets
  const stats = {
    pageViews: '1,234',
    totalPages: '12',
    comments: '45',
    averageRating: '4.8'
  };

  // Logout handler
  const handleLogout = async () => {
    // setLogoutError(''); // Removed unused state setter
    if (!auth) {
      console.error("Firebase auth instance is not available.");
      // setLogoutError('Logout service unavailable. Please try again later.'); // Removed unused state setter
      // Optionally, display an alert or console log here if needed
      alert('Logout service unavailable. Please try again later.');
      return;
    }
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      console.error("Logout failed:", error);
      // setLogoutError('Failed to log out. Please try again.'); // Removed unused state setter
      // Optionally, display an alert or console log here if needed
      alert('Failed to log out. Please try again.');
    }
  };

  // Navigation items
  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', tab: 'dashboard' },
    { icon: <FileText size={20} />, label: 'Pages', tab: 'pages' },
    { icon: <FileEdit size={20} />, label: 'Projects', tab: 'projects' },
    { icon: <Image size={20} />, label: 'Media', tab: 'media' },
    { icon: <Palette size={20} />, label: 'Appearance', tab: 'styleEditor' },
    { icon: <Link2 size={20} />, label: 'Social Links', tab: 'socialLinks' },
    { icon: <Settings size={20} />, label: 'Settings', tab: 'generalInfo' },
  ];

  const renderDashboardContent = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-700 font-semibold">Page Views</h3>
            <Eye className="text-blue-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pageViews}</p>
          <p className="text-sm text-gray-500 mt-2">Last 30 days</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-700 font-semibold">Total Pages</h3>
            <FileText className="text-green-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalPages}</p>
          <p className="text-sm text-gray-500 mt-2">Published content</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-700 font-semibold">Comments</h3>
            <MessageSquare className="text-purple-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.comments}</p>
          <p className="text-sm text-gray-500 mt-2">Awaiting response</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-700 font-semibold">Average Rating</h3>
            <Star className="text-yellow-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
          <p className="text-sm text-gray-500 mt-2">Based on feedback</p>
        </div>
      </div>
    );
  };

  const renderActiveTabContent = () => {
    if (isLoading) {
      return <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>;
    }

    if (!activeTab || activeTab === 'dashboard') {
      return renderDashboardContent();
    }

    if (activeTab === 'styleEditor') {
      return <StyleEditorTab />;
    }
    if (activeTab === 'socialLinks') {
      return <SocialLinksTab />;
    }
    if (activeTab === 'pages') {
      return <PagesTab />;
    }

    if (isValidTranslationKey(activeTab)) {
      const staticTabTitle = getStaticSectionName(activeTab);

      return (
        <>
          <h3 className="text-xl font-semibold mb-4 text-gray-700 capitalize">
            {staticTabTitle}
          </h3>
          {activeTab === 'projects' ? (
            <ProjectsTab
              data={translations.en.projects}
              path={[activeTab]}
              handleChange={handleInputChange}
              editingPath={editingPath}
              setEditingPath={setEditingPath}
              handleAddProject={handleAddNewProject}
              handleDelete={handleDeleteItem}
              renderFields={renderFields}
            />
          ) : activeTab === 'services' ? (
            <ServicesTab
              data={translations.en.services}
              path={[activeTab]}
              handleChange={handleInputChange}
              editingPath={editingPath}
              setEditingPath={setEditingPath}
              handleAddService={handleAddNewService}
              handleDelete={handleDeleteItem}
              renderFields={renderFields}
            />
          ) : activeTab === 'generalInfo' ? (
            <GeneralInfoTab
              translations={translations}
              handleInputChange={handleInputChange}
              editingPath={editingPath}
              setEditingPath={setEditingPath}
              getStaticSectionName={getStaticSectionName}
            />
          ) : (
            renderFields(
              translations.en[activeTab],
              [activeTab],
              handleInputChange,
              editingPath,
              setEditingPath,
              undefined,
              handleDeleteItem
            )
          )}
        </>
      );
    }

    return <p className="text-red-500">Error: Invalid tab '{activeTab}' selected.</p>;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md fixed w-full z-10">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Sidebar Toggle Button */}
            <button
              onClick={() => {
                if (isMobile) {
                  setIsSidebarOpen(!isSidebarOpen);
                } else {
                  setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed);
                }
              }}
              className="text-gray-500 hover:text-gray-700 md:hidden" // Hide on desktop initially
            >
              <Menu size={24} />
            </button>
            {/* Desktop Sidebar Toggle */}
            <button
              onClick={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
              className="text-gray-500 hover:text-gray-700 hidden md:block" // Show only on desktop
            >
              <Menu size={24} />
            </button>
            {/* Search Input Removed */}
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications Removed */}

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
              >
                <User size={20} />
                <span>Admin</span>
                <ChevronDown size={16} />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200">
                  <button
                    onClick={handleLogout}
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

      {/* Sidebar and Main Content */}
      <div className="flex pt-16">
        {/* Overlay for Mobile Sidebar */}
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-16 h-[calc(100vh-4rem)] bg-gray-800 text-white transition-transform duration-300 ease-in-out z-30 md:translate-x-0 md:transition-all md:duration-300
            ${isMobile ? (isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64') : (isDesktopSidebarCollapsed ? 'w-20' : 'w-64')}
          `}
        >
          <nav className="p-4 overflow-y-auto h-full">
            {navItems.map((item) => (
              <button
                key={item.tab}
                onClick={() => {
                  setActiveTab(item.tab);
                  // Close mobile sidebar on tab selection
                  if (isMobile) {
                    setIsSidebarOpen(false);
                  }
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {item.icon}
                {/* Show label only when sidebar is expanded (mobile or desktop) */}
                <span className={`${(isMobile && isSidebarOpen) || (!isMobile && !isDesktopSidebarCollapsed) ? 'inline' : 'hidden'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${ // Removed pt-0 md:pt-0
            isMobile ? 'ml-0' : (isDesktopSidebarCollapsed ? 'md:ml-20' : 'md:ml-64')
          }`}
        >
          {/* Padding for content area */}
          <div className="p-4 md:p-8">
            {/* Breadcrumb */}
            <div className="mb-4 md:mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                {activeTab ? getStaticSectionName(activeTab) : 'Dashboard'}
              </h1>
              <p className="text-sm text-gray-500">
                Home / {activeTab ? getStaticSectionName(activeTab) : 'Dashboard'}
              </p>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-md p-6">
              {renderActiveTabContent()}
            </div>

            {/* Save Changes Button */}
            {activeTab && activeTab !== 'styleEditor' && activeTab !== 'socialLinks' && activeTab !== 'pages' && (
              <div className="mt-6 flex justify-end items-center gap-4">
                {saveStatus && (
                  <span className="text-green-600 text-sm">{saveStatus}</span>
                )}
                <button
                  onClick={() => saveChanges()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
