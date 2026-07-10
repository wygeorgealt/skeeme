import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
export type ProviderType = 'deepseek' | 'anthropic';

interface ModelSwitcherProps {
    selected: ProviderType;
    onSelect: (provider: ProviderType) => void;
    isDark: boolean;
}

export function ModelSwitcher({ selected, onSelect, isDark }: ModelSwitcherProps) {
    const C = Colors[isDark ? 'dark' : 'light'];
    const { user } = useAuthStore();
    const router = useRouter();
    
    const isPro = (user?.plan_name ?? 'free') !== 'free';

    const handleSelect = (provider: ProviderType) => {
        if (provider === 'anthropic' && !isPro) {
            router.push('/paywall');
            return;
        }
        onSelect(provider);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Image source={require('@/assets/3dicons/3dicons-boy-front-color.png')} style={{ width: 24, height: 24 }} />
                    <Text style={[styles.title, { color: isDark ? '#f8fafc' : '#0f172a' }]}>AI Assistant</Text>
                </View>
            </View>

            <View style={styles.tabsContainer}>
                <TouchableOpacity 
                    activeOpacity={0.7}
                    onPress={() => handleSelect('deepseek')}
                    style={[
                        styles.tab,
                        selected === 'deepseek' && styles.activeTab,
                        selected === 'deepseek' && { borderColor: C.primary }
                    ]}
                >
                    <Image source={require('@/assets/3dicons/3dicons-flash-front-color.png')} style={{ width: 20, height: 20 }} />
                    <Text style={[
                        styles.tabText, 
                        { color: isDark ? '#f8fafc' : '#0f172a' },
                        selected === 'deepseek' && { fontWeight: '700' }
                    ]}>Deepseek</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    activeOpacity={0.7}
                    onPress={() => handleSelect('anthropic')}
                    style={[
                        styles.tab,
                        selected === 'anthropic' && styles.activeTab,
                        selected === 'anthropic' && { borderColor: C.primary },
                        !isPro && { opacity: 0.8 } // Hint that it might be premium
                    ]}
                >
                    <Image source={require('@/assets/3dicons/3dicons-boy-front-color.png')} style={{ width: 20, height: 20 }} />
                    <Text style={[
                        styles.tabText, 
                        { color: isDark ? '#f8fafc' : '#0f172a' },
                        selected === 'anthropic' && { fontWeight: '700' }
                    ]}>Skeeme AI</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
    },
    tabsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        backgroundColor: 'rgba(150, 150, 150, 0.08)',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    activeTab: {
        backgroundColor: 'transparent',
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
    }
});
