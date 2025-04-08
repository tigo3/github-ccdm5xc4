// src/pages/MainSite.tsx
import React, { useState, useMemo, useEffect, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import TopNavigation from '../components/layout/TopNavigation'; // Updated path
import { Page } from '../features/admin/sections/Pages/types'; // Adjusted import path
import BlogSection from '../features/blog/components/BlogSection'; // Updated path
import { getProjectsData as defaultGetProjectsData } from '../features/projects/data/ProjectsSectionData'; // Updated path
import Logo from '../components/common/Logo'; // Updated path
import { useTranslations } from '../hooks/useTranslations'; // Adjusted import path
import { useSocialLinks } from '../hooks/useSocialLinks'; // Adjusted import path

// Lazy load sections within MainSite
const ServicesSection = lazy(() => import('../features/services/components/ServicesSection')); // Updated path
const ProjectsSection = lazy(() => import('../features/projects/components/ProjectsSection')); // Updated path
const ContactSection = lazy(() => import('../features/contact/components/ContactSection')); // Updated path

// Define props for MainSite
export interface MainSiteProps { // Export the interface
  dynamicPages: Page[];
}

const MainSite: React.FC<MainSiteProps> = ({ dynamicPages }) => {
  // Use the custom hook to fetch translations
  const { t, isLoading: isLoadingTranslations, error: translationsError } = useTranslations('en');
  const [isAdminLinkVisible, setIsAdminLinkVisible] = useState(false);
  // Use the custom hook to fetch social links
  const { socialLinks, iconComponents, isLoading: isLoadingLinks, error: linksError } = useSocialLinks();

  // Log translation errors if any
  useEffect(() => {
    if (translationsError) {
      console.error("MainSite: Error loading translations:", translationsError);
    }
  }, [translationsError]);

  // Log social link errors if any
  useEffect(() => {
    if (linksError) {
      console.error("MainSite: Error loading social links:", linksError);
    }
  }, [linksError]);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.key === 'a') {
        event.preventDefault();
        setIsAdminLinkVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Pass the 't' object from the hook to getProjectsData, wrapped as expected by the function
  const projectsData = useMemo(() => defaultGetProjectsData({ en: t }), [t]);

  const LoadingFallback = <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>;

  // Use isLoading state from the hook
  if (isLoadingTranslations) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div></div>;
  }
  // Optionally handle translationsError state here, e.g., show an error message

  return (
    <div className={`min-h-screen text-text ltr bg-gradient-to-br from-background to-background-secondary pb-20`}>


<div className=' container sticky top-0 z-10 ' > <TopNavigation /> </div>

      <header id='home' className="container mx-auto">
      
        <div className="max-w-3xl mx-auto text-center">
          <Logo logoUrl={t.generalInfo.logoUrl} />
          <h1
            className="text-4xl md:text-6xl font-bold mb-6 text-primary pointer-events-none select-none"
            // Removed inline style: pointerEvents, userSelect
          >
            {t.generalInfo.siteTitle}
          </h1>
          <p
            className="text-xl md:text-2xl text-secondary mb-8"
            // Removed inline style: pointerEvents, userSelect
            // Added Tailwind classes: pointer-events-none select-none (if needed, often not needed for static text)
            // Let's assume they are not strictly needed here unless there's a specific interaction reason.
          >
            {t.generalInfo.siteRole}
          </p>
          <div className="flex justify-center space-x-6">
            {/* Render social links using data from the hook */}
            {isLoadingLinks ? (
              <div className="text-secondary">Loading links...</div>
            ) : (
              socialLinks.map((link) => {
                const IconComponent = iconComponents[link.icon];
                return IconComponent ? (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.name}
                    className="text-primary hover:text-text transition-colors transform hover:scale-110"
                  >
                    <IconComponent size={24} />
                  </a>
                ) : null;
              })
            )}
          </div>
        </div>
      </header>

      <Suspense fallback={LoadingFallback}>
        <ProjectsSection
          title={projectsData.title}
          projects={projectsData.projects}
        />
      </Suspense>

                  <Suspense fallback={LoadingFallback}>
                    <BlogSection dynamicPages={dynamicPages} />
                  </Suspense>


      <section id='about' className="container mx-auto px-4 py-16 bg-gray-800/50 backdrop-blur-sm" >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-title">
            {/* Removed inline style: color: 'var(--title-color)' */}
            {t.about.title}
          </h2>
          <p className="text-lg leading-relaxed text-text">
            {t.about.description}
          </p>
        </div>
      </section>

      <Suspense fallback={LoadingFallback}>
        <ServicesSection
          title={t.services.title}
          services={t.services.list}
        />
      </Suspense>

      <Suspense fallback={LoadingFallback}>
        {/* Remove props related to form handling */}
        <ContactSection
          t={t.contact}
        />
      </Suspense>

      <footer className="container mx-auto px-4 py-8 text-center relative">
        <p className="text-secondary mb-4">{t.generalInfo.footerText}</p>
        <Link
          to="/admin/dashboard"
          className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-sm text-primary hover:text-text underline transition-opacity duration-300 ${isAdminLinkVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          Admin Dashboard
        </Link>
      </footer>
    </div>
  );
};

export default MainSite; // Export the component
