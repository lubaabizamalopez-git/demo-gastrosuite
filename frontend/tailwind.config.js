/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#1a1c23', // Sidebar background
          orange: '#ff6b00', // Primary accent
          light: '#f4f5f7', // Main background
          text: '#2d3748', // Text color
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
