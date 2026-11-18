import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
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
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled, busy }}
            disabled={disabled}
            onPress={onPress}
            style={({ pressed }) => [
                styles.button,
                { backgroundColor, borderColor },
                pressed && !busy ? styles.pressed : null,
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
            <View style={styles.trailingSpace} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        width: '100%',
        minHeight: 56,
        borderRadius: 16,
        borderWidth: 1,
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
    trailingSpace: {
        width: 18,
    },
    pressed: {
        opacity: 0.72,
        transform: [{ scale: 0.985 }],
    },
    disabled: {
        opacity: 0.55,
    },
});
