import { useState, useCallback, useEffect } from 'react';
import { doc, setDoc, onSnapshot, updateDoc, deleteField } from "firebase/firestore";
import { db } from '../../../config/firebaseConfig'; // Adjust path as needed
import { translations as defaultTranslations } from '../../../config/translations'; // Adjust path as needed
import { TranslationsType, LanguageKey, newProjectTemplate, ServiceItem } from '../types'; // Adjust path as needed
import { updateNestedState } from '../utils'; // Adjust path as needed

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
  const [saveStatus, setSaveStatus] = useState('');

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
  const handleInputChange = useCallback((fullPath: (string | number)[], value: string) => {
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
      setSaveStatus('Content changes saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error("Failed to save translations to Firestore:", error);
      setSaveStatus('Error saving content changes.');
      setTimeout(() => setSaveStatus(''), 5000); // Keep error message longer
    }
  };

  // New function to handle specific field deletion using updateDoc and FieldValue.delete()
  const handleFirestoreDelete = async (fieldPath: string) => {
    if (!db) {
      setSaveStatus("Error: Firestore connection failed.");
      return;
    }
    setSaveStatus('Deleting item...');
    const translationsDocRef = doc(db, TRANSLATIONS_DOC_PATH);
    try {
      // Use the imported deleteField sentinel
      await updateDoc(translationsDocRef, {
        [fieldPath]: deleteField() // Use the deleteField() sentinel function
      });
      // Don't set status here, let onSnapshot update trigger potential status changes or rely on UI update
      // setSaveStatus('Item deleted successfully!'); // Optional: if needed
      // setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error("Failed to delete item from Firestore:", error);
      setSaveStatus('Error deleting item.');
      setTimeout(() => setSaveStatus(''), 5000);
    }
  };

  // Updated handleDeleteItem to handle array deletions (services) and field deletions (projects)
  const handleDeleteItem = useCallback(async (pathToDelete: (string | number)[]) => { // Make async
    if (!pathToDelete || pathToDelete.length < 1) {
        console.error("Invalid path for deletion:", pathToDelete);
        setSaveStatus('Error: Invalid deletion path.');
        return;
    }

    // Check if we are deleting a service item from the list array
    if (pathToDelete[0] === 'services' && pathToDelete[1] === 'list' && typeof pathToDelete[2] === 'number') {
        const serviceIndexToDelete = pathToDelete[2];

        // Get the current list from state (more reliable than reading Firestore again immediately)
        // Use optional chaining in case services or list is missing initially
        const currentServicesList = translations.en.services?.list;

        if (!Array.isArray(currentServicesList)) {
            console.error("Cannot delete service item: services.list is not an array or is missing.", currentServicesList);
            setSaveStatus('Error: Services data structure issue.');
            return;
        }

        // Create the new list without the item to delete
        const updatedServicesList = currentServicesList.filter((_, index) => index !== serviceIndexToDelete);

        // Update Firestore with the modified list
        if (!db) {
            setSaveStatus("Error: Firestore connection failed.");
            return;
        }
        setSaveStatus('Deleting service item...');
        const translationsDocRef = doc(db, TRANSLATIONS_DOC_PATH);
        try {
            // Update the specific field 'services.list' with the new array
            await updateDoc(translationsDocRef, {
                'services.list': updatedServicesList
            });
            // onSnapshot listener will automatically update the local state and UI
            // setSaveStatus('Service item deleted.'); // Optional status update if needed
            // setTimeout(() => setSaveStatus(''), 3000);
        } catch (error) {
            console.error("Failed to update services list in Firestore:", error);
            setSaveStatus('Error deleting service item.');
            setTimeout(() => setSaveStatus(''), 5000);
        }

    } else {
        // Handle deletion for other types (e.g., projects) using deleteField
        const fieldPathString = pathToDelete.join('.');
        if (!fieldPathString) {
           console.error("Generated empty field path for deletion:", pathToDelete);
           setSaveStatus('Error: Could not determine field to delete.');
           return;
        }
        // Call the specific delete function for Firestore fields
        // Note: handleFirestoreDelete is already async
        await handleFirestoreDelete(fieldPathString);
        // Rely on onSnapshot for UI updates
    }

  // Add dependency on the services list from state to ensure useCallback has the latest list
  // when creating the filtered array. Also include db reference.
  }, [translations.en.services?.list]); // Removed db dependency as it's stable


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
        setSaveStatus('Text content sections reset to defaults.');
        setTimeout(() => setSaveStatus(''), 3000);
      } catch (error) {
        console.error("Failed to reset translations in Firestore:", error);
        setSaveStatus('Error resetting content.');
        setTimeout(() => setSaveStatus(''), 5000);
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
