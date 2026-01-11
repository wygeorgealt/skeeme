import React, { useState, useContext } from 'react';
import { View, StyleSheet, Alert, useColorScheme, StatusBar, TextInput, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { login as apiLogin } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { theme } from '../constants/theme';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        setLoading(true);
        try {
            const data = await apiLogin(email, password);
            login(data.token);
        } catch (error) {
            Alert.alert('Login Failed', error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient
                colors={isDark ? ['#18181b', '#27272a'] : ['#f5f5f5', '#e4e4e7']}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.contentContainer}>
                <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
                    <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>
                        Skeeme Admin
                    </Text>
                    <Text style={[styles.subtitle, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
                        Sign in to manage your platform
                    </Text>

                    <View style={[styles.inputWrapper, isDark ? styles.inputWrapperDark : styles.inputWrapperLight]}>
                        <FontAwesome name="envelope" size={16} color={isDark ? '#a1a1aa' : '#71717a'} style={styles.inputIcon} />
                        <TextInput
                            placeholder="Email Address"
                            placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
                            onChangeText={setEmail}
                            value={email}
                            autoCapitalize="none"
                            style={[styles.textInput, isDark ? styles.textDark : styles.textLight]}
                        />
                    </View>

                    <View style={[styles.inputWrapper, isDark ? styles.inputWrapperDark : styles.inputWrapperLight]}>
                        <FontAwesome name="lock" size={16} color={isDark ? '#a1a1aa' : '#71717a'} style={styles.inputIcon} />
                        <TextInput
                            placeholder="Password"
                            placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
                            onChangeText={setPassword}
                            value={password}
                            secureTextEntry
                            style={[styles.textInput, isDark ? styles.textDark : styles.textLight]}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.8}
                        style={styles.buttonContainer}
                    >
                        <LinearGradient
                            colors={theme.colors.gradients.primary}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.button}
                        >
                            <Text style={styles.buttonTitle}>{loading ? 'Signing in...' : 'Sign In'}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    contentContainer: {
        padding: 24,
    },
    card: {
        padding: 32,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    cardLight: {
        backgroundColor: theme.colors.cardBgLight,
        borderColor: '#e4e4e7',
    },
    cardDark: {
        backgroundColor: theme.colors.cardBgDark,
        borderColor: theme.colors.cardBorderDark,
    },
    title: {
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: '700',
        fontSize: 28,
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 32,
        fontSize: 14,
    },
    textLight: { color: theme.colors.textPrimaryLight },
    textDark: { color: theme.colors.textPrimaryDark },
    textSecondaryLight: { color: theme.colors.textSecondaryLight },
    textSecondaryDark: { color: theme.colors.textSecondaryDark },

    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 50,
        borderWidth: 1,
        marginBottom: 16,
    },
    inputWrapperLight: {
        backgroundColor: '#fff',
        borderColor: '#e4e4e7',
    },
    inputWrapperDark: {
        backgroundColor: '#3f3f46',
        borderColor: '#52525b',
    },
    inputIcon: {
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        height: '100%',
        fontSize: 16,
    },
    buttonContainer: {
        marginTop: 8,
        borderRadius: 8,
        overflow: 'hidden',
    },
    button: {
        height: 50,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonTitle: {
        fontWeight: '600',
        fontSize: 16,
        color: '#fff',
    },
});
