import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Github, Facebook, Mail, Instagram, Linkedin, Twitter } from 'lucide-react';
import { db } from '../config/firebaseConfig';

// Define the SocialLink interface (moved from App.tsx)
export interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: string;
  order: number;
}

// Define the icon components map (moved from App.tsx)
export const iconComponents: { [key: string]: React.ComponentType<{ size?: number | string }> } = {
  Github,
  Facebook,
  Mail,
  Instagram,
  Linkedin,
  Twitter,
};

export function useSocialLinks() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // db check moved inside fetchSocialLinks

    const fetchSocialLinks = async () => {
      // Move the db check inside the async function scope
      if (!db) {
        console.error("useSocialLinks: Firestore instance is not available.");
        setError(new Error("Firestore not available"));
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const linksCollection = collection(db, 'socialLinks');
        const q = query(linksCollection, orderBy('order', 'asc'));
        const querySnapshot = await getDocs(q);
        const links = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SocialLink));
        setSocialLinks(links);
        // console.log("useSocialLinks: Fetched social links:", links); // Removed log
      } catch (err) {
        console.error("useSocialLinks: Error fetching social links:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSocialLinks();
    // No cleanup needed for getDocs, but good practice if using onSnapshot
  }, []); // Runs once on mount

  return { socialLinks, iconComponents, isLoading, error };
}