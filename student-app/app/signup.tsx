import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function SignupScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const { setAuth } = useAuthStore();

    const handleSignup = async () => {
        if (!email || !password || !passwordConfirmation) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== passwordConfirmation) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/v1/student/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    name: 'Independent Student', // Placeholder until onboarding
                    email,
                    password,
                    password_confirmation: passwordConfirmation,
                    device_name: Platform.OS + ' ' + Platform.Version,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                await setAuth(data.user, data.token);
                // Redirect to onboarding after successful registration
                router.replace('/onboarding');
            } else {
                Alert.alert('Signup Failed', data.message || 'Something went wrong');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Could not connect to the server');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <LinearGradient
                colors={['#4f46e5', '#3730a3']}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('@/assets/images/icon.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.title}>Join Skeeme</Text>
                    <Text style={styles.subtitle}>Start your journey to mastery today</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="mail-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="name@example.com"
                                placeholderTextColor="#94a3b8"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Create a strong password"
                                placeholderTextColor="#94a3b8"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Repeat your password"
                                placeholderTextColor="#94a3b8"
                                value={passwordConfirmation}
                                onChangeText={setPasswordConfirmation}
                                secureTextEntry
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.signupButton}
                        onPress={handleSignup}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.signupButtonText}>Create Account</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/login')}>
                            <Text style={styles.loginLink}>Log In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4f46e5',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 80 : 60,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 80,
        height: 80,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 24,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: 'white',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 8,
        fontWeight: '500',
    },
    form: {
        backgroundColor: 'white',
        borderRadius: 32,
        padding: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#f1f5f9',
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 52,
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '500',
    },
    signupButton: {
        backgroundColor: '#4f46e5',
        borderRadius: 16,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    signupButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '800',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        color: '#64748b',
        fontSize: 14,
        fontWeight: '500',
    },
    loginLink: {
        color: '#4f46e5',
        fontSize: 14,
        fontWeight: '800',
    },
});
