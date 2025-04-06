// src/pages/MainSite.tsx
import React, { useState, useMemo, useEffect, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { Page } from '../features/admin/types'; // Adjusted import path
import { getProjectsData as defaultGetProjectsData } from '../data/ProjectsSectionData'; // Adjusted import path
import Logo from '../components/Logo'; // Adjusted import path
import { useTranslations } from '../hooks/useTranslations'; // Adjusted import path
import { useSocialLinks } from '../hooks/useSocialLinks'; // Adjusted import path

// Lazy load sections within MainSite
const ServicesSection = lazy(() => import('../components/ServicesSection')); // Adjusted import path
const ProjectsSection = lazy(() => import('../components/ProjectsSection')); // Adjusted import path
const ContactSection = lazy(() => import('../components/ContactSection')); // Adjusted import path

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

  const defaultBgFrom = '#111827';
  const defaultBgTo = '#1F2937';

  return (
    <div
      className={`min-h-screen text-white ltr`}
      style={{
        background: `linear-gradient(to bottom right, var(--background-from-color, ${defaultBgFrom}), var(--background-to-color, ${defaultBgTo}))`
      }}
    >
      <header className="container mx-auto px-4 py-16 md:py-0">
        <div className="max-w-3xl mx-auto text-center">
          <Logo logoUrl={t.generalInfo.logoUrl} />
          <h1
            className="text-4xl md:text-6xl font-bold mb-6 text-primary"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {t.generalInfo.siteTitle}
          </h1>
          <p
            className="text-xl md:text-2xl text-secondary mb-8"
            style={{ pointerEvents: 'none', userSelect: 'none', }}
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
                  {/* Render dynamic page links */}
        {dynamicPages && dynamicPages.length > 0 && (
          <nav className="mb-4 flex justify-center flex-wrap gap-x-4 gap-y-2 mt-8">
            {dynamicPages.map(page => (
              <Link
                key={page.id}
                to={`/${page.slug}`}
                className="text-secondary hover:text-primary transition-colors text-sm"
              >
                {page.title}
              </Link>
            ))}
          </nav>
        )}
        </div>
      </header>

      <Suspense fallback={LoadingFallback}>
        <ProjectsSection
          title={projectsData.title}
          projects={projectsData.projects}
        />
      </Suspense>

      <section className="container mx-auto px-4 py-16 bg-gray-800/50 backdrop-blur-sm" >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: 'var(--title-color)' }}>{t.about.title}</h2>
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