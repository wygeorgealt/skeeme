import { Text } from '@/components/ui/Text';
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, useColorScheme, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '@/constants/theme';
import { Eye, EyeClosed } from '@solar-icons/react-native/Bold';

interface PasswordFieldProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    autoFocus?: boolean;
    style?: StyleProp<ViewStyle>;
    inputStyle?: StyleProp<TextStyle>;
}

export function PasswordField({
    value,
    onChangeText,
    placeholder = "Password",
    autoFocus = false,
    style,
    inputStyle,
}: PasswordFieldProps) {
    const [showPassword, setShowPassword] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const placeholderColor = C.textTertiary || (isDark ? "#475569" : "#94a3b8");

    return (
        <View style={[s.container, style]}>
            <TextInput
                style={[s.input, { color: C.text }, inputStyle]}
                placeholder={placeholder}
                placeholderTextColor={placeholderColor}
                secureTextEntry={!showPassword}
                value={value}
                onChangeText={onChangeText}
                autoFocus={autoFocus}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                {showPassword ? (
                    <EyeClosed size={18} color={placeholderColor} />
                ) : (
                    <Eye size={18} color={placeholderColor} />
                )}
            </TouchableOpacity>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', height: 48 },
    input: { flex: 1, fontWeight: '500', fontSize: 15, height: '100%' },
});
