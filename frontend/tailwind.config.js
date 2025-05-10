/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'outfit': ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        'redhat': ['Red Hat Display', 'serif']
      },
      colors: {
        primary: 'var(--color-primary)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'text-primary': 'var(--color-text)',
        'text-secondary': 'var(--color-text-secondary)',
      },
      keyframes: {
        'fade-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      animation: {
        'fade-down': 'fade-down 0.6s ease-out both',
        'fade-up': 'fade-up 0.6s ease-out both'
      },
    },
  },
  plugins: [],
}
