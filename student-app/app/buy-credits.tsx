import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';
import RevenueCatUI from 'react-native-purchases-ui';
import { posthog } from '@/lib/posthog';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CloseCircle } from '@solar-icons/react-native/Bold';
import { Text } from '@/components/ui/Text';
import { initializeRevenueCat } from '@/lib/revenuecat';

export default function BuyCreditsScreen() {
    const { checkAuth } = useAuthStore();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        // Initialize RevenueCat in background; do not block UI rendering on empty offerings
        (async () => {
            try {
                const { user } = useAuthStore.getState();
                await initializeRevenueCat(user?.id?.toString());
            } catch (e) {
                // ignore — we still render the RevenueCat paywall component which will show helpful debug
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
            <RevenueCatUI.Paywall 
                style={s.paywall}
                onPurchaseCompleted={handlePurchaseCompleted}
                onRestoreCompleted={handleRestoreCompleted}
                onDismiss={handleClose}
            />

            {/* Custom Close Button overlaid on top to guarantee visibility */}
            <TouchableOpacity 
                style={[s.closeBtn, { top: Math.max(insets.top, 20) + 10 }]}
                onPress={handleClose}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
                <CloseCircle size={24} color="#000000" />
            </TouchableOpacity>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    center: { justifyContent: 'center', alignItems: 'center' },
    paywall: { flex: 1 },
    loadingText: { marginTop: 16, color: '#64748b', fontWeight: '500' },
    errorText: { color: '#0f172a', fontWeight: '700', fontSize: 18, marginBottom: 16 },
    closeErrorBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#f1f5f9', borderRadius: 8 },
    closeErrorText: { fontWeight: '700' },
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
    }
});
