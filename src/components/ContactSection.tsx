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
      className="container mx-auto px-4 py-16 rounded-lg shadow-xl bg-gray-800/50 backdrop-blur-sm" // Removed bg-gray-800/50
       // Use unified CSS variable
    >
      {/* Added background, padding, rounding, and shadow to the form container div */}
      <div className="sectionbg max-w-3xl mx-auto p-8 rounded-lg shadow-lg " >
        <h2 className="text-3xl font-bold text-center mb-8 " style={{ color: 'var(--title-color)' }}>{t.title}</h2>
        {/* Use the local handleSubmit */}
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
              onChange={handleInputChange} // Use local handleInputChange
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
              onChange={handleInputChange} // Use local handleInputChange
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
              onChange={handleInputChange} // Use local handleInputChange
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
