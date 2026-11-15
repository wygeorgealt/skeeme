import DateTimePicker from '@react-native-community/datetimepicker'; import { Platform, StyleSheet, View } from 'react-native'; import { useStudyUi } from './AppContext';
import { Text } from '@/components/ui/Text';
export function DateTimeSection() { const { reminderTime, setReminderTime } = useStudyUi(); return <View style={styles.row}><Text style={styles.label}>Daily reminder</Text><DateTimePicker value={reminderTime} mode="time" display={Platform.OS === 'ios' ? 'compact' : 'default'} onValueChange={(_, date) => setReminderTime(date)} /></View>; }
const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, label: { color: '#214262', fontWeight: '700', fontSize: 14 } });
