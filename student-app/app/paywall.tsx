import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
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

    useEffect(() => {
        // If already subscribed and coming from onboarding, skip paywall
        if (fromOnboarding && user && user.plan_name !== 'free') {
            router.replace('/(drawer)');
        }
    }, [user, fromOnboarding]);

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

            {/* Floating Buy Credits Button */}
            <TouchableOpacity 
                style={[s.creditsBtn, { top: Math.max(insets.top, 20) + 10 }]}
                onPress={() => router.push('/buy-credits')}
            >
                <Text style={s.creditsBtnText}>Buy Credits Instead</Text>
            </TouchableOpacity>
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
    creditsBtn: {
        position: 'absolute',
        left: 20,
        height: 40,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#8B5CF6',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    creditsBtnText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 14,
    }
});
