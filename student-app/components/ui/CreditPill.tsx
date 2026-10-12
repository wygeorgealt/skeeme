import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

interface CreditPillProps { credits?: number; onPress: () => void; }

export function CreditPill({ credits = 0, onPress }: CreditPillProps) {
  const isDark = useColorScheme() === 'dark';
  return <Pressable accessibilityRole="button" accessibilityLabel={`${credits} credits. View balance`} onPress={onPress} style={({ pressed }) => [styles.pill, isDark && styles.dark, pressed && styles.pressed]}><View style={styles.sparkle}><Ionicons name="sparkles" color="#007AFF" size={14} /></View><Text style={[styles.value, isDark && styles.valueDark]}>{credits.toLocaleString()}</Text><Ionicons name="chevron-forward" color={isDark ? '#A5C9F3' : '#3679BC'} size={14} /></Pressable>;
}
const styles = StyleSheet.create({ pill: { height: 40, paddingHorizontal: 8, paddingRight: 10, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(246,250,255,.88)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,.48)' }, dark: { backgroundColor: 'rgba(18,29,44,.78)', borderColor: 'rgba(173,211,255,.2)' }, sparkle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#DCEEFF', alignItems: 'center', justifyContent: 'center' }, value: { color: '#125A9F', fontSize: 14, fontWeight: '800', fontVariant: ['tabular-nums'] }, valueDark: { color: '#E7F3FF' }, pressed: { transform: [{ scale: .97 }], opacity: .84 } });
