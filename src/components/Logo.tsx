import React from 'react';
import defaultLogo from '/logo.png'; // Import the logo relative to the public directory

interface LogoProps {
  logoUrl?: string;
  altText?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
}

const Logo: React.FC<LogoProps> = ({
  logoUrl,
  altText = "Site Logo", // More descriptive default alt text
  className = "", // Default to empty string
}) => {
  const effectiveLogoUrl = logoUrl || defaultLogo;

  return (
    <img
      src={effectiveLogoUrl}
      alt={altText}
      // Apply passed className, keep pointer/select styles
      className={`logo-image ${className}`} // Add a base class and merge with passed className

    />
  );
};

export default Logo;
