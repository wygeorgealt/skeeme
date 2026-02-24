/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        'brand-dark': '#010100',
        'brand-indigo': '#4f46e5',
        'brand-sky': '#0ea5e9',
      },
      fontFamily: {
        sans: ['Inter_400Regular', 'sans-serif'],
        medium: ['Inter_500Medium', 'sans-serif'],
        bold: ['Inter_700Bold', 'sans-serif'],
        black: ['Inter_900Black', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
