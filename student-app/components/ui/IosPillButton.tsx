import React from 'react';
import { TouchableOpacity, Text, StyleSheet, useColorScheme, ViewStyle, TextStyle } from 'react-native';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';
import { LoadingSpinner } from '../LoadingSpinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface IosPillButtonProps {
    label: string;
    onPress: () => void;
    variant?: Variant;
    size?: Size;
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    icon?: React.ReactNode;
}

export function IosPillButton({
    label,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    style,
    textStyle,
    icon,
}: IosPillButtonProps) {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];

    const bgByVariant: Record<Variant, string> = {
        primary: C.primary,
        secondary: isDark ? C.cardSecondary : '#E5E5EA',
        ghost: 'transparent',
        destructive: C.destructive,
    };

    const textColorByVariant: Record<Variant, string> = {
        primary: '#FFFFFF',
        secondary: C.text,
        ghost: C.primary,
        destructive: '#FFFFFF',
    };

    const heightBySize: Record<Size, number> = { sm: 36, md: 44, lg: 52 };
    const fontSizeBySize: Record<Size, number> = {
        sm: FontSize.subhead,
        md: FontSize.callout,
        lg: FontSize.headline,
    };
    const hPaddingBySize: Record<Size, number> = { sm: Spacing.md, md: Spacing.lg, lg: Spacing.xl };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.75}
            style={[
                styles.base,
                {
                    backgroundColor: bgByVariant[variant],
                    height: heightBySize[size],
                    paddingHorizontal: hPaddingBySize[size],
                    borderRadius: Radius.pill,
                    opacity: disabled ? 0.4 : 1,
                    alignSelf: fullWidth ? undefined : 'center',
                    width: fullWidth ? '100%' : undefined,
                    borderWidth: variant === 'ghost' ? 1 : 0,
                    borderColor: variant === 'ghost' ? C.primary : undefined,
                },
                style,
            ]}
        >
            {loading ? (
                <LoadingSpinner size={20} color={textColorByVariant[variant]} strokeWidth={3} />
            ) : (
                <>
                    {icon}
                    <Text
                        style={[
                            styles.label,
                            {
                                color: textColorByVariant[variant],
                                fontSize: fontSizeBySize[size],
                                marginLeft: icon ? Spacing.xs : 0,
                            },
                            textStyle,
                        ]}
                    >
                        {label}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontWeight: '600',
        letterSpacing: -0.2,
    },
});
