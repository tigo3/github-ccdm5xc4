import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from "firebase/auth";
import { auth } from '../../config/firebaseConfig'; // Keep auth import for logout

// Import Hooks and Components
import { useAdminData } from './hooks/useAdminData';
import AdminHeader from './components/AdminHeader';
import AdminTabs from './components/AdminTabs';

// Import Tab Components
import ProjectsTab from './tabs/ProjectsTab';
import ServicesTab from './tabs/ServicesTab';
import StyleEditorTab from './tabs/StyleEditorTab';
import SocialLinksTab from './tabs/SocialLinksTab';
import GeneralInfoTab from './tabs/GeneralInfoTab';
import PagesTab from './tabs/PagesTab'; // Import the new PagesTab

// Import Utilities and Types
import { renderFields, getStaticSectionName, isValidTranslationKey } from './utils'; // Import necessary utils
// Types might be implicitly handled by the hook, remove if not directly needed
// import { TranslationsType } from './types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

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
    resetToDefaults,
  } = useAdminData();

  // Local UI state
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [logoutError, setLogoutError] = useState('');

  // Set initial active tab once data is loaded
  useEffect(() => {
    if (!isLoading && activeTab === null && translations && translations.en) {
      const keys = Object.keys(translations.en);
      if (keys.length > 0) {
        // Default to 'generalInfo' if available, otherwise the first key
        setActiveTab(keys.includes('generalInfo') ? 'generalInfo' : keys[0]);
      }
    }
  }, [isLoading, activeTab, translations]);

  // Logout handler (kept here as it uses navigate)
  const handleLogout = async () => {
    setLogoutError('');
    if (!auth) {
      console.error("Firebase auth instance is not available.");
      setLogoutError('Logout service unavailable. Please try again later.');
      return;
    }
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      console.error("Logout failed:", error);
      setLogoutError('Failed to log out. Please try again.');
    }
  };

  // Simplified handler for adding new project - hook handles logic, component handles UI switch
  const handleAddNewProjectClick = useCallback(() => {
    handleAddNewProject(); // Call hook function
    setActiveTab('projects'); // Switch tab locally
  }, [handleAddNewProject, setActiveTab]);

  // Simplified handler for adding new service - hook handles logic, component handles UI switch
  const handleAddNewServiceClick = useCallback(() => {
    handleAddNewService(); // Call hook function
    setActiveTab('services'); // Switch tab locally
  }, [handleAddNewService, setActiveTab]);


  const renderActiveTabContent = () => {
    // Show loading indicator while fetching initial data
    if (isLoading) {
      return <p className="text-gray-500 text-center py-10">Loading content...</p>;
    }

    if (!activeTab) {
      // If still no active tab after loading, prompt selection
      return <p className="text-gray-500">Select a section above to start editing.</p>;
    }

    // Static Tabs
    if (activeTab === 'styleEditor') {
      return <StyleEditorTab />; // Assumes StyleEditorTab handles its own data/saving
    }
    if (activeTab === 'socialLinks') {
      return <SocialLinksTab />; // Assumes SocialLinksTab handles its own data/saving
    }
    if (activeTab === 'pages') {
      return <PagesTab />; // Render PagesTab when active
    }

    // Dynamic Tabs - Use type guard from utils
    if (isValidTranslationKey(activeTab)) {
      const staticTabTitle = getStaticSectionName(activeTab);

      return (
        <>
          <h3 className="text-xl font-semibold mb-4 text-gray-700 capitalize">
            Editing: {staticTabTitle} Content
          </h3>
          {/* Render specific tabs using data/handlers from the hook */}
          {activeTab === 'projects' ? (() => {
            const projectsData = translations.en.projects;
            return <ProjectsTab
              data={projectsData}
              path={[activeTab]}
              handleChange={handleInputChange}
              editingPath={editingPath}
              setEditingPath={setEditingPath}
              handleAddProject={handleAddNewProjectClick} // Use the wrapper
              handleDelete={handleDeleteItem}
              renderFields={renderFields}
            />;
          })() : activeTab === 'services' ? (() => {
             const servicesData = translations.en.services;
             // Basic validation for services structure
             const validServicesData = (servicesData && typeof servicesData === 'object' && Array.isArray(servicesData.list))
               ? servicesData
               : { title: 'Services', list: [] }; // Provide default structure if invalid/missing

             return <ServicesTab
              data={validServicesData}
              path={[activeTab]}
              handleChange={handleInputChange}
              editingPath={editingPath}
              setEditingPath={setEditingPath}
              handleAddService={handleAddNewServiceClick} // Use the wrapper
              handleDelete={handleDeleteItem}
              renderFields={renderFields}
            />;
          })() : activeTab === 'generalInfo' ? (
            <GeneralInfoTab
              translations={translations} // Pass full translations
              handleInputChange={handleInputChange}
              editingPath={editingPath}
              setEditingPath={setEditingPath}
              handleDeleteItem={handleDeleteItem}
              renderFields={renderFields}
              getStaticSectionName={getStaticSectionName} // Pass util
            />
          ) : ( // Generic rendering for remaining dynamic tabs (e.g., contact)
            renderFields(
              translations.en[activeTab], // Pass the specific section data
              [activeTab],
              handleInputChange,
              editingPath,
              setEditingPath,
              undefined, // No add handler for generic fields
              handleDeleteItem
            )
          )}
        </>
      );
    }

    // Fallback if activeTab is somehow invalid
    return <p className="text-red-500">Error: Invalid tab '{activeTab}' selected.</p>;
  };

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      {/* Use AdminHeader Component */}
      <AdminHeader
        resetToDefaults={resetToDefaults}
        handleLogout={handleLogout}
        logoutError={logoutError}
      />

      {/* Use AdminTabs Component */}
      <AdminTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isValidTranslationKey={isValidTranslationKey}
        getStaticSectionName={getStaticSectionName}
      />

      {/* Tab Content Area */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
        {renderActiveTabContent()}
      </div>

      {/* Save Button Area */}
      <div className="mt-6 text-right flex justify-end items-center gap-4">
        {saveStatus && <span className="text-green-600 text-sm transition-opacity duration-300">{saveStatus}</span>}
        <button
          onClick={() => saveChanges()} // Call saveChanges from the hook
          className={`bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-5 rounded focus:outline-none focus:shadow-outline transition-all duration-150 text-sm ${
            // Disable save button for tabs that save internally
            activeTab === 'styleEditor' || activeTab === 'socialLinks' || activeTab === 'pages' ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
          }`}
          disabled={activeTab === 'styleEditor' || activeTab === 'socialLinks' || activeTab === 'pages'}
          title={activeTab === 'styleEditor' || activeTab === 'socialLinks' || activeTab === 'pages' ? "Changes are saved directly within this tab" : "Save text content changes"}
        >
          Save Content Changes
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
