import React, { useState, useMemo, useCallback, lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Github, Facebook, Mail, Instagram, Linkedin, Twitter, Icon as LucideIcon } from 'lucide-react';
import emailjs from 'emailjs-com';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { auth, db } from './config/firebaseConfig';
import { translations as defaultTranslations } from './config/translations';
import { Page } from './features/admin/types'; // Import the Page type
import LoginPage from './features/admin/LoginPage';
import AdminDashboard from './features/admin/AdminDashboard';
import { getProjectsData as defaultGetProjectsData } from './data/ProjectsSectionData';
import Logo from './components/Logo';
import DynamicPage from './pages/DynamicPage'; // Import from new location
import ScrollToTopButton from './components/ScrollToTopButton'; // Import the new component

const ServicesSection = lazy(() => import('./components/ServicesSection'));
const ProjectsSection = lazy(() => import('./components/ProjectsSection'));
const ContactSection = lazy(() => import('./components/ContactSection'));

const RATE_LIMIT_DURATION = 60000;
let lastSubmissionTime = 0;

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateMessage = (message: string): boolean => {
  return message.length >= 10 && message.length <= 1000;
};

interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: string;
  order: number;
}

const iconComponents: { [key: string]: React.ComponentType<{ size?: number | string }> } = {
  Github,
  Facebook,
  Mail,
  Instagram,
  Linkedin,
  Twitter,
};

type TranslationsType = typeof defaultTranslations;

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div></div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

// Define props for MainSite
interface MainSiteProps {
  dynamicPages: Page[];
}

const MainSite: React.FC<MainSiteProps> = ({ dynamicPages }) => {
  const [siteTranslations, setSiteTranslations] = useState<TranslationsType>(defaultTranslations);
  const [isLoadingTranslations, setIsLoadingTranslations] = useState(true);
  const [isAdminLinkVisible, setIsAdminLinkVisible] = useState(false);

  useEffect(() => {
    if (!db) {
      console.error("MainSite: Firestore instance is not available.");
      setIsLoadingTranslations(false);
      return;
    }
    const translationsDocRef = doc(db, 'translations/en');
    setIsLoadingTranslations(true);

    const unsubscribe = onSnapshot(translationsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSiteTranslations(prev => ({
          ...prev,
          en: { ...defaultTranslations.en, ...data }
        }));
      } else {
        setSiteTranslations(defaultTranslations);
        console.log("MainSite: No translations document found in Firestore, using defaults.");
      }
      setIsLoadingTranslations(false);
    }, (error) => {
      console.error("MainSite: Firestore snapshot error:", error);
      setSiteTranslations(defaultTranslations);
      setIsLoadingTranslations(false);
    });

    return () => unsubscribe();
  }, []);

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

  const t = useMemo(() => siteTranslations.en, [siteTranslations]);

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const now = Date.now();
    if (now - lastSubmissionTime < RATE_LIMIT_DURATION) {
      alert('Please wait a minute before sending another message.');
      return;
    }

    if (!validateEmail(formData.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (!validateMessage(formData.message)) {
      alert('Message must be between 10 and 1000 characters.');
      return;
    }

    lastSubmissionTime = now;

    try {
      emailjs.init("skwn_-DYfDakGK644");

      await emailjs.send(
        "service_bdj14o3",
        "template_2e2nikq",
        {
          name: formData.name,
          email: formData.email,
          message: formData.message,
          to_email: 'tiger3homs@gmail.com',
        }
      );

      alert('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    }
  }, [formData]);

  useEffect(() => {
    const fetchSocialLinks = async () => {
      if (!db) return;
      try {
        const linksCollection = collection(db, 'socialLinks');
        const q = query(linksCollection, orderBy('order', 'asc'));
        const querySnapshot = await getDocs(q);
        const links = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SocialLink));
        setSocialLinks(links);
      } catch (error) {
        console.error("Error fetching social links:", error);
      }
    };

    fetchSocialLinks();
  }, []);

  const projectsData = useMemo(() => defaultGetProjectsData(siteTranslations), [siteTranslations]);

  const LoadingFallback = <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>;

  if (isLoadingTranslations) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div></div>;
  }

  const defaultBgFrom = '#111827';
  const defaultBgTo = '#1F2937';

  return (
    <div
      className={`min-h-screen text-white ltr`}
      style={{
        background: `linear-gradient(to bottom right, var(--background-from-color, ${defaultBgFrom}), var(--background-to-color, ${defaultBgTo}))`
      }}
    >
      <header className="container mx-auto px-4 py-16 md:py-32">
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
            {socialLinks.map((link) => {
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
            })}
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
        <ContactSection
          t={t.contact}
          handleSubmit={handleSubmit}
          formData={formData}
          handleInputChange={handleInputChange}
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

interface StyleData {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  titleColor?: string;
  h3TitleColor?: string;
  textColor?: string;
  backgroundFromColor?: string;
  backgroundToColor?: string;
  sectionBgColor?: string;
}

// Removed DynamicPage component definition from here

function App() {
  const [dynamicPages, setDynamicPages] = useState<Page[]>([]);
  const [loadingPages, setLoadingPages] = useState(true);

  // Effect for loading styles
  useEffect(() => {
    if (!db) {
      console.error("App.tsx: Firestore not initialized correctly for loading styles.");
      return;
    }
    const stylesDocRef = doc(db, 'settings', 'styles');
    console.log("App.tsx: Setting up real-time listener for global styles...");

    const unsubscribe = onSnapshot(stylesDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as StyleData;
        console.log('App.tsx: Received style update from Firestore:', data);
        document.documentElement.style.setProperty('--primary-color', data.primaryColor);
        document.documentElement.style.setProperty('--secondary-color', data.secondaryColor);
        document.documentElement.style.setProperty('--font-family', data.fontFamily);
        document.documentElement.style.setProperty('--title-color', data.titleColor || '#d7e3ee');
        document.documentElement.style.setProperty('--h3title-color', data.h3TitleColor || '#d7e3ee');
        document.documentElement.style.setProperty('--text-color', data.textColor || '#c6d3e2');
        document.documentElement.style.setProperty('--background-from-color', data.backgroundFromColor || '#111827');
        document.documentElement.style.setProperty('--background-to-color', data.backgroundToColor || '#1F2937');
        document.documentElement.style.setProperty('--section-bg-color', data.sectionBgColor || '#374151');
      } else {
        console.log("App.tsx: No global styles document found in Firestore, applying CSS defaults.");
      }
    }, (error) => {
      console.error("App.tsx: Error listening to global styles:", error);
    });

    return () => {
      console.log("App.tsx: Unsubscribing from global styles listener.");
      unsubscribe();
    };
  }, []);

  // Effect for loading dynamic pages
  useEffect(() => {
    setLoadingPages(true);
    if (!db) {
      console.error("App.tsx: Firestore not initialized correctly for loading pages.");
      setLoadingPages(false);
      return;
    }
    const fetchPages = async () => {
      // Add check for db before using it
      if (!db) {
        console.error("App.tsx: Firestore not initialized correctly for loading pages.");
        setLoadingPages(false);
        return;
      }
      try {
        const pagesCollection = collection(db, 'pages');
        // Fetch pages ordered by the 'order' field
        const pagesQuery = query(pagesCollection, orderBy('order', 'asc'));
        const pagesSnapshot = await getDocs(pagesQuery);
        const pagesList = pagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Page));
        setDynamicPages(pagesList);
        console.log("App.tsx: Fetched dynamic pages:", pagesList);
      } catch (error) {
        console.error("App.tsx: Error fetching dynamic pages:", error);
      } finally {
        setLoadingPages(false);
      }
    };

    fetchPages();
  }, []);


  // Show loading indicator while pages are loading
  if (loadingPages) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Pass dynamicPages to MainSite */}
        <Route path="/" element={<MainSite dynamicPages={dynamicPages} />} />
        {/* Dynamically create routes for fetched pages */}
        {dynamicPages.map(page => (
          <Route
            key={page.id}
            path={`/${page.slug}`}
            element={<DynamicPage page={page} />}
          />
        ))}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
      </Routes>
      <ScrollToTopButton /> {/* Add the button here */}
    </BrowserRouter>
  );
}

export default App;
