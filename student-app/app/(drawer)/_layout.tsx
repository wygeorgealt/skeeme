import { Stack, router, usePathname } from 'expo-router';
import { AppState, type AppStateStatus } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { registerForPushNotificationsAsync } from '@/lib/notifications';
import ClaimRewardModal from '@/components/ClaimRewardModal';

export const unstable_settings = {
    initialRouteName: '(tabs)',
};

export default function DrawerLayout() {
    const user = useAuthStore((s) => s.user);
    const token = useAuthStore((s) => s.token);
    const onboardingComplete = useAuthStore((s) => s.onboardingComplete);
    const onboardingJustCompleted = useAuthStore((s) => s.onboardingJustCompleted);
    const clearOnboardingJustCompleted = useAuthStore((s) => s.clearOnboardingJustCompleted);
    const pathname = usePathname();
    const [pendingReward, setPendingReward] = useState<{ total: number } | null>(null);

    useEffect(() => {
        if (!onboardingJustCompleted) return;

        const timer = setTimeout(clearOnboardingJustCompleted, 2000);
        return () => clearTimeout(timer);
    }, [onboardingJustCompleted, clearOnboardingJustCompleted]);

    useEffect(() => {
        const handleAppState = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                useAuthStore.getState().checkAuth().catch(() => {});
            }
        };

        const subscription = AppState.addEventListener('change', handleAppState);
        return () => subscription.remove();
    }, []);

    useEffect(() => {
        if (
            token &&
            user &&
            onboardingComplete &&
            !onboardingJustCompleted &&
            (!user.ai_preferences || !user.ai_preferences.tone) &&
            !String(pathname || '').startsWith('/(onboarding)')
        ) {
            if (pathname !== '/(drawer)/preferences') {
                router.replace('/(drawer)/preferences');
            }
        }
    }, [token, user, pathname, onboardingComplete, onboardingJustCompleted]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (token) {
                registerForPushNotificationsAsync(token).catch(() => {});
                api.get('referral/pending-rewards').then((res) => {
                    if (res.data.total > 0) setPendingReward({ total: res.data.total });
                }).catch(() => {});
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [token]);

    return (
        <>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
            <ClaimRewardModal
                visible={pendingReward !== null}
                total={pendingReward?.total || 0}
                onClaim={() => setPendingReward(null)}
            />
        </>
    );
}
