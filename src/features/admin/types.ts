// Define the structure for a single project explicitly
interface Project {
  title: string;
  description: string;
  tags: string[];
  link: string;
}

// Define the structure for the 'projects' section, allowing dynamic keys
interface ProjectsSection {
  title: string;
  // Index signature to allow any string key for project objects
  // It also allows the 'title' property defined above.
  [key: string]: Project | string;
}

// Define the structure for the 'services' list items
export interface ServiceItem { // <-- Added export here
    title: string;
    description: string;
}

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

// Define a template for a new project, matching the Project interface
export const newProjectTemplate: Project = {
  title: "New Project Title",
  description: "New project description.",
  tags: ["Tag1", "Tag2"],
  link: ""
};

// Define the structure for a single Page
export interface Page {
  id?: string; // Optional ID, usually added when fetched or after creation
  title: string;
  slug: string; // URL-friendly identifier
  content: string; // Page content (e.g., Markdown, HTML)
  order: number; // Add order field
}
