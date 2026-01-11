export const theme = {
    colors: {
        // Backgrounds
        backgroundLight: '#f5f5f5',
        backgroundDark: '#18181b', // zinc-950/scaffold

        // Cards Glassmorphism
        cardBgLight: 'rgba(255, 255, 255, 0.85)',
        cardBgDark: 'rgba(39, 39, 42, 0.8)', // zinc-800 with 0.8 opacity
        cardBorderLight: 'rgba(255, 255, 255, 0.2)',
        cardBorderDark: 'rgba(255, 255, 255, 0.1)',

        // Texts
        textPrimaryLight: '#18181b',
        textPrimaryDark: '#fafafa',
        textSecondaryLight: '#71717a', // zinc-500
        textSecondaryDark: '#a1a1aa', // zinc-400

        // Accents / Gradients (Approximated as solid colors for RN except when using LinearGradient)
        primary: '#667eea', // Fallback for primary gradient
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',

        // Specific Elements
        buttonPrimary: '#3b82f6',

        // Gradients (Array format for expo-linear-gradient if used, or just referencable)
        gradients: {
            primary: ['#667eea', '#764ba2'],
            success: ['#4facfe', '#00f2fe'],
            warning: ['#f093fb', '#f5576c'],
            info: ['#4facfe', '#00f2fe'],
        }
    },
    spacing: {
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
    },
    borderRadius: {
        sm: 8,
        md: 12,
        lg: 16,
    }
};
