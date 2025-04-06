import { ProjectsSection } from '../features/admin/sections/Projects/types'; // Adjust import path
import { ServiceItem } from '../features/admin/sections/Services/types'; // Adjust import path

// Define the overall structure for the 'en' translations object explicitly
// This provides better type safety than relying solely on 'typeof'
interface EnglishTranslations {
  generalInfo: {
    title: string;
    siteTitle: string;
    siteRole: string;
    logoUrl: string;
    footerText: string;
  };
  about: {
    title: string;
    description: string;
  };
  projects: ProjectsSection; // Use the flexible ProjectsSection type
  contact: {
    title: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    submitButton: string;
  };
  services: {
      title: string;
      list: ServiceItem[];
  };
}

// Define the main TranslationsType using the explicit structure
export interface TranslationsType {
  en: EnglishTranslations;
  // Add other languages here if needed in the future
}

// LanguageKey type - currently only 'en' is used
export type LanguageKey = keyof TranslationsType; // Make it dynamic based on defined languages