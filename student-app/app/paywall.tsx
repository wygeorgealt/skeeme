import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { router, useLocalSearchParams } from 'expo-router';
import RevenueCatUI from 'react-native-purchases-ui';
import { posthog } from '@/lib/posthog';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CloseCircle } from '@solar-icons/react-native/Bold';
import { Text } from '@/components/ui/Text';

export default function PaywallScreen() {
    const { user, checkAuth } = useAuthStore();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();
    const fromOnboarding = params.fromOnboarding === 'true';

    const [closeAllowed, setCloseAllowed] = useState(!fromOnboarding);
    const [secondsLeft, setSecondsLeft] = useState(fromOnboarding ? 5 : 0);

    useEffect(() => {
        // If already subscribed and coming from onboarding, skip paywall
        if (fromOnboarding && user && user.plan_name !== 'free') {
            router.replace('/(drawer)');
        }
    }, [user, fromOnboarding]);

    useEffect(() => {
        if (!fromOnboarding) return;

        setCloseAllowed(false);
        setSecondsLeft(5);

        const start = Date.now();
        const totalMs = 5000;

        const interval = setInterval(() => {
            const elapsed = Date.now() - start;
            const remainingMs = Math.max(0, totalMs - elapsed);
            const remainingSec = Math.ceil(remainingMs / 1000);
            setSecondsLeft(remainingSec);
            if (remainingMs <= 0) {
                setCloseAllowed(true);
                clearInterval(interval);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [fromOnboarding]);

    const handleClose = () => {
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
        handleClose();
    };

    const handleRestoreCompleted = async () => {
        await checkAuth();
        handleClose();
    };

    const onDismiss = useMemo(() => {
        // Prevent early dismiss while we force the 5s wait.
        if (!fromOnboarding) return handleClose;
        return closeAllowed ? handleClose : undefined;
    }, [closeAllowed, fromOnboarding]);

    return (
        <View style={s.container}>
            <RevenueCatUI.Paywall
                style={s.paywall}
                onPurchaseCompleted={handlePurchaseCompleted}
                onRestoreCompleted={handleRestoreCompleted}
                onDismiss={onDismiss}
            />

            {/* Custom Close Button overlaid on top to guarantee visibility */}
            {!fromOnboarding || closeAllowed ? (
                <TouchableOpacity
                    style={[s.closeBtn, { top: Math.max(insets.top, 20) + 10 }]}
                    onPress={handleClose}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <CloseCircle size={24} color="#000000" />
                </TouchableOpacity>
            ) : (
                <View
                    style={[
                        s.waitingIndicator,
                        { top: Math.max(insets.top, 20) + 10, right: 20 },
                    ]}
                    pointerEvents="none"
                >
                    <ActivityIndicator size="small" color="#000000" />
                    <Text style={s.waitingText}>{secondsLeft}s</Text>
                </View>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    paywall: { flex: 1 },
    closeBtn: {
        position: 'absolute',
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    waitingIndicator: {
        position: 'absolute',
        width: 90,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    waitingText: {
        fontWeight: '800',
        fontSize: 12,
        color: '#000000',
    }
});
