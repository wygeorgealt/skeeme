import { create } from 'zustand';
import { Platform } from 'react-native';

interface User {
    id: number;
    name: string;
    email: string;
    credits: number;
    is_unlimited: boolean;
    plan_name?: string; // 'free', 'standard', 'elite', etc.
    streak?: {
        current_streak: number;
        longest_streak: number;
        last_study_date: string | null;
    };
    pricing?: {
        amount: string;
        currency: string;
        period: string;
    };
    ai_preferences?: {
        education_level?: string;
        field_of_study?: string;
        learning_style?: string;
        tone?: string;
        language?: string;
    };
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (user: User, token: string) => void;
    updateUser: (user: Partial<User>) => void;
    logout: () => void;
    hydrate: () => Promise<void>;
    checkAuth: () => Promise<void>;
    theme: 'light' | 'dark' | 'system';
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

// Secure storage for sensitive data (tokens)
const secureStorage = {
    getItem: async (key: string): Promise<string | null> => {
        if (Platform.OS === 'web') return localStorage.getItem(key);
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

// Standard storage for large non-sensitive data (user profile, theme)
const standardStorage = {
    getItem: async (key: string): Promise<string | null> => {
        if (Platform.OS === 'web') return localStorage.getItem(key);
        try {
            const { documentDirectory, getInfoAsync, readAsStringAsync } = (await import('expo-file-system/legacy')) as any;
            const path = `${documentDirectory}${key}.json`;
            const info = await getInfoAsync(path);
            if (!info.exists) return null;
            return await readAsStringAsync(path);
        } catch (e) { return null; }
    },
    setItem: async (key: string, value: string): Promise<void> => {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
            return;
        }
        try {
            const { documentDirectory, writeAsStringAsync } = (await import('expo-file-system/legacy')) as any;
            const path = `${documentDirectory}${key}.json`;
            await writeAsStringAsync(path, value);
        } catch (e) { /* ignore */ }
    },
    deleteItem: async (key: string): Promise<void> => {
        if (Platform.OS === 'web') {
            localStorage.removeItem(key);
            return;
        }
        try {
            const { documentDirectory, getInfoAsync, deleteAsync } = (await import('expo-file-system/legacy')) as any;
            const path = `${documentDirectory}${key}.json`;
            const info = await getInfoAsync(path);
            if (info.exists) await deleteAsync(path);
        } catch (e) { /* ignore */ }
    },
};

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    isLoading: true,
    theme: 'system',

    login: async (user, token) => {
        set({ user, token });
        try {
            await secureStorage.setItem('auth_token', token);
            await standardStorage.setItem('auth_user', JSON.stringify(user));
        } catch (e) {
            if (__DEV__) console.error('Failed to save auth state', e);
        }
    },

    updateUser: async (updatedFields) => {
        const currentUser = get().user;
        if (currentUser) {
            const newUser = { ...currentUser, ...updatedFields };
            set({ user: newUser });
            try {
                await standardStorage.setItem('auth_user', JSON.stringify(newUser));
            } catch (e) {
                if (__DEV__) console.error('Failed to update user', e);
            }
        }
    },

    logout: async () => {
        set({ user: null, token: null });
        try {
            await secureStorage.deleteItem('auth_token');
            await standardStorage.deleteItem('auth_user');
        } catch (e) {
            if (__DEV__) console.error('Failed to clear auth state', e);
        }
    },

    hydrate: async () => {
        try {
            const token = await secureStorage.getItem('auth_token');
            let userStr = await standardStorage.getItem('auth_user');
            
            // Migration check: If user not in standardStorage, check secureStorage
            if (token && !userStr) {
                userStr = await secureStorage.getItem('auth_user');
                if (userStr) {
                    await standardStorage.setItem('auth_user', userStr);
                    await secureStorage.deleteItem('auth_user');
                }
            }

            let themeStr = await standardStorage.getItem('app_theme') as 'light' | 'dark' | 'system' | null;
            if (!themeStr) {
                 themeStr = await secureStorage.getItem('app_theme') as any;
                 if (themeStr) {
                     await standardStorage.setItem('app_theme', themeStr);
                     await secureStorage.deleteItem('app_theme');
                 }
            }

            if (token && userStr) {
                // Optimistically set user from cache for instant UI
                set({ token, user: JSON.parse(userStr), theme: themeStr || 'system', isLoading: false });

                // C5: Validate token in background — if expired, force logout
                try {
                    const { api } = await import('../lib/api');
                    const response = await api.get('me');
                    if (response.data) {
                        const refreshedUser = response.data.user || response.data;
                        const currentUser = get().user;
                        const mergedUser = { ...currentUser, ...refreshedUser };
                        set({ user: mergedUser });
                        await standardStorage.setItem('auth_user', JSON.stringify(mergedUser));
                    }
                } catch (validateError: any) {
                    if (validateError?.response?.status === 401) {
                        // Token is expired/revoked — clear silently
                        set({ user: null, token: null });
                        await secureStorage.deleteItem('auth_token');
                        await standardStorage.deleteItem('auth_user');
                    }
                    // Network errors are ignored — user keeps cached data
                }
            } else {
                set({ theme: themeStr || 'system', isLoading: false });
            }
        } catch (e) {
            if (__DEV__) console.error('Failed to hydrate auth state', e);
            set({ isLoading: false });
        }
    },

    checkAuth: async () => {
        try {
            // Import api dynamically to avoid circular dependency
            const { api } = await import('../lib/api');
            const response = await api.get('me');
            if (response.data) {
                const refreshedUser = response.data.user || response.data;
                const currentUser = get().user;
                const newUser = { ...currentUser, ...refreshedUser };
                set({ user: newUser });
                await standardStorage.setItem('auth_user', JSON.stringify(newUser));
            }
        } catch (e) {
            if (__DEV__) console.error('Failed to refresh auth state', e);
        }
    },

    setTheme: async (theme) => {
        set({ theme });
        try {
            await standardStorage.setItem('app_theme', theme);
        } catch (e) {
            if (__DEV__) console.error('Failed to save theme state', e);
        }
    },
}));
