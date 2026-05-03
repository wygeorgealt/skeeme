import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { posthog } from '@/lib/posthog';

export default function PaywallScreen() {
    const { user, checkAuth } = useAuthStore();

    useEffect(() => {
        // If already subscribed, go straight to the app
        if (user && user.plan_name !== 'free') {
            router.replace('/(drawer)');
            return;
        }
        showPaywall();
    }, []);

    const showPaywall = async () => {
        try {
            const result = await RevenueCatUI.presentPaywall({ displayCloseButton: true });

            if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
                if (result === PAYWALL_RESULT.PURCHASED) {
                    posthog.capture('subscription_purchased');
                }
                // They subscribed — refresh auth to get updated plan
                await checkAuth();
            }
        } catch (e) {
            // Ignore errors silently
        }

        // Whether they subscribed, dismissed, or errored — always go to the app.
        // Free users get 100 credits and full access to the free tier.
        router.replace('/(drawer)');
    };

    // Show a simple loading spinner while the RevenueCat paywall is presenting
    return (
        <View style={s.container}>
            <ActivityIndicator size="large" color="#7C3AED" />
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
});
