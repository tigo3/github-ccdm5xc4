// tailwind.config.js
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Light theme colors (default)
        primary: {
          DEFAULT: '#3b82f6', // blue-500
          hover: '#2563eb', // blue-600
          light: '#93c5fd', // blue-300
          dark: '#1d4ed8', // blue-700
        },
        secondary: {
          DEFAULT: '#6b7280', // gray-500
          hover: '#4b5563', // gray-600
        },
        background: {
          DEFAULT: '#ffffff',
          secondary: '#f3f4f6', // gray-100
        },
        text: {
          DEFAULT: '#1f2937', // gray-800
          secondary: '#4b5563', // gray-600
          light: '#9ca3af', // gray-400
        },
      },
    },
  },
  plugins: [
    function({ addBase, theme }) {
      addBase({
        // Light theme (default)
        ':root': {
          '--color-primary': theme('colors.primary.DEFAULT'),
          '--color-primary-hover': theme('colors.primary.hover'),
          '--color-primary-light': theme('colors.primary.light'),
          '--color-primary-dark': theme('colors.primary.dark'),
          '--color-secondary': theme('colors.secondary.DEFAULT'),
          '--color-secondary-hover': theme('colors.secondary.hover'),
          '--color-background': theme('colors.background.DEFAULT'),
          '--color-background-secondary': theme('colors.background.secondary'),
          '--color-text': theme('colors.text.DEFAULT'),
          '--color-text-secondary': theme('colors.text.secondary'),
          '--color-text-light': theme('colors.text.light'),
        },
        
        // Dark theme
        '.dark': {
          '--color-primary': '#60a5fa', // blue-400
          '--color-primary-hover': '#3b82f6', // blue-500
          '--color-primary-light': '#93c5fd', // blue-300
          '--color-primary-dark': '#2563eb', // blue-600
          '--color-secondary': '#9ca3af', // gray-400
          '--color-secondary-hover': '#d1d5db', // gray-300
          '--color-background': '#1f2937', // gray-800
          '--color-background-secondary': '#111827', // gray-900
          '--color-text': '#f9fafb', // gray-50
          '--color-text-secondary': '#e5e7eb', // gray-200
          '--color-text-light': '#d1d5db', // gray-300
        },
        
        // Forest theme
        '.forest': {
          '--color-primary': '#34d399', // emerald-400
          '--color-primary-hover': '#10b981', // emerald-500
          '--color-primary-light': '#6ee7b7', // emerald-300
          '--color-primary-dark': '#059669', // emerald-600
          '--color-secondary': '#6b7280', // gray-500
          '--color-secondary-hover': '#4b5563', // gray-600
          '--color-background': '#ecfdf5', // emerald-50
          '--color-background-secondary': '#d1fae5', // emerald-100
          '--color-text': '#064e3b', // emerald-900
          '--color-text-secondary': '#065f46', // emerald-800
          '--color-text-light': '#047857', // emerald-700
        },
        
        // Ocean theme
        '.ocean': {
          '--color-primary': '#38bdf8', // sky-400
          '--color-primary-hover': '#0ea5e9', // sky-500
          '--color-primary-light': '#7dd3fc', // sky-300
          '--color-primary-dark': '#0284c7', // sky-600
          '--color-secondary': '#94a3b8', // slate-400
          '--color-secondary-hover': '#64748b', // slate-500
          '--color-background': '#f0f9ff', // sky-50
          '--color-background-secondary': '#e0f2fe', // sky-100
          '--color-text': '#0c4a6e', // sky-900
          '--color-text-secondary': '#075985', // sky-800
          '--color-text-light': '#0369a1', // sky-700
        },
        
        // Sunset theme
        '.sunset': {
          '--color-primary': '#fb7185', // rose-400
          '--color-primary-hover': '#f43f5e', // rose-500
          '--color-primary-light': '#fda4af', // rose-300
          '--color-primary-dark': '#e11d48', // rose-600
          '--color-secondary': '#f97316', // orange-500
          '--color-secondary-hover': '#ea580c', // orange-600
          '--color-background': '#fff1f2', // rose-50
          '--color-background-secondary': '#ffe4e6', // rose-100
          '--color-text': '#881337', // rose-900
          '--color-text-secondary': '#9f1239', // rose-800
          '--color-text-light': '#be123c', // rose-700
        },
      });
    },
  ],
};