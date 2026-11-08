import React, { useEffect, useState } from 'react';
import { Platform, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { router, useLocalSearchParams } from 'expo-router';
import { posthog } from '@/lib/posthog';
import { BlurView } from 'expo-blur';
import { isSuperwallEnabled } from '@/lib/monetization';

export default function PaywallScreen() {
    const { user, checkAuth } = useAuthStore();
    const params = useLocalSearchParams();
    const fromOnboarding = params.fromOnboarding === 'true';
    const [showDiscount, setShowDiscount] = useState(false);

    // Dynamic import to avoid errors if Superwall is not installed
    const { Paywall } = require('@/lib/monetization');

    useEffect(() => {
        // If already subscribed and coming from onboarding, skip paywall
        if (fromOnboarding && user && user.plan_name !== 'free') {
            router.replace('/(drawer)/(tabs)');
        }
    }, [user, fromOnboarding]);

    const handleNavigation = () => {
        if (fromOnboarding) {
            router.replace('/(drawer)/(tabs)');
        } else if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(drawer)/(tabs)');
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
        if (
            !showDiscount &&
            !fromOnboarding &&
            Platform.OS === 'ios' &&
            isSuperwallEnabled &&
            Math.random() < 0.5
        ) {
            setShowDiscount(true);
            return;
        }

        handleNavigation();
    };

    const placement = showDiscount
        ? 'upgrade_discount_trigger'
        : fromOnboarding
            ? 'onboarding_trigger'
            : 'upgrade_trigger';

    return (
        <View style={s.container}>
            {/* Blurred backdrop with loading spinner while Superwall loads */}
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <ActivityIndicator size="large" color="#ffffff" style={s.loader} />

            {/* Superwall renders its native paywall on top of this */}
            <Paywall
                key={placement}
                placement={placement}
                style={s.paywall}
                onPurchaseCompleted={handlePurchaseCompleted}
                onRestoreCompleted={handleRestoreCompleted}
                onDismiss={handleDismiss}
                onSkip={handleNavigation}
                onError={handleNavigation}
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
