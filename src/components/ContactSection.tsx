import React from 'react';

interface ContactSectionProps {
  t: {
    title: string;
    nameLabel: string;
    emailLabel: string;
    messageLabel: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    messagePlaceholder: string;
    submitButton: string;
  };
  handleSubmit: (e: React.FormEvent) => void;
  formData: {
    name: string;
    email: string;
    message: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const ContactSection: React.FC<ContactSectionProps> = ({ t, handleSubmit, formData, handleInputChange }) => {
  return (
    // Added shadow-xl, rounded-lg, and background color using the unified CSS variable
    <section
      className="container mx-auto px-4 py-16 rounded-lg shadow-xl bg-gray-800/50 backdrop-blur-sm" // Removed bg-gray-800/50
       // Use unified CSS variable
    >
      {/* Added background, padding, rounding, and shadow to the form container div */}
      <div className="sectionbg max-w-3xl mx-auto p-8 rounded-lg shadow-lg " >
        <h2 className="text-3xl font-bold text-center mb-8 " style={{ color: 'var(--title-color)' }}>{t.title}</h2>
        <form onSubmit={handleSubmit} className="mt-8" >
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300" style={{ color: 'var(--h3title-color)' }}>
              {t.nameLabel}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) => {
                console.log('Name Input:', e.target.value); // Debugging log
                handleInputChange(e);
              }}
              placeholder={t.namePlaceholder}
              className="mt-1 block w-full rounded-md  bg-gray-800/50 text-white border-gray-500 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300" style={{ color: 'var(--h3title-color)' }}>
              {t.emailLabel}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={(e) => {
                console.log('Email Input:', e.target.value); // Debugging log
                handleInputChange(e);
              }}
              placeholder={t.emailPlaceholder}
              className="mt-1 block w-full rounded-md  bg-gray-800/50 text-white border-gray-500 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-300" style={{ color: 'var(--h3title-color)' }}>
              {t.messageLabel}
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={(e) => {
                console.log('Message Input:', e.target.value); // Debugging log
                handleInputChange(e);
              }}
              placeholder={t.messagePlaceholder}
              className="mt-1 block w-full rounded-md  bg-gray-800/50 text-white border-gray-500 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-blue-900 transition"
          >
            {t.submitButton}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;
