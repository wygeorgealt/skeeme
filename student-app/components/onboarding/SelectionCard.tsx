import React from 'react';
import { View, TouchableOpacity, useColorScheme, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import CheckCircle from '@/assets/icons/pikaicons/check-tick-circle.svg';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import { Colors } from '@/constants/theme';

interface SelectionCardProps {
    iconSource: any;
    label: string;
    desc?: string;
    isSelected: boolean;
    onPress: () => void;
    index?: number;
    /** Icon size inside the icon box */
    iconSize?: number;
}

export function SelectionCard({
    iconSource,
    label,
    desc,
    isSelected,
    onPress,
    index = 0,
    iconSize = 26,
}: SelectionCardProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    return (
        <Animated.View entering={FadeInDown.duration(500).delay(100 + index * 60).springify()}>
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.75}
                style={[
                    s.card,
                    isDark ? s.cardDark : s.cardLight,
                    isSelected && [s.cardSelected, isDark ? s.cardSelectedDark : s.cardSelectedLight],
                ]}
            >
                {/* Icon */}
                <View style={[
                    s.iconBox,
                    isSelected
                        ? { backgroundColor: isDark ? 'rgba(0,122,255,0.15)' : 'rgba(0,122,255,0.08)' }
                        : { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F2F4F8' },
                ]}>
                    <AnimatedIcon source={iconSource} size={iconSize} animationType="pop" />
                </View>

                {/* Text */}
                <View style={s.textWrap}>
                    <Text style={[s.label, { color: C.text }]}>{label}</Text>
                    {desc ? (
                        <Text style={[s.desc, { color: C.textSecondary }]}>{desc}</Text>
                    ) : null}
                </View>

                {/* Check indicator */}
                {isSelected ? (
                    <View style={s.checkWrap}>
                        <CheckCircle width={22} height={22} color="#007AFF" />
                    </View>
                ) : (
                    <View style={[
                        s.radioEmpty,
                        { borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)' },
                    ]} />
                )}
            </TouchableOpacity>
        </Animated.View>
    );
}

const s = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: 'transparent',
        marginBottom: 10,
    },
    cardLight: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    cardDark: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderColor: 'rgba(255,255,255,0.08)',
    },
    cardSelected: {
        borderWidth: 2,
    },
    cardSelectedLight: {
        borderColor: '#007AFF',
        backgroundColor: 'rgba(0,122,255,0.03)',
        shadowOpacity: 0.08,
    },
    cardSelectedDark: {
        borderColor: '#007AFF',
        backgroundColor: 'rgba(0,122,255,0.08)',
    },

    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    textWrap: {
        flex: 1,
        justifyContent: 'center',
    },
    label: {
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
    desc: {
        fontSize: 13,
        fontWeight: '500',
        lineHeight: 18,
        marginTop: 2,
    },

    checkWrap: {
        marginLeft: 8,
    },
    radioEmpty: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1.5,
        marginLeft: 8,
    },
});
