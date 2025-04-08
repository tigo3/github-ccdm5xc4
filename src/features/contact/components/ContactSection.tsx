import React, { useState, useCallback } from 'react';
import emailjs from 'emailjs-com';
import { useNotifications } from '../../../contexts/NotificationContext';

// Rate limiting constants
const RATE_LIMIT_DURATION = 60000;
let lastSubmissionTime = 0;

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateMessage = (message: string): boolean => {
  return message.length >= 10 && message.length <= 1000;
};

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
}

const ContactSection: React.FC<ContactSectionProps> = ({ t }) => {
  const { showToast, requestConfirmation } = useNotifications();
  
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
      showToast('Please wait a minute before sending another message.', 'error');
      return;
    }

    if (!validateEmail(formData.email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    if (!validateMessage(formData.message)) {
      showToast('Message must be between 10 and 1000 characters.', 'error');
      return;
    }

    // Ask for confirmation before sending
    requestConfirmation({
      title: 'Send Message',
      message: 'Are you sure you want to send this message?',
      confirmText: 'Send',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          lastSubmissionTime = now;
          
          // Initialize EmailJS
          emailjs.init("skwn_-DYfDakGK644");

          await emailjs.send(
            "service_bdj14o3",
            "template_2e2nikq",
            {
              name: formData.name,
              email: formData.email,
              message: formData.message,
              to_email: 'tiger3homs@gmail.com',
            }
          );

          showToast('Message sent successfully!', 'success');
          setFormData({ name: '', email: '', message: '' }); // Reset form
        } catch (error) {
          console.error('Failed to send message:', error);
          showToast('Failed to send message. Please try again.', 'error');
        }
      }
    });
  }, [formData, showToast, requestConfirmation]);

  return (
    <section id='contact'
      className="container mx-auto px-4 py-16 shadow-xl backdrop-blur-sm"
    >
      <div className="bg-section max-w-3xl mx-auto p-8 shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-8 text-title">
          {t.title}
        </h2>
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-h3title">
              {t.nameLabel}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder={t.namePlaceholder}
              className="mt-1 block w-full bg-gradient-to-br from-background to-background-secondary text-text border-secondary focus:ring-primary focus:border-primary p-1"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-h3title">
              {t.emailLabel}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder={t.emailPlaceholder}
              className="mt-1 block w-full bg-gradient-to-br from-background to-background-secondary text-text border-secondary focus:ring-primary focus:border-primary p-1"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-h3title">
              {t.messageLabel}
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder={t.messagePlaceholder}
              className="mt-1 block w-full bg-gradient-to-br from-background to-background-secondary text-text border-secondary focus:ring-primary focus:border-primary p-3"
              rows={4}
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary hover:bg-gradient-to-br from-background to-background-secondary transition"
          >
            {t.submitButton}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;