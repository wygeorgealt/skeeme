import React from 'react';
import { Text as RNText, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Check } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/theme';
import { ONBOARDING_BLUE, onboardingStyles } from './onboardingStyles';

interface OnboardingCardProps {
    label: string;
    description?: string;
    isSelected: boolean;
    onPress: () => void;
    accessibilityRole?: 'checkbox' | 'radio';
    disabled?: boolean;
}

export function OnboardingCard({
    label,
    description,
    isSelected,
    onPress,
    accessibilityRole = 'radio',
    disabled = false,
}: OnboardingCardProps) {
    const isDark = useColorScheme() === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

    const bg = isSelected
        ? isDark ? '#0D1B30' : '#EDF5FF'
        : isDark ? '#161B22' : '#FFFFFF';

    return (
        <TouchableOpacity
            accessibilityLabel={description ? `${label}. ${description}` : label}
            accessibilityRole={accessibilityRole}
            accessibilityState={{ checked: isSelected, disabled }}
            activeOpacity={disabled ? 1 : 0.75}
            disabled={disabled}
            onPress={onPress}
            style={[
                onboardingStyles.card,
                {
                    backgroundColor: bg,
                    borderColor: isSelected ? ONBOARDING_BLUE : 'transparent',
                    borderWidth: isSelected ? 2 : 0,
                },
                isSelected && onboardingStyles.cardSelected,
            ]}
        >
            <View style={onboardingStyles.cardTextWrap}>
                <RNText style={[onboardingStyles.cardText, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>
                    {label}
                </RNText>
                {description ? (
                    <Text style={[onboardingStyles.cardSub, { color: C.textSecondary }]}>
                        {description}
                    </Text>
                ) : null}
            </View>

            <View
                style={[
                    onboardingStyles.checkCircle,
                    {
                        backgroundColor: isSelected ? ONBOARDING_BLUE : 'transparent',
                        borderColor: isSelected
                            ? ONBOARDING_BLUE
                            : isDark ? '#4B5563' : '#CBD5E1',
                    },
                ]}
            >
                {isSelected ? (
                    <Check color="#FFFFFF" size={13} strokeWidth={3} />
                ) : null}
            </View>
        </TouchableOpacity>
    );
}
