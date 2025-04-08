import { translations as defaultTranslations } from '../../../config/translations'; // Corrected path

type TranslationsType = typeof defaultTranslations;
// No longer need LanguageKey as we only use 'en'

// Update function to accept optional translations object, lang parameter removed
export const getProjectsData = (
  translations: TranslationsType = defaultTranslations // Use provided translations or default
) => {
  // Directly access the 'en' translations
  const t = translations.en;
  const projectsData = t?.projects;

  // Dynamically create the projects array from the projectsData object
  const projectsArray = projectsData
    ? Object.entries(projectsData)
        .filter(([key, value]) => key !== 'title' && typeof value === 'object' && value !== null) // Filter out the title and ensure value is an object
        .map(([key, projectDetails]: [string, any]) => ({
          title: projectDetails?.title ?? `Project ${key}`,
          description: projectDetails?.description ?? 'Description missing.',
          tags: projectDetails?.tags ?? [],
          link: projectDetails?.link ?? '', // Read the link from translations, default to empty string
        }))
    : []; // Default to empty array if projectsData is missing

  return {
    title: projectsData?.title ?? 'Featured Projects', // Fallback title
    projects: projectsArray, // Use the dynamically generated array
  };
};
