import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa'; // Import FaTimes for close icon

interface TopNavigationProps {
  // Props can be added here if needed later
}

const TopNavigation: React.FC<TopNavigationProps> = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Define link items for reusability
  const navLinks = [
    { href: '#', text: 'Home' },
    { href: '#projects', text: 'Featured Projects' },
    { href: '#blog', text: 'Blog' },
    { href: '#about', text: 'About Me' },
    { href: '#services', text: 'Services' },
    { href: '#contact', text: 'Contact Me' },
  ];

  return (
    // Applied glassmorphism styles: bg-white/15, backdrop-blur-md, border, shadow, rounded-b, max-width, mx-auto, padding
    <nav className="nav-container backdrop-blur-md border border-white/30 shadow-lg flex items-center justify-center max-w-screen-xl mx-auto px-6 py-4 sticky top-0 z-50">
      {/* Hamburger Button - Only visible on small screens */}
      <button
        className="md:hidden text-white text-xl p-2 focus:outline-none" // Changed text color, focus ring
        onClick={toggleMenu}
        aria-label="Toggle menu" // Accessibility improvement
      >
        {isOpen ? <FaTimes /> : <FaBars />} {/* Toggle between Bars and Times icon */}
      </button>

      <ul className="hidden md:flex md:items-center md:gap-x-8"> 
        {navLinks.map((link) => (
          <li key={link.href}>
            <a
              className="text-white hover:underline underline-offset-4 decoration-2 transition-colors font-medium py-2" // Changed text color, hover effect, font weight, padding
              href={link.href}
            >
              {link.text}
            </a>
          </li>
        ))}
      </ul>

      {/* Mobile Navigation Links - Absolute positioned, shown when isOpen, hidden on medium+ */}
      {isOpen && (
        // Applied glassmorphism to mobile dropdown
        <ul className="nav-links md:hidden flex flex-col absolute top-full left-0 w-full bg-white/15 backdrop-blur-md border border-white/30 rounded-b-lg shadow-lg py-2">
          {navLinks.map((link) => (
            <li key={link.href} className="w-full">
              <a
                className="block text-center text-white hover:bg-white/20 transition-colors font-medium py-3 px-4" // Changed text color, hover bg, font weight
                href={link.href}
                onClick={() => setIsOpen(false)} // Close menu on link click
              >
                {link.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
};

export default TopNavigation;
