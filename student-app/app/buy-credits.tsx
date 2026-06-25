import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';
import { Paywall, initializeMonetization } from '@/lib/monetization';
import { posthog } from '@/lib/posthog';
import { BlurView } from 'expo-blur';

export default function BuyCreditsScreen() {
    const { checkAuth } = useAuthStore();

    useEffect(() => {
        // Initialize RevenueCat in background; do not block UI rendering on empty offerings
            (async () => {
                try {
                    const { user } = useAuthStore.getState();
                    await initializeMonetization(user?.id?.toString());
                } catch (e) {
                    // ignore — we still render the paywall component which will show helpful debug
                }
            })();
    }, []);

    const handleClose = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(drawer)');
        }
    };

    const handlePurchaseCompleted = async () => {
        posthog.capture('credits_purchased');
        await checkAuth(); // Sync the updated credit balance from the backend
        handleClose();
    };

    const handleRestoreCompleted = async () => {
        await checkAuth();
        handleClose();
    };

    return (
        <View style={s.container}>
            {/* Blurred backdrop with loading spinner while Superwall loads */}
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <ActivityIndicator size="large" color="#ffffff" style={s.loader} />

            {/* Superwall renders its native paywall on top of this */}
            <Paywall
                placement="credits_trigger"
                style={s.paywall}
                onPurchaseCompleted={handlePurchaseCompleted}
                onRestoreCompleted={handleRestoreCompleted}
                onDismiss={handleClose}
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
