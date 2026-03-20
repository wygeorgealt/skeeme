/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        'brand-primary': '#8B5CF6',
        'brand-dark': '#121212',
        'brand-indigo': '#4f46e5',
        'brand-sky': '#0ea5e9',
        'app-dark': '#090A0F',
        'card-dark': '#13151B',
      },
      fontFamily: {
        sans: ['System'],
        medium: ['System'],
        bold: ['System'],
        black: ['System'],
      },
    },
  },
  plugins: [],
}
