import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { router, useLocalSearchParams } from 'expo-router';
import { posthog } from '@/lib/posthog';
import { BlurView } from 'expo-blur';

export default function PaywallScreen() {
    const { user, checkAuth } = useAuthStore();
    const params = useLocalSearchParams();
    const fromOnboarding = params.fromOnboarding === 'true';

    // Dynamic import to avoid errors if Superwall is not installed
    const { isSuperwallEnabled, Paywall } = require('@/lib/monetization');

    useEffect(() => {
        // If already subscribed and coming from onboarding, skip paywall
        if (fromOnboarding && user && user.plan_name !== 'free') {
            router.replace('/(drawer)');
        }
    }, [user, fromOnboarding]);

    const handleNavigation = () => {
        if (fromOnboarding) {
            router.replace('/(drawer)');
        } else if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(drawer)');
        }
    };

    const handlePurchaseCompleted = async () => {
        posthog.capture('subscription_purchased');
        await checkAuth();
        handleNavigation();
    };

    const handleRestoreCompleted = async () => {
        await checkAuth();
        handleNavigation();
    };

    const handleDismiss = () => {
        // User closed the paywall without buying. Fire the win-back discount trigger!
        if (isSuperwallEnabled) {
            try {
                const { SuperwallExpoModule } = require('expo-superwall');
                if (SuperwallExpoModule) {
                    SuperwallExpoModule.registerPlacement('holiday_promo');
                }
            } catch (e) {
                console.warn('[Superwall] Failed to trigger holiday_promo', e);
            }
        }
        handleNavigation();
    };

    return (
        <View style={s.container}>
            {/* Blurred backdrop with loading spinner while Superwall loads */}
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <ActivityIndicator size="large" color="#ffffff" style={s.loader} />

            {/* Superwall renders its native paywall on top of this */}
            <Paywall
                placement={fromOnboarding ? 'onboarding_trigger' : 'upgrade_trigger'}
                style={s.paywall}
                onPurchaseCompleted={handlePurchaseCompleted}
                onRestoreCompleted={handleRestoreCompleted}
                onDismiss={handleDismiss}
            />
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loader: {
        position: 'absolute',
        zIndex: 1,
    },
    paywall: {
        flex: 1,
        width: '100%',
        zIndex: 2,
    },
});

