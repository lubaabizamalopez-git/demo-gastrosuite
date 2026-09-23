/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary)',
          dark: 'var(--brand-dark)',
          soft: 'var(--brand-soft)',
          cream: 'var(--brand-cream)',
        },
        neutral: {
          bg: 'var(--neutral-bg)',
          surface: 'var(--neutral-surface)',
          border: 'var(--neutral-border)',
        },
        text: {
          title: 'var(--text-title)',
          body: 'var(--text-body)',
          muted: 'var(--text-muted)',
        },
        status: {
          'success-bg': 'var(--success-bg)',
          'success-text': 'var(--success-text)',
          'error-bg': 'var(--error-bg)',
          'error-text': 'var(--error-text)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
