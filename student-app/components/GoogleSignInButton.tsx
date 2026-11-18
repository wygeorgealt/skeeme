import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';

export interface GoogleSignInButtonProps {
    busy: boolean;
    disabled: boolean;
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    onPress: () => void;
    onStart: () => void;
    onToken: (token: string) => Promise<void>;
    onError: (message: string) => void;
    onFinish: () => void;
}

export default function GoogleSignInButton({
    busy,
    disabled,
    backgroundColor,
    borderColor,
    textColor,
    onPress,
}: GoogleSignInButtonProps) {
    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ disabled, busy }}
            activeOpacity={0.8}
            disabled={disabled || busy}
            onPress={onPress}
            style={[
                styles.button,
                { backgroundColor, borderColor },
                disabled ? styles.disabled : null,
            ]}
        >
            {busy ? (
                <ActivityIndicator color={textColor} />
            ) : (
                <FontAwesome name="google" size={18} color="#4285F4" />
            )}
            <Text style={[styles.label, { color: textColor }]}>
                {busy ? 'Connecting to Google…' : 'Continue with Google'}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: '100%',
        minHeight: 56,
        borderRadius: 18,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
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
