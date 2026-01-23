/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode colors
        primary: '#9c27b0',
        secondary: '#f44336',
        info: '#00acc1',
        success: '#4caf50',
        warning: '#ff9800',
        light: '#f8f9fa',
        dark: '#212121',

        // separate dark mode colors if needed
        'dark-primary': '#ce93d8',
        'dark-secondary': '#ef9a9a',
        'dark-info': '#80deea',
        'dark-success': '#81c784',
        'dark-warning': '#ffb74d',
        'dark-bg': '#121212',
        'dark-card': '#1e1e1e',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 6px 30px rgba(0, 0, 0, 0.15)',
        'card-dark': '0 4px 20px rgba(255, 255, 255, 0.05)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
