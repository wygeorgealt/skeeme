import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system/legacy';

import { User, PricingConfig } from '@/types';
import { posthog } from '@/lib/posthog';

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
    pricingConfig: PricingConfig | null;
    fetchPricingConfig: () => Promise<void>;
    // Onboarding
    onboardingStep: number;
    onboardingData: Record<string, any>;
    storedEmail: string | null;
    onboardingComplete: boolean;
    onboardingJustCompleted: boolean;
    setOnboardingStep: (step: number) => Promise<void>;
    setOnboardingData: (data: Record<string, any>) => Promise<void>;
    completeOnboarding: () => Promise<void>;
    clearOnboardingJustCompleted: () => void;
    devReset: () => Promise<void>;
    // Credits Modal
    showCreditsModal: boolean;
    creditsModalFeature: 'scan' | 'quiz' | 'flashcard' | null;
    // Only show the credits modal once per app session unless forced
    creditsModalShownThisSession: boolean;
    toggleCreditsModal: (show: boolean, feature?: 'scan' | 'quiz' | 'flashcard' | null, force?: boolean) => void;
    // Cooldown Modal
    showCooldownModal: boolean;
    toggleCooldownModal: (show: boolean) => void;
    // Streak Reward Modal
    showStreakRewardModal: boolean;
    streakRewardData: any;
    toggleStreakRewardModal: (show: boolean, data?: any) => void;
    // Haptics
    hapticsEnabled: boolean;
    setHapticsEnabled: (enabled: boolean) => Promise<void>;
    // Global Error
    globalError: string | null;
    setGlobalError: (error: string | null) => void;
    notificationsEnabled: boolean;
    setNotificationsEnabled: (enabled: boolean) => Promise<void>;
    // App Reviews
    shouldAskForReview: boolean;
    setShouldAskForReview: (ask: boolean) => void;
    showEnjoyReviewModal: boolean;
    toggleEnjoyReviewModal: (show: boolean) => void;
}

// P4: Static imports — the old code did `await import('expo-secure-store')` on
// every call, creating microtask overhead that compounds during hydration (10+ calls).
const secureStorage = {
    getItem: async (key: string): Promise<string | null> => {
        if (Platform.OS === 'web') return localStorage.getItem(key);
        return SecureStore.getItemAsync(key);
    },
    setItem: async (key: string, value: string): Promise<void> => {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
            return;
        }
        await SecureStore.setItemAsync(key, value);
    },
    deleteItem: async (key: string): Promise<void> => {
        if (Platform.OS === 'web') {
            localStorage.removeItem(key);
            return;
        }
        await SecureStore.deleteItemAsync(key);
    },
};

const standardStorage = {
    getItem: async (key: string): Promise<string | null> => {
        if (Platform.OS === 'web') return localStorage.getItem(key);
        try {
            const path = `${FileSystem.documentDirectory}${key}.json`;
            const info = await FileSystem.getInfoAsync(path);
            if (!info.exists) return null;
            return await FileSystem.readAsStringAsync(path);
        } catch (e) { return null; }
    },
    setItem: async (key: string, value: string): Promise<void> => {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
            return;
        }
        try {
            const path = `${FileSystem.documentDirectory}${key}.json`;
            await FileSystem.writeAsStringAsync(path, value);
        } catch (e) { /* ignore */ }
    },
    deleteItem: async (key: string): Promise<void> => {
        if (Platform.OS === 'web') {
            localStorage.removeItem(key);
            return;
        }
        try {
            const path = `${FileSystem.documentDirectory}${key}.json`;
            const info = await FileSystem.getInfoAsync(path);
            if (info.exists) await FileSystem.deleteAsync(path);
        } catch (e) { /* ignore */ }
    },
};

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    isLoading: true,
    theme: 'system',
    pricingConfig: null,
    onboardingStep: 0,
    onboardingData: {},
    storedEmail: null,
    onboardingComplete: false,
    onboardingJustCompleted: false,
    showCreditsModal: false,
    creditsModalFeature: null,
    creditsModalShownThisSession: false,
    showCooldownModal: false,
    showStreakRewardModal: false,
    streakRewardData: null,
    hapticsEnabled: true,
    globalError: null,
    notificationsEnabled: true,
    shouldAskForReview: false,
    showEnjoyReviewModal: false,

    setGlobalError: (error) => set({ globalError: error }),
    setShouldAskForReview: (ask) => set({ shouldAskForReview: ask }),
    toggleEnjoyReviewModal: (show) => set({ showEnjoyReviewModal: show }),

    fetchPricingConfig: async () => {
        try {
            const { api } = await import('@/lib/api');
            const response = await api.get('system/pricing');
            set({ pricingConfig: response.data });
        } catch (e) {
            if (__DEV__) console.error('Failed to fetch pricing config', e);
        }
    },

    setOnboardingStep: async (step) => {
        set({ onboardingStep: step });
        try {
            await standardStorage.setItem('onboarding_step', String(step));
        } catch (e) {}
    },

    toggleCreditsModal: (show, feature, force) => {
        // P1: Show the modal immediately — never block the UI with a network call.
        // The old version did `await apiStandard.get('me')` here which froze the UI
        // for the entire server roundtrip before the modal appeared.
        const alreadyShown = get().creditsModalShownThisSession;
        if (show) {
            if (alreadyShown && !force) return;
            set({ showCreditsModal: true, creditsModalFeature: feature || null, creditsModalShownThisSession: true });

            // Background refresh: silently check if credits were topped up.
            // If they were, auto-dismiss the modal without blocking.
            import('../lib/api').then(({ apiStandard }) => {
                apiStandard.get('me').then((latest: any) => {
                    if (latest) {
                        const currentUser = get().user || {};
                        const merged = { ...currentUser, ...latest } as any;
                        set({ user: merged });

                        const currentCredits = merged.credits ?? 0;
                        const isUnlimited = (merged.plan_name ?? 'free') !== 'free';
                        if (!isUnlimited && currentCredits > 0 && !force) {
                            // They have credits now — auto-dismiss
                            set({ showCreditsModal: false, creditsModalFeature: null });
                        }
                    }
                }).catch(() => { /* ignore — modal stays visible */ });
            }).catch(() => {});
            return;
        }

        // Always allow dismissal
        set({ showCreditsModal: false, creditsModalFeature: null });
    },

    toggleCooldownModal: (show) => {
        set({ showCooldownModal: show });
    },

    toggleStreakRewardModal: (show, data) => {
        set({ showStreakRewardModal: show, streakRewardData: data || null });
    },

    setOnboardingData: async (data) => {
        const current = get().onboardingData;
        const merged = { ...current, ...data };
        set({ onboardingData: merged });
        try {
            await standardStorage.setItem('onboarding_data', JSON.stringify(merged));
        } catch (e) {}
    },

    completeOnboarding: async () => {
        set({ onboardingComplete: true, onboardingJustCompleted: true, onboardingStep: 0 });
        try {
            await standardStorage.setItem('onboarding_complete', 'true');
            await standardStorage.deleteItem('onboarding_step');
            await standardStorage.deleteItem('onboarding_data');
        } catch (e) {}
    },

    clearOnboardingJustCompleted: () => {
        set({ onboardingJustCompleted: false });
    },

    setHapticsEnabled: async (enabled: boolean) => {
        set({ hapticsEnabled: enabled });
        try {
            await standardStorage.setItem('haptics_enabled', String(enabled));
        } catch (e) {}
    },

    setNotificationsEnabled: async (enabled: boolean) => {
        set({ notificationsEnabled: enabled });
        try {
            await standardStorage.setItem('notifications_enabled', String(enabled));
        } catch (e) {}
    },

    devReset: async () => {
        set({
            user: null,
            token: null,
            onboardingComplete: false,
            onboardingStep: 0,
            onboardingData: {},
            storedEmail: null,
        });
        try {
            await standardStorage.deleteItem('onboarding_complete');
            await standardStorage.deleteItem('onboarding_step');
            await standardStorage.deleteItem('onboarding_data');
            await standardStorage.deleteItem('stored_email');
            await standardStorage.deleteItem('auth_user');
            await secureStorage.deleteItem('auth_token');
        } catch (e) {}
    },

    login: async (user, token) => {
        // Keep onboardingComplete until the onboarding flow explicitly finishes.
        // Hydration/guards will read persisted flags once available.
        set({ user, token, onboardingComplete: false });
        try {
            await standardStorage.setItem('onboarding_complete', 'true');
            await secureStorage.setItem('auth_token', token);
            await standardStorage.setItem('auth_user', JSON.stringify(user));
            try {
                posthog.identify(String(user.id), {
                    email: user.email,
                    name: user.name,
                });
            } catch (e) { /* ignore */ }
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
            try { posthog.reset(); } catch (e) { /* ignore */ }
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
                const haptics = await standardStorage.getItem('haptics_enabled');
                const user = JSON.parse(userStr);
                // Optimistically set user from cache for instant UI
                // Important: do NOT assume onboarding is complete just because we have a cached session.
                // Hydrate onboarding state from persisted onboarding flags so signup → onboarding flow is preserved.
                const obComplete = await standardStorage.getItem('onboarding_complete');
                const obStep = await standardStorage.getItem('onboarding_step');
                const obData = await standardStorage.getItem('onboarding_data');

                set({
                    token,
                    user,
                    theme: themeStr || 'system',
                    hapticsEnabled: haptics === null ? true : haptics === 'true',
                    notificationsEnabled: (await standardStorage.getItem('notifications_enabled')) !== 'false',
                    onboardingComplete: obComplete === 'true',
                    onboardingStep: obStep ? parseInt(obStep, 10) : 0,
                    onboardingData: obData ? JSON.parse(obData) : {},
                    isLoading: false,
                });

                try {
                    posthog.identify(String(user.id), {
                        email: user.email,
                        name: user.name,
                    });
                } catch (e) { /* ignore */ }

                // C5: Validate token in background — if expired, force logout
                try {
                    const { apiStandard } = await import('../lib/api');
                    const data = await apiStandard.get('me');
                    if (data) {
                        const refreshedUser = data.user || data;
                        const currentUser = get().user;
                        const mergedUser = { ...currentUser, ...refreshedUser };
                        set({ user: mergedUser });
                        await standardStorage.setItem('auth_user', JSON.stringify(mergedUser));
                    }
                } catch (validateError: any) {
                    if (validateError?.response?.status === 401) {
                        // Token is expired/revoked — save email for pre-fill, clear session
                        const cachedUser = get().user;
                        if (cachedUser?.email) {
                            set({ storedEmail: cachedUser.email });
                            await standardStorage.setItem('stored_email', cachedUser.email);
                        }
                        set({ user: null, token: null });
                        await secureStorage.deleteItem('auth_token');
                        await standardStorage.deleteItem('auth_user');
                        try { posthog.reset(); } catch (e) { /* ignore */ }
                    }
                    // Network errors are ignored — user keeps cached data
                }
            } else {
                // No session — check onboarding state
                const obComplete = await standardStorage.getItem('onboarding_complete');
                const obStep = await standardStorage.getItem('onboarding_step');
                const obData = await standardStorage.getItem('onboarding_data');
                const savedEmail = await standardStorage.getItem('stored_email');
                const haptics = await standardStorage.getItem('haptics_enabled');
 
                set({
                    theme: themeStr || 'system',
                    hapticsEnabled: haptics === null ? true : haptics === 'true',
                    notificationsEnabled: (await standardStorage.getItem('notifications_enabled')) !== 'false',
                    onboardingComplete: obComplete === 'true',
                    onboardingStep: obStep ? parseInt(obStep, 10) : 0,
                    onboardingData: obData ? JSON.parse(obData) : {},
                    storedEmail: savedEmail || null,
                    isLoading: false,
                });
            }
        } catch (e) {
            if (__DEV__) console.error('Failed to hydrate auth state', e);
            set({ isLoading: false });
        }
    },

    checkAuth: async () => {
            try {
                // Import api dynamically to avoid circular dependency
                const { apiStandard } = await import('../lib/api');
                const data = await apiStandard.get('me');
                if (data) {
                    const refreshedUser = data.user || data;
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
