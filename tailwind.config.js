/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'magenta-digital': '#E6007E',
        'cyan-orbital': '#19A6E0',
        'rosa-cuarzo': '#CB7BA7',
        'gris-carbon': '#8E8E93',
        'gris-medio': '#D1D1D6',
        'bg-dark': '#0D0D11',
        'surface-card': 'rgba(23, 23, 30, 0.75)',
      },
      fontFamily: {
        heading: ['Fjalla One', 'sans-serif'],
        body: ['Jost', 'sans-serif'],
        accent: ['Courgette', 'cursive'],
      },
      zIndex: {
        'back': '100',
        'card': '200',
        'nav': '500',
        'modal': '900',
        'martina': '1000',
        'overlay': '1200',
      }
    },
  },
  plugins: [],
}
