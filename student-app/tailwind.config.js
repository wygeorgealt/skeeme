/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Core Palette & Accents
        'accent-electric-blue': '#007aff',
        'accent-indigo': '#5856d6',
        
        // Primary
        primary: '#0058bc',
        'on-primary': '#ffffff',
        'primary-container': '#e5f1ff',
        'on-primary-container': '#004085',
        'inverse-primary': '#adc6ff',
        'primary-fixed': '#d8e2ff',
        'primary-fixed-dim': '#adc6ff',
        'on-primary-fixed': '#001a41',
        'on-primary-fixed-variant': '#004493',

        // Secondary
        secondary: '#4c4aca',
        'on-secondary': '#ffffff',
        'secondary-container': '#6664e4',
        'on-secondary-container': '#fffbff',
        'secondary-fixed': '#e2dfff',
        'secondary-fixed-dim': '#c2c1ff',
        'on-secondary-fixed': '#0c006a',
        'on-secondary-fixed-variant': '#3631b4',

        // Tertiary
        tertiary: '#006762',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#00837c',
        'on-tertiary-container': '#f3fffd',
        'tertiary-fixed': '#61f9ef',
        'tertiary-fixed-dim': '#39dcd2',
        'on-tertiary-fixed': '#00201e',
        'on-tertiary-fixed-variant': '#00504c',

        // Error
        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',

        // Surfaces & Background
        background: '#fcf8fb',
        'on-background': '#1b1b1d',
        surface: '#faf9fe',
        'surface-dim': '#dcd9dc',
        'surface-bright': '#fcf8fb',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f4f3f8',
        'surface-container': '#eeedf3',
        'surface-container-high': '#e9e7ed',
        'surface-container-highest': '#e3e2e7',
        'on-surface': '#1c1c1e',
        'on-surface-variant': '#48484a',
        'inverse-surface': '#303032',
        'inverse-on-surface': '#f3f0f2',
        'surface-variant': '#e4e2e4',
        'surface-tint': '#005bc1',

        // Outline
        outline: '#8e8e93',
        'outline-variant': '#d1d1d6',
      },
      fontFamily: {
        // System fonts as requested by user
        sans: ['System'],
        light: ['System'],
        medium: ['System'],
        semibold: ['System'],
        bold: ['System'],
      },
    },
  },
  plugins: [],
}
