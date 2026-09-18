/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#060a13',
          900: '#0b1120',
          800: '#141d33',
          700: '#23304e',
        }
      }
    },
  },
  plugins: [],
}
