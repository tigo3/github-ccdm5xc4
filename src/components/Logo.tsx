import React from 'react';

interface LogoProps {
  logoUrl?: string; // Make logoUrl optional
}

const Logo: React.FC<LogoProps> = ({ logoUrl }) => {
  const defaultLogoUrl = "https://raw.githubusercontent.com/tiger3homs/home/refs/heads/main/public/logo.png";
  
  return (
    <img 
      src={logoUrl || defaultLogoUrl} // Use logoUrl if provided, otherwise fallback to default
      alt="Logo" 
      className="mx-auto mb-6 w-24 h-24"
      style={{ pointerEvents: 'none', userSelect: 'none' }}
    />
  );
};

export default Logo;
