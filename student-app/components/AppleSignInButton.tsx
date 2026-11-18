import { FontAwesome } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity } from 'react-native';
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
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Continue with Apple"
            accessibilityState={{ disabled }}
            activeOpacity={0.8}
            disabled={disabled}
            onPress={onPress}
            style={[
                styles.button,
                { backgroundColor: dark ? '#FFFFFF' : '#000000' },
                disabled ? styles.disabled : null,
            ]}
        >
            <FontAwesome name="apple" size={20} color={dark ? '#000000' : '#FFFFFF'} />
            <Text style={[styles.label, { color: dark ? '#000000' : '#FFFFFF' }]}>
                Continue with Apple
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: '100%',
        minHeight: 56,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 3,
    },
    label: {
        fontFamily: 'Allo-Bold',
        fontSize: 16,
        fontWeight: '700',
    },
    disabled: {
        opacity: 0.55,
    },
});
