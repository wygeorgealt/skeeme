import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, useColorScheme, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Text } from '@/components/ui/Text';
import { Colors, Radius } from '@/constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';

export default function ReferralScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const C = Colors[isDark ? 'dark' : 'light'];

  const { onboardingData, setOnboardingData } = useAuthStore();

  const [referralCode, setReferralCode] = useState<string>(
    (onboardingData as any)?.referral_code || ''
  );

  const handleSkip = async () => {
    await setOnboardingData({ referral_code: referralCode.trim() || null });
    router.push('/(onboarding)/notifications');
  };

  const handleContinue = async () => {
    const codeFinal = referralCode.trim();
    await setOnboardingData({ referral_code: codeFinal || null });
    router.push('/(onboarding)/notifications');
  };

  // Custom skip button rendered in the footerExtra slot
  const SkipButton = (
    <TouchableOpacity onPress={handleSkip} activeOpacity={0.7} style={s.skipBtn}>
        <Text style={[s.skipBtnText, { color: C.textSecondary }]}>Skip for now</Text>
    </TouchableOpacity>
  );

  return (
    <OnboardingShell
      step={9}
      totalSteps={9} // We add one to total steps just for this optional screen so the progress bar looks right
      stepLabel="Optional"
      title="Have a referral code?"
      subtitle="If you were given a code from a friend, enter it here. Otherwise you can skip."
      onCta={handleContinue}
      footerExtra={SkipButton}
      hasKeyboard
    >
      <Animated.View entering={FadeInDown.duration(500).delay(150)} style={s.inputContainer}>
        <Text style={[s.label, { color: C.text }]}>Referral code</Text>
        <TextInput
          value={referralCode}
          onChangeText={setReferralCode}
          placeholder="Enter code"
          placeholderTextColor={C.textTertiary}
          autoCapitalize="characters"
          autoCorrect={false}
          style={[s.input, { 
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              color: C.text 
          }]}
        />
      </Animated.View>
    </OnboardingShell>
  );
}

const s = StyleSheet.create({
  inputContainer: {
      marginTop: 8,
  },
  label: { 
      fontSize: 15, 
      fontWeight: '700', 
      marginBottom: 10, 
      marginLeft: 4 
  },
  input: {
    height: 58,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 17,
    fontWeight: '600',
  },
  skipBtn: {
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
  },
  skipBtnText: {
      fontSize: 17,
      fontWeight: '600',
  },
});
