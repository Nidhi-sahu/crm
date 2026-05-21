/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F2F9FF',
          100: '#E6F3FF',
          200: '#BEE1FF',
          300: '#8FCBFF',
          400: '#5FB2FF',
          500: '#2F98FF',
          600: '#1278E6',
          700: '#0A5BB0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 10px 40px -12px rgba(15, 23, 42, 0.12)',
        soft: '0 2px 8px -2px rgba(15, 23, 42, 0.06)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
