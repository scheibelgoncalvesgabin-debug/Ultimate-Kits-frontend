/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0d0d1a',
          800: '#13131f',
          700: '#1e1e2e',
          600: '#2a2a3e',
          500: '#373750',
          400: '#4a4a6a',
        },
        brand: {
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#3730a3',
        },
      },
    },
  },
  plugins: [],
};
