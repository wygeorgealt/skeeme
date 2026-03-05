import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator, View } from 'react-native';

interface GradientButtonProps {
    onPress: () => void;
    children: React.ReactNode;
    containerStyle?: string;
    className?: string; // Kept for backwards compatibility but we'll use solid classes
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

// Renamed internally, but exported as GradientButton to prevent breaking imports across 5+ files
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
            className={`w-full h-[56px] bg-slate-900 dark:bg-white rounded-xl items-center justify-center flex-row shadow-sm ${containerStyle} ${className} ${disabled ? 'opacity-50' : ''}`}
            style={style}
        >
            {loading ? (
                <ActivityIndicator color="#cbd5e1" size="small" />
            ) : (
                <>
                    {icon && (
                        <View style={styles.iconContainer}>
                            {icon}
                        </View>
                    )}
                    <Text
                        style={textStyle}
                        className="text-white dark:text-slate-900 font-bold text-[17px]"
                    >
                        {children}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    iconContainer: {
        position: 'absolute',
        left: 20,
    },
});
