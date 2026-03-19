/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        'brand-primary': '#D2B48C',
        'brand-dark': '#121212',
        'brand-indigo': '#4f46e5',
        'brand-sky': '#0ea5e9',
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
