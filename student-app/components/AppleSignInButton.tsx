import { FontAwesome } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';

interface AppleSignInButtonProps {
    dark: boolean;
    disabled: boolean;
    onPress: () => void;
}

export default function AppleSignInButton({
    dark,
    disabled,
    onPress,
}: AppleSignInButtonProps) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel="Continue with Apple"
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={onPress}
            style={({ pressed }) => [
                styles.button,
                { backgroundColor: dark ? '#FFFFFF' : '#000000' },
                pressed && !disabled ? styles.pressed : null,
                disabled ? styles.disabled : null,
            ]}
        >
            <FontAwesome name="apple" size={20} color={dark ? '#000000' : '#FFFFFF'} />
            <Text style={[styles.label, { color: dark ? '#000000' : '#FFFFFF' }]}>
                Continue with Apple
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        width: '100%',
        minHeight: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingHorizontal: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '700',
    },
    pressed: {
        opacity: 0.72,
        transform: [{ scale: 0.985 }],
    },
    disabled: {
        opacity: 0.55,
    },
});
