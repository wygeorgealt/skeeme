import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, useColorScheme, StyleSheet } from 'react-native';
import { AnimatedButton } from 'react-native-3d-animated-buttons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Text } from '@/components/ui/Text';
import { Colors, Radius } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ReferralScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const C = Colors[scheme === 'dark' ? 'dark' : 'light'];

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

  return (
    <View style={[s.container, { backgroundColor: C.secondaryBackground }]}>
      <View style={[s.card, { paddingTop: Math.max(insets.top + 8, 20) }]}>
        <Text style={[s.title, { color: C.text }]}>Referral code (optional)</Text>
        <Text style={[s.subtitle, { color: C.textSecondary }]}>
          If you were given a code, enter it here. Otherwise you can skip.
        </Text>

        <Text style={[s.label, { color: C.text }]}>Referral code</Text>
        <TextInput
          value={referralCode}
          onChangeText={setReferralCode}
          placeholder="Enter code"
          placeholderTextColor={C.textTertiary}
          autoCapitalize="characters"
          style={[s.input, { backgroundColor: C.card, borderColor: C.separator }]}
        />

        <View style={s.actions}>
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.9} style={[s.secondaryBtn, { borderColor: C.separator }]}>
            <Text style={[s.secondaryBtnText, { color: C.textSecondary }]}>Skip</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <AnimatedButton
              title="Continue"
              onPress={handleContinue}
              type="capsule"
              backgroundColor="#007AFF"
              shadowColor="#0066D6"
              fullWidth
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  card: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: { fontSize: 32, fontWeight: '900', letterSpacing: -1, marginTop: 8, marginBottom: 8 },
  subtitle: { fontSize: 16, fontWeight: '500', lineHeight: 22, marginBottom: 22 },
  label: { fontSize: 15, fontWeight: '700', marginBottom: 10, marginLeft: 4 },
  input: {
    height: 56,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  actions: { flexDirection: 'row', gap: 12, marginTop: 18 },
  secondaryBtn: {
    flex: 1,
    height: 56,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { fontWeight: '800', fontSize: 16 },
  primaryBtn: {
    flex: 1,
    height: 56,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
});
