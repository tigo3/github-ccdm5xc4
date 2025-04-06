import React from 'react';
import {
  Github, Facebook, Mail, Instagram, Linkedin, Twitter, HelpCircle
} from 'lucide-react';

// List of available icons (should match App.tsx and potentially other places)
export const availableIcons = [
  "Github", "Facebook", "Mail", "Instagram", "Linkedin", "Twitter"
  // Add more here if needed and ensure they exist in iconComponents
];

// Map icon names to Lucide components
export const iconComponents: { [key: string]: React.ComponentType<{ size?: number | string, className?: string }> } = {
  Github,
  Facebook,
  Mail,
  Instagram,
  Linkedin,
  Twitter,
  HelpCircle, // Include fallback
  // Add more mappings here if availableIcons expands
};