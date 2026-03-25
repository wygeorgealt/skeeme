import { Text } from '@/components/ui/Text';
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, useColorScheme } from 'react-native';
import { Eye, EyeClosed } from 'iconoir-react-native';

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

    const inputBgClass = isDark ? "bg-slate-900" : "bg-transparent";
    const inputBorderClass = isDark ? "border-slate-800" : "border-slate-200";
    const placeholderColor = isDark ? "#475569" : "#94a3b8";

    // Use py-1 like signup.tsx but allow overriding padding in container if needed
    return (
        <View className={`${inputBgClass} ${inputBorderClass} rounded-xl px-4 flex-row items-center border focus:border-slate-900 dark:focus:border-white ${containerClassName}`}>
            <TextInput
                className="flex-1 font-medium text-[15px] h-[48px]"
                placeholder={placeholder}
                placeholderTextColor={placeholderColor}
                secureTextEntry={!showPassword}
                value={value}
                onChangeText={onChangeText}
                autoFocus={autoFocus}
                style={{ color: isDark ? 'white' : 'black' }}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                {showPassword ? (
                    <EyeClosed width={18} height={18} color={placeholderColor} />
                ) : (
                    <Eye width={18} height={18} color={placeholderColor} />
                )}
            </TouchableOpacity>
        </View>
    );
}
