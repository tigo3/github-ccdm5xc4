import React from 'react';
import defaultLogo from '/logo.png'; // Import the logo relative to the public directory

interface LogoProps {
  logoUrl?: string;
  altText?: string;
  className?: string; // Keep className for overrides
}

const Logo: React.FC<LogoProps> = ({
  logoUrl,
  altText = "Site Logo", // More descriptive default alt text
  className = "", // Default to empty string
}) => {
  const effectiveLogoUrl = logoUrl || defaultLogo;

  // Default Tailwind classes + merged custom classes
  const combinedClassName = `block mx-auto h-[25rem] w-auto mb-6 ${className}`.trim(); // Default: block, centered, h-[25rem] (100*4px), auto width, margin-bottom-6

  return (
    <img
      src={effectiveLogoUrl}
      alt={altText}
      className={combinedClassName} // Apply combined classes
    />
  );
};

export default Logo;
