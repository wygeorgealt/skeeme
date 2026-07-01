import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { Plain, Plain3 } from '@solar-icons/react-native/Bold'; // Using placeholders for the AI icons
import { useAuthStore } from '@/store/authStore';

export type ProviderType = 'deepseek' | 'anthropic';

interface ModelSwitcherProps {
    selected: ProviderType;
    onSelect: (provider: ProviderType) => void;
    isDark: boolean;
}

export function ModelSwitcher({ selected, onSelect, isDark }: ModelSwitcherProps) {
    const C = Colors[isDark ? 'dark' : 'light'];
    const { user, toggleCreditsModal } = useAuthStore();
    
    const isPro = (user?.plan_name ?? 'free') !== 'free';

    const handleSelect = (provider: ProviderType) => {
        if (provider === 'anthropic' && !isPro) {
            toggleCreditsModal(true, 'scan');
            return;
        }
        onSelect(provider);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Plain3 size={20} color={isDark ? '#f8fafc' : '#0f172a'} />
                    <Text style={[styles.title, { color: isDark ? '#f8fafc' : '#0f172a' }]}>AI Assistant</Text>
                </View>
                {!isPro && (
                    <TouchableOpacity 
                        style={styles.plusBadge}
                        onPress={() => toggleCreditsModal(true, 'scan')}
                    >
                        <Text style={styles.plusText}>PLUS {'>'}</Text>
                    </TouchableOpacity>
                )}
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
                    <Plain size={18} color="#FF4B4B" />
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
                    <Plain3 size={18} color="#8B5CF6" />
                    <Text style={[
                        styles.tabText, 
                        { color: isDark ? '#f8fafc' : '#0f172a' },
                        selected === 'anthropic' && { fontWeight: '700' }
                    ]}>Skeeme AI</Text>
                    
                    {!isPro && (
                        <View style={styles.proLock}>
                            <Text style={styles.proLockText}>PRO</Text>
                        </View>
                    )}
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
    plusBadge: {
        backgroundColor: '#F59E0B',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    plusText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
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
    },
    proLock: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    proLockText: {
        color: 'white',
        fontSize: 9,
        fontWeight: '800',
    }
});
