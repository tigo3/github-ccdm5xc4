/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        secondary: 'var(--secondary-color)',
        titel: 'var(--title-color)',
        h3titel: 'var(--h3title-color)',
        text: 'var(--text-color)',
      },
      fontFamily: {
        sans: ['var(--font-family)', 'sans-serif'], // Use CSS variable, fallback to sans-serif
      },
    },
  },
  plugins: [],
};
