import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PasswordFieldProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    autoFocus?: boolean;
    containerClassName?: string;
}

export function PasswordField({
    value,
    onChangeText,
    placeholder = "Password",
    autoFocus = false,
    containerClassName = "mb-4",
}: PasswordFieldProps) {
    const [showPassword, setShowPassword] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const inputBgClass = isDark ? "bg-[#1c1c1e]" : "bg-slate-100";
    const inputBorderClass = isDark ? "border-[#2c2c2e]" : "border-slate-200";
    const placeholderColor = isDark ? "#8e8e93" : "#94a3b8";

    // Use py-1 like signup.tsx but allow overriding padding in container if needed
    return (
        <View className={`${inputBgClass} ${inputBorderClass} rounded-[16px] px-4 py-1 flex-row items-center border focus:border-brand-primary ${containerClassName}`}>
            <TextInput
                className="flex-1 font-medium text-[17px] h-[56px]"
                placeholder={placeholder}
                placeholderTextColor={placeholderColor}
                secureTextEntry={!showPassword}
                value={value}
                onChangeText={onChangeText}
                autoFocus={autoFocus}
                style={{ color: isDark ? 'white' : 'black' }}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color={placeholderColor} />
            </TouchableOpacity>
        </View>
    );
}
