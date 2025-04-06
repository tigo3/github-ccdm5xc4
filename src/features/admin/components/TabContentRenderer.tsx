import React from 'react';
import { Eye, MessageSquare, FileText, Star } from 'lucide-react';

// Import Tab Components
import ProjectsSection from '../sections/Projects/ProjectsSection';
import ServicesSection from '../sections/Services/ServicesSection';
import StyleEditorSection from '../sections/StyleEditor/StyleEditorSection';
import SocialLinksSection from '../sections/SocialLinks/SocialLinksSection';
import GeneralInfoSection from '../sections/GeneralInfo/GeneralInfoSection';
import PagesSection from '../sections/Pages/PagesSection';
import ImageUploader from '../sections/ImageManagement/components/ImageUploader'; // Corrected path

// Import Utilities and Types (Adjust path as necessary)
// Corrected utility and type imports
import { renderFields, isValidTranslationKey } from '../sections/GeneralInfo/utils';
import { getStaticSectionName } from '../utils/helpers';
import { TranslationsType } from '../../../types/translations'; // Corrected path

// Mock data for dashboard widgets (Should ideally come from props or context)
const stats = {
  pageViews: '1,234',
  totalPages: '12',
  comments: '45',
  averageRating: '4.8'
};

interface TabContentRendererProps {
  activeTab: string | null;
  isLoading: boolean;
  translations: TranslationsType; // Use the correct imported type
  editingPath: string | null;
  setEditingPath: (path: string | null) => void;
  handleInputChange: (path: (string | number)[], value: string | string[]) => void; // Allow string[] for tags
  handleAddNewProject: () => void;
  handleAddNewService: () => void;
  handleDeleteItem: (path: (string | number)[], index?: number) => void; // Match expected path signature
}

const renderDashboardContent = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Page Views */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-700 font-semibold">Page Views</h3>
          <Eye className="text-blue-500" size={20} />
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.pageViews}</p>
        <p className="text-sm text-gray-500 mt-2">Last 30 days</p>
      </div>
      {/* Total Pages */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-700 font-semibold">Total Pages</h3>
          <FileText className="text-green-500" size={20} />
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.totalPages}</p>
        <p className="text-sm text-gray-500 mt-2">Published content</p>
      </div>
      {/* Comments */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-700 font-semibold">Comments</h3>
          <MessageSquare className="text-purple-500" size={20} />
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.comments}</p>
        <p className="text-sm text-gray-500 mt-2">Awaiting response</p>
      </div>
      {/* Average Rating */}
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


const TabContentRenderer: React.FC<TabContentRendererProps> = ({
  activeTab,
  isLoading,
  translations,
  editingPath,
  setEditingPath,
  handleInputChange,
  handleAddNewProject,
  handleAddNewService,
  handleDeleteItem,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!activeTab || activeTab === 'dashboard') {
    return renderDashboardContent();
  }

  // Corrected conditional rendering structure
  if (activeTab === 'styleEditor') {
    return <StyleEditorSection />;
  }
  if (activeTab === 'socialLinks') {
    return <SocialLinksSection />;
  }
  if (activeTab === 'pages') {
    return <PagesSection />;
  }
  if (activeTab === 'media') {
    return <ImageUploader />;
  }

  // Check if the activeTab corresponds to a section in translations
  if (isValidTranslationKey(activeTab)) {
    const staticTabTitle = getStaticSectionName(activeTab);

    return (
      <>
        <h3 className="text-xl font-semibold mb-4 text-gray-700 capitalize">
          {staticTabTitle}
        </h3>
        {activeTab === 'projects' ? (
          <ProjectsSection
          data={translations.en.projects} // Assuming 'en' locale for now
          path={activeTab ? [activeTab as string] : []}
          handleChange={handleInputChange} // Type updated to allow string[]
          // editingPath, setEditingPath, renderFields removed
          handleAddProject={handleAddNewProject}
          handleDelete={handleDeleteItem}
          />
          ) : activeTab === 'services' ? (
          <ServicesSection
          data={translations.en.services} // Assuming 'en' locale
          path={activeTab ? [activeTab as string] : []}
          handleChange={handleInputChange}
          // editingPath and setEditingPath removed as they are no longer props of ServicesSection
          handleAddService={handleAddNewService}
          handleDelete={handleDeleteItem}
          // renderFields prop removed as ServicesSection now handles its own rendering
          />
          ) : activeTab === 'generalInfo' ? (
          <GeneralInfoSection
          translations={translations} // Pass the whole translations object
          handleInputChange={handleInputChange}
          editingPath={editingPath}
          setEditingPath={setEditingPath}
          getStaticSectionName={getStaticSectionName}
          />
          ) : (
          // Fallback for other potential translation keys if needed
          // This part might need adjustment based on how other sections are handled
          renderFields(
            translations.en[activeTab], // Assuming 'en' locale
            [activeTab],
            handleInputChange,
            editingPath,
            setEditingPath,
            undefined, // handleAdd - might need specific handlers
            handleDeleteItem
          )
        )}
      </>
    );
  }

  // Fallback for invalid tabs
  return <p className="text-red-500">Error: Invalid tab '{activeTab}' selected.</p>;
};

export default TabContentRenderer;