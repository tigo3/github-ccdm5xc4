import React from 'react';
import { FaHome, FaProjectDiagram, FaBlog, FaUser, FaConciergeBell, FaEnvelope } from 'react-icons/fa'; // Import necessary icons

interface TopNavigationProps {
  // Props can be added here if needed later
}

const TopNavigation: React.FC<TopNavigationProps> = () => {
  // Smooth scroll handler
  const handleSmoothScroll = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    const targetId = href.substring(1); // Remove the '#'
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Define link items with icons
  const navLinks = [
    { href: '#home', text: 'Home', icon: <FaHome /> },
    { href: '#projects', text: 'Featured Projects', icon: <FaProjectDiagram /> },
    { href: '#blog', text: 'Blog', icon: <FaBlog /> },
    { href: '#about', text: 'About Me', icon: <FaUser /> },
    { href: '#services', text: 'Services', icon: <FaConciergeBell /> },
    { href: '#contact', text: 'Contact Me', icon: <FaEnvelope /> },
  ];

  return (
    // Applied glassmorphism styles conditionally (md and up): backdrop-blur-md, border, shadow. Changed justify-center to justify-between.
    <nav className="nav-container md:backdrop-blur-md md:shadow-lg flex items-center justify-center max-w-screen-xl mx-auto px-6 py-4 sticky top-0 z-50">
      <ul className="hidden md:flex md:items-center md:gap-x-8"> 
        {navLinks.map((link) => (
          <li key={link.href}>
            <a
              className="text-text hover:underline underline-offset-4 decoration-2 transition-colors font-medium py-2 flex items-center" // Added flex items-center for vertical alignment
              href={link.href}
              onClick={(e) => handleSmoothScroll(e, link.href)} // Added onClick for smooth scroll
            >
              <span className="mr-2">{link.icon}</span> {/* Display icon */}
              {link.text} {/* Display text */}
            </a>
          </li>
        ))}
      </ul>

      {/* Mobile Icons - Only visible on small screens */}
      <ul className="md:hidden flex items-center gap-x-4"> {/* Use flex and gap for mobile icons */}
        {navLinks.map((link) => (
          <li key={link.href}>
            <a
              className="text-primary text-xl md:gap-x-8" // Style for mobile icons
              href={link.href}
              onClick={(e) => handleSmoothScroll(e, link.href)}
              aria-label={link.text} // Add aria-label for accessibility
            >
              {link.icon}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TopNavigation;
