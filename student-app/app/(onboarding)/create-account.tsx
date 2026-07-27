import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, useColorScheme, Platform, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { SafeAreaView,  useSafeAreaInsets  } from 'react-native-safe-area-context';
import { GoogleIcon, AppleIcon } from '@/components/ui/BrandIcons';

export default function CreateAccountScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { setOnboardingStep } = useAuthStore();

    useEffect(() => {
        setOnboardingStep(6);
    }, []);

    const textColor = isDark ? '#FFFFFF' : '#000000';
    const subtextColor = isDark ? '#8E8E93' : '#6E6E73';
    const btnAppleBg = isDark ? '#FFFFFF' : '#000000';
    const btnAppleText = isDark ? '#000000' : '#FFFFFF';

    return (
        <View style={{ flex: 1 }}>
            <SafeAreaView style={s.container}>
                <ScrollView 
                    contentContainerStyle={[s.content, { paddingTop: Math.max(insets.top, 40) }]} 
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                >
                    
                    <View style={s.topSpacer} />

                    <Animated.View entering={FadeInDown.duration(600).delay(100)} style={s.headerSection}>
                        <Text style={[s.heroTitle, { color: textColor }]}>
                            Create Account
                        </Text>
                        <Text style={[s.heroSubtitle, { color: subtextColor }]}>
                            Save your progress and dive straight into smarter learning.
                        </Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.duration(600).delay(300)} style={s.actionSection}>
                        
                        {Platform.OS === 'ios' && (
                            <TouchableOpacity
                                onPress={() => {}}
                                activeOpacity={0.8}
                                style={[s.socialBtn, { backgroundColor: btnAppleBg }]}
                            >
                                <AppleIcon width={20} height={20} color={btnAppleText} />
                                <Text style={[s.socialBtnText, { color: btnAppleText }]}>Continue with Apple</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={() => {}}
                            activeOpacity={0.8}
                            style={[s.socialBtn, isDark ? s.googleDark : s.googleLight]}
                        >
                            <GoogleIcon width={20} height={20} />
                            <Text style={[s.socialBtnText, { color: textColor }]}>Continue with Google</Text>
                        </TouchableOpacity>

                        <View style={s.dividerRow}>
                            <View style={[s.dividerLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} />
                            <Text style={[s.dividerText, { color: subtextColor }]}>OR</Text>
                            <View style={[s.dividerLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} />
                        </View>

                        <TouchableOpacity
                            onPress={() => router.push('/signup?from=onboarding')}
                            activeOpacity={0.8}
                            style={s.emailBtn}
                        >
                            <Text style={s.emailBtnText}>Sign Up with Email</Text>
                        </TouchableOpacity>

                    </Animated.View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
    topSpacer: { height: 40 },
    
    headerSection: { alignItems: 'center', marginBottom: 48 },
    heroTitle: { fontSize: 34, fontWeight: '800', letterSpacing: -1, marginBottom: 16, textAlign: 'center' },
    heroSubtitle: { fontSize: 17, fontWeight: '500', lineHeight: 24, textAlign: 'center', paddingHorizontal: 16, opacity: 0.8 },
    
    actionSection: { width: '100%', gap: 16 },
    
    socialBtn: { 
        height: 56, 
        borderRadius: 100, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    googleLight: { 
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    googleDark: { 
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    socialBtnText: { fontWeight: '700', fontSize: 17, marginLeft: 12, letterSpacing: -0.41 },
    
    dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
    dividerLine: { flex: 1, height: 1 },
    dividerText: { paddingHorizontal: 16, fontWeight: '600', fontSize: 13, opacity: 0.5 },
    
    emailBtn: { 
        height: 56, 
        backgroundColor: '#007AFF', 
        borderRadius: 100, 
        alignItems: 'center', 
        justifyContent: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    emailBtnText: { color: 'white', fontWeight: '700', fontSize: 17, letterSpacing: -0.41 },
});
