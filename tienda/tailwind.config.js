/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      // Hex (no var()) para permitir modificadores de opacidad, ej. bg-brand-primary/10
      colors: {
        brand: {
          primary: '#FF6B00',
          dark: '#CC5500',
          soft: '#FFBD80',
          cream: '#FFF5F0',
        },
        neutral: {
          bg: '#FAF7F2',
          surface: '#FFFFFF',
          border: '#E6DFD5',
        },
        text: {
          title: '#231E1B',
          body: '#5C534E',
          muted: '#91857F',
        },
        status: {
          'success-bg': '#E6F4EA',
          'success-text': '#137333',
          'error-bg': '#FCE8E6',
          'error-text': '#C5221F',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
