import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ScrollView,
    Dimensions,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const educationLevels = [
    { label: 'High School', value: 'high_school', icon: 'school-outline' },
    { label: 'Undergraduate', value: 'undergraduate', icon: 'briefcase-outline' },
    { label: 'Masters / Graduate', value: 'masters', icon: 'ribbon-outline' },
    { label: 'Professional', value: 'professional', icon: 'medal-outline' },
];

const learningStyles = [
    { label: 'Simple & Clear', value: 'simple', description: 'Plain language and fundamental concepts' },
    { label: 'Deep & Detailed', value: 'detailed', description: 'In-depth explanations and technical rigor' },
    { label: 'Analogy Based', value: 'analogies', description: 'Relatable stories and mental models' },
];

export default function OnboardingScreen() {
    const [step, setStep] = useState(1);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [educationLevel, setEducationLevel] = useState('');
    const [learningStyle, setLearningStyle] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const router = useRouter();
    const { token, updateUser } = useAuthStore();

    const handleNext = () => {
        if (step === 1) {
            if (!firstName || !lastName) {
                Alert.alert('Almost there!', 'Please enter your first and last name so we can introduce ourselves.');
                return;
            }
        } else if (step === 2 && !educationLevel) {
            Alert.alert('Selection Required', 'Please choose your education level to continue.');
            return;
        }
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleFinish = async () => {
        if (!learningStyle) {
            Alert.alert('Selection Required', 'Please select a learning style.');
            return;
        }

        setIsSaving(true);
        try {
            // 1. Update Profile (Name)
            const profileResponse = await fetch('http://localhost:8000/api/v1/student/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: `${firstName} ${lastName}`,
                    first_name: firstName,
                    last_name: lastName,
                }),
            });

            // 2. Update AI Preferences
            const prefResponse = await fetch('http://localhost:8000/api/v1/student/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    education_level: educationLevel,
                    learning_style: learningStyle,
                    tone: 'encouraging',
                }),
            });

            if (profileResponse.ok && prefResponse.ok) {
                const profileData = await profileResponse.json();
                const prefData = await prefResponse.json();

                updateUser({
                    ...profileData.user,
                    ai_preferences: prefData.ai_preferences
                });

                router.replace('/(drawer)');
            } else {
                Alert.alert('Error', 'Failed to save your preferences. Please try again.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Connection error. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <LinearGradient
                colors={['#f8fafc', '#f1f5f9']}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.header}>
                <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${(step / 3) * 100}%` }]} />
                </View>
                <Text style={styles.stepTitle}>Step {step} of 3</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {step === 1 ? (
                    <View style={styles.stepContent}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="person" size={40} color="#4f46e5" />
                        </View>
                        <Text style={styles.title}>What's your name?</Text>
                        <Text style={styles.subtitle}>We'd love to know who we're helping today!</Text>

                        <View style={styles.optionsContainer}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>First Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter first name"
                                    value={firstName}
                                    onChangeText={setFirstName}
                                    autoFocus
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Last Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter last name"
                                    value={lastName}
                                    onChangeText={setLastName}
                                />
                            </View>
                        </View>
                    </View>
                ) : step === 2 ? (
                    <View style={styles.stepContent}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="school" size={40} color="#4f46e5" />
                        </View>
                        <Text style={styles.title}>What is your level of study?</Text>
                        <Text style={styles.subtitle}>This helps Skeeme tailor its explanations to your academic level.</Text>

                        <View style={styles.optionsContainer}>
                            {educationLevels.map((item) => (
                                <TouchableOpacity
                                    key={item.value}
                                    style={[
                                        styles.optionCard,
                                        educationLevel === item.value && styles.optionCardActive
                                    ]}
                                    onPress={() => setEducationLevel(item.value)}
                                >
                                    <View style={[
                                        styles.optionIcon,
                                        educationLevel === item.value && styles.optionIconActive
                                    ]}>
                                        <Ionicons
                                            name={item.icon as any}
                                            size={24}
                                            color={educationLevel === item.value ? 'white' : '#64748b'}
                                        />
                                    </View>
                                    <Text style={[
                                        styles.optionLabel,
                                        educationLevel === item.value && styles.optionLabelActive
                                    ]}>{item.label}</Text>
                                    {educationLevel === item.value && (
                                        <Ionicons name="checkmark-circle" size={24} color="#4f46e5" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View style={styles.stepContent}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="flash" size={40} color="#4f46e5" />
                        </View>
                        <Text style={styles.title}>Pick a learning style</Text>
                        <Text style={styles.subtitle}>Skeeme's AI will adapt its voice to match how you learn best.</Text>

                        <View style={styles.optionsContainer}>
                            {learningStyles.map((item) => (
                                <TouchableOpacity
                                    key={item.value}
                                    style={[
                                        styles.styleCard,
                                        learningStyle === item.value && styles.styleCardActive
                                    ]}
                                    onPress={() => setLearningStyle(item.value)}
                                >
                                    <View style={styles.styleInfo}>
                                        <Text style={[
                                            styles.styleLabel,
                                            learningStyle === item.value && styles.styleLabelActive
                                        ]}>{item.label}</Text>
                                        <Text style={styles.styleDesc}>{item.description}</Text>
                                    </View>
                                    {learningStyle === item.value && (
                                        <Ionicons name="checkmark-circle" size={28} color="#4f46e5" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                {step > 1 && (
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[styles.nextButton, step === 1 && { flex: 1 }]}
                    onPress={step < 3 ? handleNext : handleFinish}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.nextButtonText}>
                            {step < 3 ? 'Continue' : "I'm project ready!"}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    progressContainer: {
        width: '100%',
        height: 6,
        backgroundColor: '#e2e8f0',
        borderRadius: 3,
        marginBottom: 12,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#4f46e5',
        borderRadius: 3,
    },
    stepTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 110,
    },
    stepContent: {
        alignItems: 'center',
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#eef2ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
        paddingHorizontal: 10,
    },
    optionsContainer: {
        width: '100%',
        gap: 16,
    },
    inputGroup: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        height: 56,
        backgroundColor: 'white',
        borderRadius: 16,
        paddingHorizontal: 20,
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '600',
        borderWidth: 2,
        borderColor: '#f1f5f9',
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    optionCardActive: {
        borderColor: '#4f46e5',
        backgroundColor: '#f5f7ff',
    },
    optionIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    optionIconActive: {
        backgroundColor: '#4f46e5',
    },
    optionLabel: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: '#334155',
    },
    optionLabelActive: {
        color: '#4f46e5',
    },
    styleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        backgroundColor: 'white',
        borderRadius: 24,
        borderWidth: 2,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    styleCardActive: {
        borderColor: '#4f46e5',
        backgroundColor: '#f5f7ff',
    },
    styleInfo: {
        flex: 1,
    },
    styleLabel: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 4,
    },
    styleLabelActive: {
        color: '#4f46e5',
    },
    styleDesc: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 20,
        backgroundColor: 'rgba(248, 250, 252, 0.95)',
        flexDirection: 'row',
        gap: 12,
    },
    backButton: {
        paddingHorizontal: 24,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#64748b',
    },
    nextButton: {
        flex: 2,
        backgroundColor: '#4f46e5',
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: 'white',
    },
});
