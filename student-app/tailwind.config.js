/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Standardized Blue & Black Core Tokens
        'accent-electric-blue': '#007AFF',
        'accent-indigo': '#5856D6',
        
        // Primary
        primary: '#007AFF',
        'primary-accent': '#0A84FF',
        'on-primary': '#FFFFFF',
        'primary-container': '#E5F1FF',
        'on-primary-container': '#004085',
        'inverse-primary': '#ADC6FF',
        'primary-fixed': '#D8E2FF',
        'primary-fixed-dim': '#ADC6FF',
        'on-primary-fixed': '#001A41',
        'on-primary-fixed-variant': '#004493',

        // Secondary
        secondary: '#5856D6',
        'on-secondary': '#FFFFFF',
        'secondary-container': '#E2DFFF',
        'on-secondary-container': '#1E1B4B',
        'secondary-fixed': '#E2DFFF',
        'secondary-fixed-dim': '#C2C1FF',
        'on-secondary-fixed': '#0C006A',
        'on-secondary-fixed-variant': '#3631B4',

        // Tertiary / Mint / Accent
        tertiary: '#10B981',
        'on-tertiary': '#FFFFFF',
        'tertiary-container': '#D1FAE5',
        'on-tertiary-container': '#064E3B',
        'tertiary-fixed': '#A7F3D0',
        'tertiary-fixed-dim': '#6EE7B7',
        'on-tertiary-fixed': '#064E3B',
        'on-tertiary-fixed-variant': '#047857',

        // Error & Success
        error: '#EF4444',
        'on-error': '#FFFFFF',
        'error-container': '#FEE2E2',
        'on-error-container': '#991B1B',
        success: '#10B981',
        'on-success': '#FFFFFF',
        'success-container': '#D1FAE5',
        'on-success-container': '#065F46',

        // Surfaces & Backgrounds
        background: '#F8F9FA',
        'on-background': '#0F172A',
        surface: '#FFFFFF',
        'surface-dim': '#E2E8F0',
        'surface-bright': '#FFFFFF',
        'surface-container-lowest': '#FFFFFF',
        'surface-container-low': '#F1F3F5',
        'surface-container': '#E9ECEF',
        'surface-container-high': '#DEE2E6',
        'surface-container-highest': '#CED4DA',
        'on-surface': '#0F172A',
        'on-surface-variant': '#64748B',
        'inverse-surface': '#16181D',
        'inverse-on-surface': '#F8F9FA',
        'surface-variant': '#F1F3F5',
        'surface-tint': '#007AFF',

        // Outline & Borders
        outline: '#94A3B8',
        'outline-variant': '#E2E8F0',
        border: 'rgba(0, 0, 0, 0.08)',
        'dark-border': 'rgba(255, 255, 255, 0.08)',

        // Dark Surface Tokens (convenient direct classes)
        'dark-bg': '#0B0C0E',
        'dark-surface': '#16181D',
        'dark-surface-low': '#20232B',
        'dark-surface-elevated': '#282C37',
      },
      fontFamily: {
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
