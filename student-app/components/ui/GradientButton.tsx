import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientButtonProps {
    onPress: () => void;
    children: React.ReactNode;
    containerStyle?: string;
    className?: string;
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export function GradientButton({
    onPress,
    children,
    containerStyle = '',
    className = '',
    disabled = false,
    loading = false,
    icon,
    style,
    textStyle
}: GradientButtonProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            className={`overflow-hidden rounded-2xl ${containerStyle} ${disabled ? 'opacity-50' : ''}`}
        >
            <LinearGradient
                colors={['#4f46e5', '#0ea5e9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.gradient, style]}
                className={`flex-row justify-center items-center px-6 ${className}`}
            >
                {loading ? (
                    <ActivityIndicator color="white" size="small" />
                ) : (
                    <>
                        {icon && <React.Fragment>{icon}</React.Fragment>}
                        <Text
                            style={textStyle}
                            className={`text-white font-black text-lg text-center ${icon ? 'ml-2' : ''}`}
                        >
                            {children}
                        </Text>
                    </>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    gradient: {
        width: '100%',
        height: 56, // Match standard input height (py-4 + text-base)
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
