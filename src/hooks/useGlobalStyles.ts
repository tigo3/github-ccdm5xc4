import { useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

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

export const useGlobalStyles = () => {
  useEffect(() => {
    if (!db) {
      console.error("useGlobalStyles: Firestore not initialized correctly.");
      return;
    }
    const stylesDocRef = doc(db, 'settings', 'styles');
    // console.log("useGlobalStyles: Setting up real-time listener for global styles..."); // Removed log

    const unsubscribe = onSnapshot(stylesDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as StyleData;
        // console.log('useGlobalStyles: Received style update from Firestore:', data); // Removed log
        // Apply styles as CSS variables to the root element
        // Apply styles using the CSS variable names expected by the Tailwind theme plugin
        document.documentElement.style.setProperty('--color-primary', data.primaryColor);
        document.documentElement.style.setProperty('--color-secondary', data.secondaryColor);
        document.documentElement.style.setProperty('--font-family', data.fontFamily); // Font family variable seems consistent
        // Map specific color names from Firestore to the generic text/background variables used by the plugin
        document.documentElement.style.setProperty('--color-text', data.textColor || '#c6d3e2'); // Default fallback for main text
        // Set specific title colors, falling back to primary or text color if not defined
        document.documentElement.style.setProperty('--title-color', data.titleColor || data.primaryColor || '#FFFFFF'); // Fallback to primary, then white
        document.documentElement.style.setProperty('--h3-title-color', data.h3TitleColor || data.textColor || '#E5E7EB'); // Fallback to text color, then light gray
        document.documentElement.style.setProperty('--color-background', data.backgroundFromColor || '#111827'); // Use 'from' as the main background
        document.documentElement.style.setProperty('--color-background-secondary', data.backgroundToColor || '#1F2937'); // Use 'to' as secondary background
        // --section-bg-color is not directly used by the theme plugin, keep it if needed by custom CSS like .sectionbg
        document.documentElement.style.setProperty('--section-bg-color', data.sectionBgColor || '#374151');
        // Add fallbacks for hover/light/dark variants if not set by Firestore (or handle in plugin)
        // Example: document.documentElement.style.setProperty('--color-primary-hover', data.primaryColorHover || data.primaryColor);
      } else {
        // console.log("useGlobalStyles: No global styles document found in Firestore, using CSS defaults."); // Removed log
        // Optionally clear or set default variables if the document is deleted
        // document.documentElement.style.removeProperty('--primary-color'); // Example
      }
    }, (error) => {
      console.error("useGlobalStyles: Error listening to global styles:", error);
    });

    // Cleanup listener on component unmount
    return () => {
      // console.log("useGlobalStyles: Unsubscribing from global styles listener."); // Removed log
      unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs only once on mount
};