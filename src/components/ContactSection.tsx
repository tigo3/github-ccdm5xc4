import React, { useState, useCallback } from 'react'; // Added useState, useCallback
import emailjs from 'emailjs-com'; // Added emailjs import

// --- Moved from App.tsx ---
const RATE_LIMIT_DURATION = 60000;
let lastSubmissionTime = 0;

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateMessage = (message: string): boolean => {
  return message.length >= 10 && message.length <= 1000;
};
// --- End Moved from App.tsx ---


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
  // Removed handleSubmit, formData, handleInputChange props
}

const ContactSection: React.FC<ContactSectionProps> = ({ t }) => { // Removed props from destructuring
  // --- Moved from App.tsx ---
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const now = Date.now();
    if (now - lastSubmissionTime < RATE_LIMIT_DURATION) {
      alert('Please wait a minute before sending another message.');
      return;
    }

    if (!validateEmail(formData.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (!validateMessage(formData.message)) {
      alert('Message must be between 10 and 1000 characters.');
      return;
    }

    lastSubmissionTime = now;

    try {
      // Consider moving User ID to environment variables or config
      emailjs.init("skwn_-DYfDakGK644");

      await emailjs.send(
        // Consider moving Service ID and Template ID to environment variables or config
        "service_bdj14o3",
        "template_2e2nikq",
        {
          name: formData.name,
          email: formData.email,
          message: formData.message,
          to_email: 'tiger3homs@gmail.com', // Consider moving recipient email to config
        }
      );

      alert('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' }); // Reset form
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    }
  }, [formData]); // Dependency array includes formData
  // --- End Moved from App.tsx ---
  return (
    // Added shadow-xl, rounded-lg, and background color using the unified CSS variable
    <section
      className="container mx-auto px-4 py-16 rounded-lg shadow-xl backdrop-blur-sm" // Removed bg-gray-800/50
      // Removed inline style/variable reference for background
    >
      {/* Added background, padding, rounding, and shadow to the form container div */}
      <div className="bg-section max-w-3xl mx-auto p-8 rounded-lg shadow-lg " > {/* Replaced sectionbg with bg-section */}
        <h2 className="text-3xl font-bold text-center mb-8 text-title">
          {/* Removed inline style: color: 'var(--title-color)' */}
          {t.title}
        </h2>
        {/* Use the local handleSubmit */}
        <form onSubmit={handleSubmit} className="mt-8" >
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-h3title"> {/* Removed text-gray-300 and inline style */}
              {t.nameLabel}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange} // Use local handleInputChange
              placeholder={t.namePlaceholder}
              className="mt-1 block w-full rounded-md bg-background-secondary/50 text-text border-secondary focus:ring-primary focus:border-primary" // Replaced hardcoded colors with theme colors
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-h3title"> {/* Removed text-gray-300 and inline style */}
              {t.emailLabel}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange} // Use local handleInputChange
              placeholder={t.emailPlaceholder}
              className="mt-1 block w-full rounded-md bg-background-secondary/50 text-text border-secondary focus:ring-primary focus:border-primary" // Replaced hardcoded colors with theme colors
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-h3title"> {/* Removed text-gray-300 and inline style */}
              {t.messageLabel}
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange} // Use local handleInputChange
              placeholder={t.messagePlaceholder}
              className="mt-1 block w-full rounded-md bg-background-secondary/50 text-text border-secondary focus:ring-primary focus:border-primary" // Replaced hardcoded colors with theme colors
              rows={4}
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition" // Replaced hardcoded colors with theme colors
          >
            {t.submitButton}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;
