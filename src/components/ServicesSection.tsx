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
    <section
      className="container mx-auto px-4 py-16 rounded-lg shadow-xl bg-gray-800/50 backdrop-blur-sm" // Removed bg-gray-800/50
       // Use unified CSS variable
    >
      <div className="max-w-5xl mx-auto" >
        {/* Apply primary color using CSS variable */}
        <h2 className="text-3xl font-bold text-center mb-8" style={{ color: 'var(--title-color)' }}>{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            // Increased shadow from shadow-md to shadow-lg
            <div key={index} className="bg-gray-900 p-6 rounded-lg shadow-l" style={{ backgroundColor: 'var(--section-bg-color)' }}>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--h3title-color)' }}>{service.title}</h3>
              <p className="text-gray-300 text-text">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
