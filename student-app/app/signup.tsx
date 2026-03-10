import { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
    ScrollView, useColorScheme, Animated as RNAnimated
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { signInWithGoogle, signInWithApple } from '@/lib/socialAuth';
import { Picker } from '@react-native-picker/picker';
import Animated, { FadeIn, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { PasswordField } from '@/components/ui/PasswordField';

// Small helper component that auto-advances after 2.5s using useEffect
function SuccessAutoAdvance({ onAdvance }: { onAdvance: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onAdvance, 2500);
        return () => clearTimeout(timer);
    }, []);
    return null;
}

export default function SignupScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const { login, updateUser } = useAuthStore();

    // STEPS: 
    // 1 = Email
    // 2 = Password
    // 3 = Name (Split)
    // 4 = DOB & Age
    // 5 = Success Animation
    // 6 = AI Personalization
    const [step, setStep] = useState(1);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dobMonth, setDobMonth] = useState('1'); // Strings for Picker compatibility
    const [dobYear, setDobYear] = useState('2005');

    // AI Prefs
    const [educationLevel, setEducationLevel] = useState('');
    const [fieldOfStudy, setFieldOfStudy] = useState('');
    const [learningStyle, setLearningStyle] = useState('simple');
    const [tone, setTone] = useState('encouraging');

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSocialLoading, setIsSocialLoading] = useState(false);
    const [registeredUser, setRegisteredUser] = useState<any>(null); // To store user during success animation

    const handleSocialLogin = async (provider: 'google' | 'apple') => {
        setIsSocialLoading(true);
        try {
            const signInFn = provider === 'google' ? signInWithGoogle : signInWithApple;
            const result = await signInFn();
            if (result) {
                login(result.user, result.token);
                if (result.isNewUser) {
                    // For social, jump straight to Success -> Personalization since name/email are known
                    setRegisteredUser(result.user);
                    setStep(5);
                } else {
                    router.replace('/(drawer)');
                }
            }
        } catch (error: any) {
            console.error('[Social Signup] Error:', error);
            Alert.alert('Auth Error', 'Social sign-up failed. Please try again.');
        } finally {
            setIsSocialLoading(false);
        }
    };

    const calculateAge = () => {
        const today = new Date();
        const birthDate = new Date(parseInt(dobYear), parseInt(dobMonth) - 1, 1);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const nextStep = () => {
        if (step === 1) {
            if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
                return Alert.alert('Invalid Email', 'Please enter a valid email address.');
            }
            setStep(2);
        } else if (step === 2) {
            if (!password || password.length < 8) {
                return Alert.alert('Too Short', 'Password must be at least 8 characters.');
            }
            if (password !== confirmPassword) {
                return Alert.alert('Mismatch', 'Passwords do not match.');
            }
            setStep(3);
        } else if (step === 3) {
            if (!firstName.trim() || !lastName.trim()) {
                return Alert.alert('Required', 'Please enter both first and last name.');
            }
            setStep(4);
        } else if (step === 4) {
            handleSignupSubmit();
        }
    };

    const handleSignupSubmit = async () => {
        setIsLoading(true);
        const age = calculateAge();
        if (age < 13) {
            setIsLoading(false);
            return Alert.alert('COPPA Compliance', 'You must be at least 13 years old to use Skeeme.');
        }
        const payload = {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            dob_month: parseInt(dobMonth),
            dob_year: parseInt(dobYear),
            age: age,
            email: email.trim().toLowerCase(),
            password,
            password_confirmation: confirmPassword,
            device_name: `${Platform.OS}_app`,
        };

        try {
            const response = await api.post('register', payload);
            const { token, user } = response.data;
            login(user, token);
            setRegisteredUser(user);
            setStep(5); // Move to success step
        } catch (error: any) {
            console.error('[Signup] Error', error.response?.data);
            let errorMessage = error.response?.data?.message || 'Check your details and try again.';
            let emailError = false;
            if (error.response?.status === 422 && error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const firstKey = Object.keys(errors)[0];
                errorMessage = errors[firstKey][0];
                if (firstKey === 'email') emailError = true;
            }
            Alert.alert('Registration Failed', errorMessage);
            if (emailError) setStep(1);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSavePreferences = async () => {
        setIsLoading(true);
        try {
            await api.post('preferences', {
                education_level: educationLevel,
                field_of_study: fieldOfStudy,
                learning_style: learningStyle,
                tone: tone
            });
            // Update local state
            updateUser({
                ai_preferences: {
                    education_level: educationLevel,
                    field_of_study: fieldOfStudy,
                    learning_style: learningStyle,
                    tone: tone
                }
            });
            router.replace('/upgrade'); // Proceed to upgrade page
        } catch (error) {
            console.error('Failed to save preferences', error);
            // Even if it fails, they are registered, let them proceed
            router.replace('/upgrade');
        } finally {
            setIsLoading(false);
        }
    };

    const skipPreferences = () => {
        router.replace('/upgrade');
    };

    // Helper to generate year array (100 years back)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString());

    // Theme-based colors
    const bgClass = isDark ? "bg-[#282828]" : "bg-white";
    const textTitleClass = isDark ? "text-white" : "text-black";
    const textSubClass = isDark ? "text-slate-400" : "text-slate-500";
    const inputBgClass = isDark ? "bg-[#1c1c1e]" : "bg-slate-100";
    const inputBorderClass = isDark ? "border-[#2c2c2e]" : "border-slate-200";
    const placeholderColor = isDark ? "#8e8e93" : "#94a3b8";
    const iconColor = isDark ? "white" : "black";
    const socialBtnBg = isDark ? "bg-[#1c1c1e]" : "bg-white";
    const separatorClass = isDark ? "bg-[#3a3a3c]" : "bg-slate-200";

    const primaryBtnClass = isDark ? 'bg-white' : 'bg-black';
    const primaryBtnDisabledClass = isDark ? 'bg-white/30' : 'bg-black/30';
    const primaryBtnTextClass = isDark ? 'text-black' : 'text-white';
    const primaryBtnTextDisabledClass = isDark ? 'text-black/50' : 'text-white/50';

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className={`flex-1 ${bgClass}`}
        >
            <StatusBar style={isDark ? "light" : "dark"} />

            {/* Header (Hidden on Success Step) */}
            {step < 5 && (
                <View className="px-6 pt-16 pb-4 flex-row justify-between items-center z-10">
                    <TouchableOpacity
                        onPress={() => step > 1 ? setStep(step - 1) : (router.canGoBack() ? router.back() : router.replace('/login'))}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    >
                        <Ionicons name="arrow-back" size={24} color={iconColor} />
                    </TouchableOpacity>
                    {/* Step Indicator */}
                    <Text className={`${textSubClass} font-bold`}>Step {step} of 4</Text>
                </View>
            )}

            <ScrollView className="flex-1 px-8" keyboardShouldPersistTaps="handled">

                {/* Step 1: Email */}
                {step === 1 && (
                    <Animated.View entering={FadeIn} className="flex-1">
                        <Text className={`${textTitleClass} text-[34px] font-black tracking-tight leading-[40px] mb-2 mt-4`}>
                            Create your Skeeme account
                        </Text>
                        <Text className={`${textSubClass} text-[15px] font-medium leading-relaxed mb-8`}>
                            Enter your email address to get started.
                        </Text>

                        <View className={`${inputBgClass} ${inputBorderClass} rounded-[16px] px-4 py-1 flex-row items-center border focus:border-[#6366f1]`}>
                            <TextInput
                                className="flex-1 font-medium text-[17px] h-[56px]"
                                placeholder="name@example.com"
                                placeholderTextColor={placeholderColor}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                                autoFocus
                                style={{ color: isDark ? 'white' : 'black' }}
                            />
                            {email.length > 0 && (
                                <TouchableOpacity onPress={() => setEmail('')}>
                                    <Ionicons name="close-circle" size={20} color={placeholderColor} />
                                </TouchableOpacity>
                            )}
                        </View>

                        <TouchableOpacity onPress={() => router.push('/login')} className="mt-6 mb-12">
                            <Text className="text-brand-primary font-bold text-[15px]">
                                Already have a Skeeme account?
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={nextStep}
                            className={`w-full py-[18px] rounded-[12px] items-center justify-center mb-8 ${email.length > 3 ? primaryBtnClass : primaryBtnDisabledClass}`}
                            disabled={email.length <= 3}
                        >
                            <Text className={`font-bold text-[17px] tracking-tight ${email.length > 3 ? primaryBtnTextClass : primaryBtnTextDisabledClass}`}>Continue</Text>
                        </TouchableOpacity>

                        {/* Social Auth (Hidden for now)
                        <View className="flex-row items-center mb-8">
                            <View className={`flex-1 h-[1px] ${separatorClass}`} />
                            <Text className={`${textSubClass} font-medium px-4 text-[13px]`}>or sign up with</Text>
                            <View className={`flex-1 h-[1px] ${separatorClass}`} />
                        </View>

                        <TouchableOpacity
                            onPress={() => handleSocialLogin('google')}
                            disabled={isSocialLoading}
                            className={`w-full ${socialBtnBg} py-[16px] rounded-[12px] flex-row items-center justify-center mb-4 border ${inputBorderClass}`}
                        >
                            {isSocialLoading ? (
                                <ActivityIndicator color={isDark ? "white" : "black"} size="small" />
                            ) : (
                                <>
                                    <Ionicons name="logo-google" size={20} color={iconColor} />
                                    <Text className={`${textTitleClass} font-medium text-[15px] ml-3`}>Sign up with Google</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => handleSocialLogin('apple')}
                            disabled={isSocialLoading}
                            className={`w-full ${socialBtnBg} py-[16px] rounded-[12px] flex-row items-center justify-center border ${inputBorderClass} mb-8`}
                        >
                            <Ionicons name="logo-apple" size={20} color={iconColor} />
                            <Text className={`${textTitleClass} font-medium text-[15px] ml-3`}>Sign up with Apple</Text>
                        </TouchableOpacity>
                        */}
                    </Animated.View>
                )}

                {/* Step 2: Password */}
                {step === 2 && (
                    <Animated.View entering={SlideInRight} exiting={SlideOutLeft} className="flex-1">
                        <Text className={`${textTitleClass} text-[34px] font-black tracking-tight leading-[40px] mb-2 mt-4`}>
                            Secure your account
                        </Text>
                        <Text className={`${textSubClass} text-[15px] font-medium leading-relaxed mb-8`}>
                            Choose a strong password with at least 8 characters.
                        </Text>

                        <PasswordField
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Password"
                            autoFocus
                            containerClassName="mb-4"
                        />

                        <PasswordField
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm Password"
                            containerClassName="mb-12"
                        />

                        <TouchableOpacity
                            onPress={nextStep}
                            className={`w-full py-[18px] rounded-[12px] items-center justify-center ${password.length >= 8 && confirmPassword === password ? primaryBtnClass : primaryBtnDisabledClass}`}
                            disabled={password.length < 8 || confirmPassword !== password}
                        >
                            <Text className={`font-bold text-[17px] tracking-tight ${password.length >= 8 && confirmPassword === password ? primaryBtnTextClass : primaryBtnTextDisabledClass}`}>Continue</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {/* Step 3: Name (Split) */}
                {step === 3 && (
                    <Animated.View entering={SlideInRight} exiting={SlideOutLeft} className="flex-1">
                        <Text className={`${textTitleClass} text-[34px] font-black tracking-tight leading-[40px] mb-2 mt-4`}>
                            What's your name?
                        </Text>
                        <Text className={`${textSubClass} text-[15px] font-medium leading-relaxed mb-8`}>
                            This is how you will appear inside Skeeme.
                        </Text>

                        <View className={`${inputBgClass} ${inputBorderClass} rounded-[16px] px-4 py-1 flex-row items-center border mb-4`}>
                            <TextInput
                                className="flex-1 font-medium text-[17px] h-[56px]"
                                placeholder="First Name"
                                placeholderTextColor={placeholderColor}
                                autoCapitalize="words"
                                value={firstName}
                                onChangeText={setFirstName}
                                autoFocus
                                style={{ color: isDark ? 'white' : 'black' }}
                            />
                            {firstName.length > 0 && (
                                <TouchableOpacity onPress={() => setFirstName('')}>
                                    <Ionicons name="close-circle" size={20} color={placeholderColor} />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View className={`${inputBgClass} ${inputBorderClass} rounded-[16px] px-4 py-1 flex-row items-center border mb-12`}>
                            <TextInput
                                className="flex-1 font-medium text-[17px] h-[56px]"
                                placeholder="Last Name"
                                placeholderTextColor={placeholderColor}
                                autoCapitalize="words"
                                value={lastName}
                                onChangeText={setLastName}
                                style={{ color: isDark ? 'white' : 'black' }}
                            />
                            {lastName.length > 0 && (
                                <TouchableOpacity onPress={() => setLastName('')}>
                                    <Ionicons name="close-circle" size={20} color={placeholderColor} />
                                </TouchableOpacity>
                            )}
                        </View>

                        <TouchableOpacity
                            onPress={nextStep}
                            className={`w-full py-[18px] rounded-[12px] items-center justify-center flex-row ${firstName.length > 1 && lastName.length > 1 ? primaryBtnClass : primaryBtnDisabledClass}`}
                            disabled={firstName.length <= 1 || lastName.length <= 1}
                        >
                            <Text className={`font-bold text-[17px] tracking-tight ${firstName.length > 1 && lastName.length > 1 ? primaryBtnTextClass : primaryBtnTextDisabledClass}`}>Continue</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {/* Step 4: DOB */}
                {step === 4 && (
                    <Animated.View entering={SlideInRight} exiting={SlideOutLeft} className="flex-1">
                        <Text className={`${textTitleClass} text-[34px] font-black tracking-tight leading-[40px] mb-2 mt-4`}>
                            When were you born?
                        </Text>
                        <Text className={`${textSubClass} text-[15px] font-medium leading-relaxed mb-8`}>
                            Used to personalize your learning experience.
                        </Text>

                        <View className="flex-row justify-between mb-4">
                            {/* Month Picker */}
                            <View className={`flex-1 mr-2 ${inputBgClass} ${inputBorderClass} rounded-[16px] border overflow-hidden`}>
                                <Picker
                                    selectedValue={dobMonth}
                                    onValueChange={(itemValue) => setDobMonth(itemValue)}
                                    style={{ color: isDark ? 'white' : 'black', height: 56 }}
                                    dropdownIconColor={isDark ? 'white' : 'black'}
                                >
                                    <Picker.Item label="January" value="1" color={isDark ? 'white' : 'black'} />
                                    <Picker.Item label="February" value="2" color={isDark ? 'white' : 'black'} />
                                    <Picker.Item label="March" value="3" color={isDark ? 'white' : 'black'} />
                                    <Picker.Item label="April" value="4" color={isDark ? 'white' : 'black'} />
                                    <Picker.Item label="May" value="5" color={isDark ? 'white' : 'black'} />
                                    <Picker.Item label="June" value="6" color={isDark ? 'white' : 'black'} />
                                    <Picker.Item label="July" value="7" color={isDark ? 'white' : 'black'} />
                                    <Picker.Item label="August" value="8" color={isDark ? 'white' : 'black'} />
                                    <Picker.Item label="September" value="9" color={isDark ? 'white' : 'black'} />
                                    <Picker.Item label="October" value="10" color={isDark ? 'white' : 'black'} />
                                    <Picker.Item label="November" value="11" color={isDark ? 'white' : 'black'} />
                                    <Picker.Item label="December" value="12" color={isDark ? 'white' : 'black'} />
                                </Picker>
                            </View>

                            {/* Year Picker */}
                            <View className={`flex-1 ml-2 ${inputBgClass} ${inputBorderClass} rounded-[16px] border overflow-hidden`}>
                                <Picker
                                    selectedValue={dobYear}
                                    onValueChange={(itemValue) => setDobYear(itemValue)}
                                    style={{ color: isDark ? 'white' : 'black', height: 56 }}
                                    dropdownIconColor={isDark ? 'white' : 'black'}
                                >
                                    {years.map(y => (
                                        <Picker.Item key={y} label={y} value={y} color={isDark ? 'white' : 'black'} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {/* Calculated Age Readonly Field */}
                        <View className={`bg-transparent mb-12`}>
                            <Text className={`${textSubClass} uppercase text-[12px] font-bold mb-2 ml-1`}>Calculated Age</Text>
                            <View className={`${inputBgClass} opacity-70 ${inputBorderClass} rounded-[16px] px-4 py-1 flex-row items-center border`}>
                                <TextInput
                                    className="flex-1 font-bold text-[17px] h-[56px]"
                                    value={`${calculateAge()} years old`}
                                    editable={false}
                                    style={{ color: isDark ? 'white' : 'black' }}
                                />
                                <Ionicons name="lock-closed" size={16} color={placeholderColor} />
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={nextStep}
                            className={`w-full py-[18px] rounded-[12px] items-center justify-center flex-row ${!isLoading ? 'bg-brand-primary' : 'bg-brand-primary/50'}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="font-bold text-[17px] tracking-tight text-white">Create Account</Text>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {/* Step 5: Success Animation (Auto advances to Step 6) */}
                {step === 5 && (
                    <Animated.View entering={FadeIn} className="flex-1 items-center justify-center mt-20">
                        {/* Fake Lottie implementation since we don't have a JSON file, using Ionicons nicely grouped */}
                        <View className="bg-[#10b981] size-32 rounded-full items-center justify-center mb-6 shadow-lg shadow-emerald-500/50">
                            <Ionicons name="checkmark" size={64} color="white" />
                        </View>

                        <Text className={`${textTitleClass} text-[34px] font-black tracking-tight leading-[40px] mb-2 text-center`}>
                            Welcome, {registeredUser?.first_name || 'Student'}!
                        </Text>
                        <Text className={`${textSubClass} text-[15px] font-medium leading-relaxed mb-6 text-center px-4`}>
                            Your account is locked in. Let's make Skeeme yours.
                        </Text>

                        {/* Auto-advance to personalization after 2.5s */}
                        {step === 5 && <SuccessAutoAdvance onAdvance={() => setStep(6)} />}
                        <ActivityIndicator color={isDark ? 'white' : 'black'} size="large" />
                    </Animated.View>
                )}

                {/* Step 6: AI Personalization */}
                {step === 6 && (
                    <Animated.View entering={SlideInRight} className="flex-1 pb-12">
                        <Text className={`${textTitleClass} text-[34px] font-black tracking-tight leading-[40px] mb-2 mt-4`}>
                            Personalize your AI
                        </Text>
                        <Text className={`${textSubClass} text-[15px] font-medium leading-relaxed mb-8`}>
                            Tell us how you learn best so your AI tutor can adapt to you.
                        </Text>

                        <Text className={`${textTitleClass} text-[16px] font-bold mb-2`}>Education Level</Text>
                        <View className={`${inputBgClass} ${inputBorderClass} rounded-[16px] border overflow-hidden mb-6`}>
                            <Picker
                                selectedValue={educationLevel}
                                onValueChange={(val) => setEducationLevel(val)}
                                style={{ color: isDark ? 'white' : 'black' }}
                                dropdownIconColor={isDark ? 'white' : 'black'}
                            >
                                <Picker.Item label="High School" value="high_school" color={isDark ? 'white' : 'black'} />
                                <Picker.Item label="Undergraduate" value="undergraduate" color={isDark ? 'white' : 'black'} />
                                <Picker.Item label="Masters/Graduate" value="masters" color={isDark ? 'white' : 'black'} />
                                <Picker.Item label="Professional" value="professional" color={isDark ? 'white' : 'black'} />
                            </Picker>
                        </View>

                        <Text className={`${textTitleClass} text-[16px] font-bold mb-2`}>Field of Study (Optional)</Text>
                        <View className={`${inputBgClass} ${inputBorderClass} rounded-[16px] px-4 py-1 flex-row items-center border mb-6`}>
                            <TextInput
                                className="flex-1 font-medium text-[16px] h-[50px]"
                                placeholder="e.g. Computer Science, Medicine..."
                                placeholderTextColor={placeholderColor}
                                value={fieldOfStudy}
                                onChangeText={setFieldOfStudy}
                                style={{ color: isDark ? 'white' : 'black' }}
                            />
                        </View>

                        <Text className={`${textTitleClass} text-[16px] font-bold mb-2`}>Preferred Learning Style</Text>
                        <View className={`${inputBgClass} ${inputBorderClass} rounded-[16px] border overflow-hidden mb-6`}>
                            <Picker
                                selectedValue={learningStyle}
                                onValueChange={(val) => setLearningStyle(val)}
                                style={{ color: isDark ? 'white' : 'black' }}
                                dropdownIconColor={isDark ? 'white' : 'black'}
                            >
                                <Picker.Item label="Simple & Easy" value="simple" color={isDark ? 'white' : 'black'} />
                                <Picker.Item label="Detailed & Academic" value="detailed" color={isDark ? 'white' : 'black'} />
                                <Picker.Item label="Explain with Analogies" value="analogies" color={isDark ? 'white' : 'black'} />
                            </Picker>
                        </View>

                        <Text className={`${textTitleClass} text-[16px] font-bold mb-2`}>Tutor Tone</Text>
                        <View className={`${inputBgClass} ${inputBorderClass} rounded-[16px] border overflow-hidden mb-8`}>
                            <Picker
                                selectedValue={tone}
                                onValueChange={(val) => setTone(val)}
                                style={{ color: isDark ? 'white' : 'black' }}
                                dropdownIconColor={isDark ? 'white' : 'black'}
                            >
                                <Picker.Item label="Warm & Encouraging" value="encouraging" color={isDark ? 'white' : 'black'} />
                                <Picker.Item label="Strict & Formal" value="strict" color={isDark ? 'white' : 'black'} />
                                <Picker.Item label="Direct & Concise" value="concise" color={isDark ? 'white' : 'black'} />
                            </Picker>
                        </View>

                        <TouchableOpacity
                            onPress={handleSavePreferences}
                            className={`w-full py-[18px] rounded-[12px] items-center justify-center flex-row mb-4 ${!isLoading ? 'bg-brand-primary' : 'bg-brand-primary/50'}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="font-bold text-[17px] tracking-tight text-white">Save & Enter App</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={skipPreferences} className="w-full py-2 items-center">
                            <Text className={`${textSubClass} font-bold text-[15px]`}>Skip for now</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}

            </ScrollView>
        </KeyboardAvoidingView>
    );
}
