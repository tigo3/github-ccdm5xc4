import React from 'react';

interface Service {
  title: string;
  description: string;
}

interface ServicesSectionProps {
  title: string;
  services: Service[];
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ title, services }) => {
  return (
    // Added shadow-xl, rounded-lg, and background color using the unified CSS variable
    <section id='services'
      className="container mx-auto px-4 py-16  backdrop-blur-sm" // Removed bg-gray-800/50
      // Removed inline style/variable reference for background
    >
      <div className="max-w-5xl mx-auto" >
        {/* Apply primary color using CSS variable */}
        <h2 className="text-3xl font-bold text-center mb-8 text-title">
          {/* Removed inline style: color: 'var(--title-color)' */}
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            // Increased shadow from shadow-md to shadow-lg
            <div key={index} className="p-6 shadow-lg bg-section"> {/* Removed bg-gray-900, style, corrected shadow-l, added bg-section */}
              <h3 className="text-xl font-semibold mb-4 text-h3title">{service.title}</h3> {/* Removed inline style */}
              <p className="text-text">{service.description}</p> {/* Removed text-gray-300 */}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
