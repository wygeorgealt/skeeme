import { create } from 'zustand';
import { Platform } from 'react-native';

interface User {
    id: number;
    name: string;
    email: string;
    credits: number;
    is_unlimited: boolean;
    streak?: {
        current_streak: number;
        longest_streak: number;
        last_study_date: string | null;
    };
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    setAuth: (user: User, token: string) => void;
    updateUser: (user: Partial<User>) => void;
    logout: () => void;
    hydrate: () => Promise<void>;
    theme: 'light' | 'dark' | 'system';
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

// Platform-safe storage helpers (SecureStore is native-only, localStorage for web)
const storage = {
    getItem: async (key: string): Promise<string | null> => {
        if (Platform.OS === 'web') {
            return localStorage.getItem(key);
        }
        const SecureStore = await import('expo-secure-store');
        return SecureStore.getItemAsync(key);
    },
    setItem: async (key: string, value: string): Promise<void> => {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
            return;
        }
        const SecureStore = await import('expo-secure-store');
        await SecureStore.setItemAsync(key, value);
    },
    deleteItem: async (key: string): Promise<void> => {
        if (Platform.OS === 'web') {
            localStorage.removeItem(key);
            return;
        }
        const SecureStore = await import('expo-secure-store');
        await SecureStore.deleteItemAsync(key);
    },
};

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    isLoading: true,
    theme: 'system',

    setAuth: async (user, token) => {
        set({ user, token });
        try {
            await storage.setItem('auth_token', token);
            await storage.setItem('auth_user', JSON.stringify(user));
        } catch (e) {
            console.error('Failed to save auth state', e);
        }
    },

    updateUser: async (updatedFields) => {
        const currentUser = get().user;
        if (currentUser) {
            const newUser = { ...currentUser, ...updatedFields };
            set({ user: newUser });
            try {
                await storage.setItem('auth_user', JSON.stringify(newUser));
            } catch (e) {
                console.error('Failed to update user', e);
            }
        }
    },

    logout: async () => {
        set({ user: null, token: null });
        try {
            await storage.deleteItem('auth_token');
            await storage.deleteItem('auth_user');
        } catch (e) {
            console.error('Failed to clear auth state', e);
        }
    },

    hydrate: async () => {
        try {
            const token = await storage.getItem('auth_token');
            const userStr = await storage.getItem('auth_user');
            const themeStr = await storage.getItem('app_theme') as 'light' | 'dark' | 'system' | null;

            if (token && userStr) {
                set({ token, user: JSON.parse(userStr), theme: themeStr || 'system', isLoading: false });
            } else {
                set({ theme: themeStr || 'system', isLoading: false });
            }
        } catch (e) {
            console.error('Failed to hydrate auth state', e);
            set({ isLoading: false });
        }
    },

    setTheme: async (theme) => {
        set({ theme });
        try {
            await storage.setItem('app_theme', theme);
        } catch (e) {
            console.error('Failed to save theme state', e);
        }
    },
}));
