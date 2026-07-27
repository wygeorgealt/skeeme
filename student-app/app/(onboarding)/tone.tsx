import { Text } from '@/components/ui/Text';
import { View, TouchableOpacity, useColorScheme, StyleSheet, ScrollView } from 'react-native';
import { AnimatedButton } from 'react-native-3d-animated-buttons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView,  useSafeAreaInsets  } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { Colors } from '@/constants/theme';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';

const TONES = [
  { key: 'supportive', label: 'Supportive', emoji: '🤗', iconSource: require('@/assets/3dicons/3dicons-trophy-front-color.png') },
  { key: 'strict', label: 'Strict', emoji: '📐', iconSource: require('@/assets/3dicons/3dicons-medal-front-color.png') },
  { key: 'concise', label: 'Concise', emoji: '⚡', iconSource: require('@/assets/3dicons/3dicons-clock-front-color.png') },
  { key: 'fun', label: 'Fun & Witty', emoji: '😂', iconSource: require('@/assets/3dicons/3dicons-bookmark-fav-front-color.png') },
];

export default function ToneScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const C = Colors[isDark ? 'dark' : 'light'];

  const { setOnboardingStep, setOnboardingData, onboardingData } = useAuthStore();

  const [selected, setSelected] = useState<string>(onboardingData?.tone || onboardingData?.ai_tone || '');

  useEffect(() => {
    setOnboardingStep(5);
  }, []);

  const handleSelect = async (key: string) => {
    setSelected(key);
    setOnboardingData({ tone: key });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleNext = () => {
    if (selected) router.push('/(onboarding)/analogy');
  };

  const textColor = isDark ? '#FFFFFF' : '#000000';
  const subtextColor = isDark ? '#8E8E93' : '#6E6E73';
  const iconColor = '#007AFF';

  return (
    <View style={{ flex: 1, backgroundColor: C.secondaryBackground }}>
      <SafeAreaView style={s.container}>
        <View style={[s.headerSection, { paddingTop: Math.max(insets.top, 20) }]}>
          <Animated.View entering={FadeInDown.duration(600).delay(100)}>
            <View style={s.stepRow}>
              <Text style={[s.stepText, { color: iconColor }]}>Step 5 of 8</Text>
              <View style={s.progressBar}>
                <View style={[s.progressFill, { width: '62%', backgroundColor: iconColor }]} />
              </View>
            </View>
            <Text style={[s.heroTitle, { color: textColor }]}>How should your tutor feel?</Text>
          </Animated.View>
        </View>

        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={s.optionsGap}>
            {TONES.map((t, idx) => {
              const isSelected = selected === t.key;
              const Icon = t.iconSource;
              return (
                <Animated.View key={t.key} entering={FadeInDown.duration(600).delay(120 + idx * 60)}>
                  <TouchableOpacity
                    onPress={() => handleSelect(t.key)}
                    activeOpacity={0.8}
                    style={[
                      s.card,
                      isDark ? s.cardDark : s.cardLight,
                      isSelected && s.cardSelected,
                    ]}
                  >
                    <View style={[s.iconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F2F2F7' }]}>
                      <AnimatedIcon source={t.iconSource} size={28} animationType="wobble" />
                    </View>
                    <Text style={[s.optionLabel, { color: textColor }]}>{t.emoji} {t.label}</Text>
                    {isSelected ? <Text style={s.check}>✓</Text> : null}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </ScrollView>

        <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <AnimatedButton
            title="Continue"
            onPress={handleNext}
            disabled={!selected}
            type="capsule"
            backgroundColor="#007AFF"
            shadowColor="#0066D6"
            fullWidth
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  headerSection: { paddingHorizontal: 24, paddingBottom: 24 },
  heroTitle: { fontSize: 34, fontWeight: '800', letterSpacing: -1, marginBottom: 8 },
  heroSubtitle: { fontSize: 17, fontWeight: '500', lineHeight: 24, opacity: 0.8 },

  scrollContent: { paddingHorizontal: 24, paddingBottom: 120 },
  optionsGap: { gap: 10 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cardDark: {
    backgroundColor: '#1C1C1E',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardSelected: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },

  iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  optionLabel: { fontSize: 17, fontWeight: '700', flex: 1 },

  check: { fontSize: 18, fontWeight: '900', color: '#007AFF' },

  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 24 },

  primaryBtn: {
    backgroundColor: '#007AFF',
    height: 56,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnDisabled: { backgroundColor: '#A2C9F4' },
  primaryBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: -0.41 },

  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  stepText: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  progressBar: { flex: 1, height: 4, backgroundColor: 'rgba(0,122,255,0.1)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
});
