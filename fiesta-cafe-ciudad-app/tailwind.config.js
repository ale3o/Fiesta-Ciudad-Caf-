/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#F07A19",
        bgBase: "#0D0D0D",
        surface: "#1A1A1A",
        textMain: "#FFFFFF",
        textSec: "#8C8C8C",
        success: "#34C759",
        inactive: "#4A4A4A",
        mapCivic: "#007AFF"
      },
      fontFamily: {
        sans: ['Montserrat', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}