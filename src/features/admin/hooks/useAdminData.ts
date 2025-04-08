import { useState, useCallback, useEffect } from 'react';
import { doc, setDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from '../../../config/firebaseConfig'; // Adjust path as needed
import { translations as defaultTranslations } from '../../../config/translations'; // Adjust path as needed
import { useNotifications } from '../../../contexts/NotificationContext'; // Import the hook
// Updated imports for moved types and constants
import { TranslationsType, LanguageKey } from '../../../types/translations'; // Moved global types
import { newProjectTemplate } from '../sections/Projects/constants'; // Moved project constant
import { ServiceItem } from '../sections/Services/types'; // Moved service type
import { updateNestedState } from '../utils/helpers'; // Moved helper function

// Define Firestore document path
const TRANSLATIONS_DOC_PATH = 'translations/en';

// Define a template for new service items if not imported from types.ts
const newServiceTemplate: ServiceItem = {
  title: 'New Service Title',
  description: 'New service description.',
  // icon: 'default-icon.png' // Add default icon if applicable
};

export const useAdminData = () => {
  // Initialize with default translations, will be overwritten by Firebase data
  const [translations, setTranslations] = useState<TranslationsType>(defaultTranslations);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [saveStatus, setSaveStatus] = useState(''); // Keep for potential non-toast status
  const { showToast } = useNotifications(); // Get the toast function

  // Effect to fetch data from Firestore on mount and listen for changes
  useEffect(() => {
    if (!db) { // db is Firestore instance here
      console.error("Firestore instance is not available.");
      setSaveStatus("Error: Firestore connection failed.");
      setIsLoading(false);
      return;
    }
    // Get a reference to the Firestore document
    const translationsDocRef = doc(db, TRANSLATIONS_DOC_PATH);
    setIsLoading(true);

    // Use onSnapshot for real-time updates
    const unsubscribe = onSnapshot(translationsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Directly set the 'en' state from Firestore data, assuming it's the complete source of truth
        setTranslations(prev => ({
          ...prev, // Keep other potential language keys if structure allows
          en: data as TranslationsType['en'] // Trust Firestore data for 'en'
        }));
      } else {
        // Document doesn't exist, use defaults (including default 'en')
        setTranslations(defaultTranslations);
        console.log("No translations document found in Firestore, using defaults.");
        // Optionally create the document with defaults here
        // setDoc(translationsDocRef, defaultTranslations.en);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore snapshot error:", error);
      setSaveStatus("Error fetching data from Firestore.");
      setIsLoading(false);
      // Keep existing state or fallback to defaults? For now, keep state.
    });

    // Cleanup listener on unmount
    return () => unsubscribe(); // onSnapshot returns the unsubscribe function directly
  }, []); // Empty dependency array ensures this runs only on mount and unmount

  // Note: updateNestedState uses 'any', so type safety relies on correct path construction
  const handleInputChange = useCallback((fullPath: (string | number)[], value: string | string[]) => { // Allow string[] for tags
    setTranslations((prev: TranslationsType) => {
      const langToUpdate: LanguageKey = 'en';
      // Basic validation before calling the 'any' based utility
      if (!fullPath || fullPath.length === 0) return prev;
      const updatedLangData = updateNestedState(prev[langToUpdate], fullPath, value);
      return {
        ...prev,
        [langToUpdate]: updatedLangData
      };
    });
    setSaveStatus(''); // Clear status on input change
  }, []); // Removed setSaveStatus from dependencies as it's stable

  const handleAddNewProject = useCallback(() => {
    setTranslations((prev: TranslationsType) => {
      const newProjectKey = `project_${Date.now()}`; // Use a more descriptive prefix
      const langData = { ...prev.en }; // Shallow copy
      // Ensure projects section exists and is an object with at least a title
      if (typeof langData.projects !== 'object' || langData.projects === null) {
        // Initialize with the default title
        langData.projects = { title: defaultTranslations.en.projects.title };
      }
      // Add the new project using type assertion to allow dynamic key
      (langData.projects as any)[newProjectKey] = { ...newProjectTemplate };

      return {
        ...prev,
        en: langData
      };
    });
    setSaveStatus('New project added. Edit details and save.');
    // Note: Switching activeTab is handled in the component
  }, []); // Removed dependencies like activeTab, setActiveTab

  const handleAddNewService = useCallback(() => {
    setTranslations((prev: TranslationsType) => {
      // Ensure prev.en and prev.en.services exist and are objects
      const currentServices = prev.en?.services;
      // Default to an empty array if list doesn't exist or isn't an array
      const currentList = Array.isArray(currentServices?.list) ? currentServices.list : [];

      // Create a new list with the new item added immutably
      const newList = [...currentList, { ...newServiceTemplate }];

      // Construct the new 'en' state immutably
      const newEnState = {
        ...prev.en, // Copy existing 'en' data
        services: { // Overwrite 'services' section
          // Copy existing service properties (like title) or use defaults if services didn't exist
          ...(currentServices || { title: defaultTranslations.en.services.title || 'Services', list: [] }),
          list: newList, // Use the new list
        },
      };

      return {
        ...prev, // Copy other languages if any
        en: newEnState, // Set the updated 'en' state
      };
    });
    setSaveStatus('New service added. Edit details and save.');
    // Note: Switching activeTab is handled in the component
  }, []); // Removed dependencies like activeTab, setActiveTab

  // Modified saveChanges to accept data payload
  const saveChanges = async (dataToSave?: TranslationsType['en']) => {
    const data = dataToSave || translations.en; // Use provided data or current state
    if (!db) { // db is Firestore instance
      setSaveStatus("Error: Firestore connection failed.");
      return;
    }
    setSaveStatus('Saving...');
    try {
      // Get a reference to the Firestore document and save the 'en' data
      const translationsDocRef = doc(db, TRANSLATIONS_DOC_PATH);
      // Revert to using merge: true for general saves
      await setDoc(translationsDocRef, data, { merge: true });
      // setSaveStatus('Content changes saved successfully!'); // Replaced by toast
      showToast('Content changes saved successfully!', 'success');
      setSaveStatus(''); // Clear any previous status
    } catch (error) {
      console.error("Failed to save translations to Firestore:", error);
      // setSaveStatus('Error saving content changes.'); // Replaced by toast
      showToast('Error saving content changes.', 'error');
      setSaveStatus(''); // Clear any previous status
    } finally {
      // Clear loading status if needed, though setSaveStatus might be enough
      // setIsLoading(false); // Example if loading state was tied to save
    }
  };

  // New function to handle specific field deletion using updateDoc and FieldValue.delete()

  // Updated handleDeleteItem to handle array deletions (services) and field deletions (projects)
  const handleDeleteItem = useCallback(async (pathToDelete: (string | number)[]) => {
    if (!pathToDelete || pathToDelete.length < 1) {
      console.error("Invalid path for deletion:", pathToDelete);
      showToast('Error: Invalid deletion path.', 'error');
      return;
    }

    // --- Service Item Deletion (Array Element) ---
    if (pathToDelete[0] === 'services' && pathToDelete[1] === 'list' && typeof pathToDelete[2] === 'number') {
      const serviceIndexToDelete = pathToDelete[2];
      const currentServicesList = translations.en.services?.list;

      if (!Array.isArray(currentServicesList)) {
        console.error("Cannot delete service item: services.list is not an array or is missing.", currentServicesList);
        showToast('Error: Services data structure issue.', 'error');
        return;
      }

      // 1. Optimistic UI Update (Local State)
      const updatedServicesList = currentServicesList.filter((_, index) => index !== serviceIndexToDelete);
      setTranslations(prev => ({
        ...prev,
        en: {
          ...prev.en,
          services: {
            ...(prev.en.services || { title: '', list: [] }), // Ensure services object exists
            list: updatedServicesList,
          },
        },
      }));

      // 2. Firestore Update
      if (!db) {
        showToast("Error: Firestore connection failed.", 'error');
        // Optionally revert state change here if needed
        return;
      }
      const translationsDocRef = doc(db, TRANSLATIONS_DOC_PATH);
      try {
        setSaveStatus('Deleting service item...'); // Indicate activity
        await updateDoc(translationsDocRef, {
          'services.list': updatedServicesList // Update the whole array
        });
        showToast('Service item deleted.', 'success');
      } catch (error) {
        console.error("Failed to update services list in Firestore:", error);
        showToast('Error deleting service item.', 'error');
        // Optionally revert state change here by refetching or using the previous state
      } finally {
        setSaveStatus(''); // Clear activity indicator
      }

    // --- Project Item Deletion (Object Property) ---
    } else if (pathToDelete[0] === 'projects' && pathToDelete.length === 2) {
        const projectKeyToDelete = pathToDelete[1];
        const fieldPathString = pathToDelete.join('.'); // e.g., "projects.project_123"

        if (typeof projectKeyToDelete !== 'string' || !fieldPathString) {
           console.error("Invalid project path for deletion:", pathToDelete);
           showToast('Error: Could not determine project to delete.', 'error');
           return;
        }

        // 1. Optimistic UI Update (Local State)
        setTranslations(prev => {
            const updatedProjects = { ...prev.en.projects };
            delete updatedProjects[projectKeyToDelete]; // Remove the property
            return {
                ...prev,
                en: {
                    ...prev.en,
                    projects: updatedProjects,
                },
            };
        });

        // 2. Firestore Update (Revised - Avoid deleteField, update whole object)
        if (!db) {
            showToast("Error: Firestore connection failed.", 'error');
            // Attempt to revert optimistic update might be complex, rely on error message for now
            return;
        }
        const translationsDocRef = doc(db, TRANSLATIONS_DOC_PATH);
        try {
            setSaveStatus('Deleting project item...'); // Indicate activity

            // Get the projects object from the *current* state (before optimistic update)
            // Note: This relies on `translations` being available in the useCallback's closure
            const projectsBeforeDelete = translations.en.projects;
            const updatedProjectsForFirestore = { ...projectsBeforeDelete };
            // Ensure the key exists before deleting (optional safety check)
            if (updatedProjectsForFirestore.hasOwnProperty(projectKeyToDelete)) {
                delete updatedProjectsForFirestore[projectKeyToDelete]; // Remove the key
            } else {
                 console.warn(`Attempted to delete non-existent project key: ${projectKeyToDelete}`);
                 // Proceeding anyway, Firestore update might resolve inconsistency if key was already gone
            }


            // Update the entire 'projects' field in Firestore
            await updateDoc(translationsDocRef, {
                'projects': updatedProjectsForFirestore
            });
            // The onSnapshot listener should now receive the correct state.
            showToast('Project item deleted.', 'success');
        } catch (error) {
            console.error("Failed to delete project item from Firestore:", error);
            showToast('Error deleting project item.', 'error');
            // If Firestore fails, the optimistic update is still in the local state.
            // The next snapshot *might* correct it, or a page refresh would.
            // A full revert here is complex and might fight with the snapshot listener.
            console.error("Firestore delete failed, local state might be inconsistent until next snapshot/refresh.");
        } finally {
            setSaveStatus(''); // Clear activity indicator
        }
    } else {
        // Handle other potential deletion paths or show error
        console.error("Unhandled deletion path:", pathToDelete);
        showToast('Error: Deletion logic not implemented for this path.', 'error');
    }

  // Add translations to dependency array for optimistic updates
  }, [translations, showToast]); // Include showToast from useNotifications context


  const resetToDefaults = async () => {
     if (!db) { // db is Firestore instance
      setSaveStatus("Error: Firestore connection failed.");
      return;
    }
    if (window.confirm('Are you sure you want to reset the English text content (About, Contact, Services, General Info) to the default values? This cannot be undone and does not affect Projects, Styles, or Social Links.')) {
      setSaveStatus('Resetting...');
      // Prepare the data to be saved: defaults for most, but keep existing projects
      const dataToSave = {
        ...defaultTranslations.en, // Start with all defaults
        projects: translations.en.projects // Overwrite with current projects
      };

      try {
        // Get a reference to the Firestore document and overwrite with the reset data
        const translationsDocRef = doc(db, TRANSLATIONS_DOC_PATH);
        await setDoc(translationsDocRef, dataToSave); // Overwrite the document
        // The onSnapshot listener should automatically update the local state
        // setSaveStatus('Text content sections reset to defaults.'); // Replaced by toast
        showToast('Text content sections reset to defaults.', 'success');
        setSaveStatus(''); // Clear status
      } catch (error) {
        console.error("Failed to reset translations in Firestore:", error);
        // setSaveStatus('Error resetting content.'); // Replaced by toast
        showToast('Error resetting content.', 'error');
        setSaveStatus(''); // Clear status
      }
    }
  };

  return {
    translations,
    isLoading,
    saveStatus,
    setSaveStatus, // Expose setter if needed by component
    setTranslations, // Expose setter if needed by component
    handleInputChange,
    handleAddNewProject,
    handleAddNewService,
    saveChanges,
    handleDeleteItem,
    resetToDefaults,
  };
};
