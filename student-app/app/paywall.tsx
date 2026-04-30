import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Text } from '@/components/ui/Text';
import RevenueCatUI from 'react-native-purchases-ui';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { CircleArrowUp02Icon, Logout01Icon } from '@hugeicons/core-free-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PaywallScreen() {
    const { user, checkAuth, logout } = useAuthStore();
    const insets = useSafeAreaInsets();
    const isDark = true; // Premium look
    const C = Colors.dark;

    const handleUpgrade = async () => {
        try {
            await RevenueCatUI.presentPaywall();
            await checkAuth();
        } catch (e) {}
    };

    useEffect(() => {
        if (user && user.plan_name !== 'free') {
            router.replace('/(drawer)');
        }
    }, [user]);

    // Automatically show paywall on mount
    useEffect(() => {
        handleUpgrade();
    }, []);

    const handleLogout = async () => {
        await logout();
        router.replace('/(onboarding)/auth-select');
    };

    return (
        <View style={[s.container, { backgroundColor: '#000', paddingTop: insets.top }]}>
            <View style={s.content}>
                <View style={s.iconBox}>
                    <HugeiconsIcon icon={CircleArrowUp02Icon} size={48} color="#8B5CF6" />
                </View>
                <Text style={s.title}>Subscription Required</Text>
                <Text style={s.subtitle}>
                    Choose a plan to unlock all of Skeeme's AI study tools and keep your momentum going.
                </Text>

                <TouchableOpacity onPress={handleUpgrade} style={s.mainBtn}>
                    <Text style={s.mainBtnText}>View Plans</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleLogout} style={s.logoutBtn}>
                    <HugeiconsIcon icon={Logout01Icon} size={18} color="#94a3b8" />
                    <Text style={s.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 32, alignItems: 'center', width: '100%' },
    iconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(139, 92, 246, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
    title: { fontSize: 28, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 16 },
    subtitle: { fontSize: 16, color: '#94a3b8', textAlign: 'center', lineHeight: 24, marginBottom: 48 },
    mainBtn: { backgroundColor: '#8B5CF6', height: 60, borderRadius: 30, width: '100%', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    mainBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
    logoutText: { color: '#94a3b8', fontSize: 15, fontWeight: '600' },
});
