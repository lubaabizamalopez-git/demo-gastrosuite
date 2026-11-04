/** @type {import('tailwindcss').Config} */

// Los colores salen de variables CSS en canales RGB (definidas en styles.scss por modo visual).
// El formato rgb(var(--x) / <alpha-value>) mantiene los modificadores de opacidad, ej. bg-brand-primary/10
const token = (nombre) => `rgb(var(--${nombre}) / <alpha-value>)`;

module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: token('brand-primary'),
          dark: token('brand-dark'),
          soft: token('brand-soft'),
          cream: token('brand-cream'),
          // Texto sobre fondos brand-primary (blanco en clásico, café oscuro en moderno)
          contraste: token('brand-contraste'),
        },
        neutral: {
          bg: token('neutral-bg'),
          surface: token('neutral-surface'),
          border: token('neutral-border'),
        },
        text: {
          title: token('text-title'),
          body: token('text-body'),
          muted: token('text-muted'),
        },
        status: {
          'success-bg': token('success-bg'),
          'success-text': token('success-text'),
          'error-bg': token('error-bg'),
          'error-text': token('error-text'),
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
