import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, useColorScheme, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as Notifications from 'expo-notifications';

const REASONS = [
    { icon: 'trophy.fill' as const, text: 'Approaching a credit reward milestone' },
    { icon: 'flame.fill' as const, text: 'Keep your study streak alive' },
    { icon: 'exclamationmark.triangle.fill' as const, text: 'Credits running low warning' },
];

export default function NotificationsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { setOnboardingStep, completeOnboarding } = useAuthStore();

    useEffect(() => {
        setOnboardingStep(7);
    }, []);

    const handleEnable = async () => {
        try {
            const { status } = await Notifications.requestPermissionsAsync();
            if (__DEV__) console.log('[Onboarding] Notification permission:', status);
        } catch (e) {
            if (__DEV__) console.error('[Onboarding] Failed to request notifications', e);
        }
        await completeOnboarding();
        router.replace('/(drawer)');
    };

    const handleSkip = async () => {
        await completeOnboarding();
        router.replace('/(drawer)');
    };

    const bgColor = isDark ? '#000000' : '#F2F2F7';
    const cardColor = isDark ? '#1C1C1E' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#000000';
    const subtextColor = isDark ? '#8E8E93' : '#8E8E93';
    const iconColor = '#007AFF';
    const separatorColor = isDark ? '#38383A' : '#C6C6C8';

    return (
        <SafeAreaView style={[s.container, { backgroundColor: bgColor }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <View style={s.content}>
                
                <Animated.View entering={FadeInDown.duration(600).delay(100)} style={s.headerSection}>
                    <View style={s.bellCircle}>
                        <IconSymbol name="bell.fill" size={40} color="#FFFFFF" />
                    </View>

                    <Text style={[s.heroTitle, { color: textColor }]}>
                        Stay on Track
                    </Text>
                    <Text style={[s.heroSubtitle, { color: subtextColor }]}>
                        Skeeme works best when it can remind you to keep studying.
                    </Text>
                </Animated.View>

                {/* Benefits List */}
                <Animated.View entering={FadeInDown.duration(600).delay(300)} style={[s.listContainer, { backgroundColor: cardColor }]}>
                    {REASONS.map((reason, index) => {
                        const isLast = index === REASONS.length - 1;
                        return (
                            <View key={index} style={[s.listItem, !isLast && { borderBottomColor: separatorColor, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                                <View style={[s.iconBox, { backgroundColor: isDark ? '#2C2C2E' : '#E8F0FE' }]}>
                                    <IconSymbol name={reason.icon as any} size={22} color={iconColor} />
                                </View>
                                <Text style={[s.reasonText, { color: textColor }]}>{reason.text}</Text>
                            </View>
                        );
                    })}
                </Animated.View>

            </View>

            {/* Bottom Actions */}
            <Animated.View entering={FadeInUp.duration(600).delay(500)} style={s.footer}>
                <TouchableOpacity
                    onPress={handleEnable}
                    activeOpacity={0.8}
                    style={s.primaryBtn}
                >
                    <Text style={s.primaryBtnText}>Enable Notifications</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleSkip}
                    activeOpacity={0.7}
                    style={s.skipBtn}
                >
                    <Text style={s.skipBtnText}>Not Now</Text>
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, paddingHorizontal: 20, paddingTop: 40 },
    
    headerSection: { alignItems: 'center', marginBottom: 40 },
    bellCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center', marginBottom: 24, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
    heroTitle: { fontSize: 34, fontWeight: '800', letterSpacing: 0.41, marginBottom: 12, textAlign: 'center' },
    heroSubtitle: { fontSize: 17, fontWeight: '400', lineHeight: 22, textAlign: 'center', paddingHorizontal: 16 },
    
    listContainer: { borderRadius: 10, overflow: 'hidden' },
    listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingRight: 16, marginLeft: 16 },
    iconBox: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    reasonText: { flex: 1, fontSize: 17, fontWeight: '500' },
    
    footer: { paddingHorizontal: 20, paddingBottom: 24 },
    primaryBtn: { backgroundColor: '#007AFF', height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    primaryBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600', letterSpacing: -0.41 },
    skipBtn: { height: 50, alignItems: 'center', justifyContent: 'center' },
    skipBtnText: { color: '#007AFF', fontSize: 17, fontWeight: '500' },
});
