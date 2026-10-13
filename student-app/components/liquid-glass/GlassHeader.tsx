import { StyleSheet, Text, View } from 'react-native';
import { GlassButton } from './GlassButton';
export function GlassHeader({ name, onProfile }: { name?: string; onProfile: () => void }) { return <View style={styles.row}><View><Text style={styles.kicker}>YOUR LEARNING SPACE</Text><Text style={styles.title}>Good to see you{name ? `, ${name.split(' ')[0]}` : ''}.</Text></View><GlassButton variant="icon" icon="User" onPress={onProfile} /></View>; }
const styles = StyleSheet.create({ row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, kicker: { fontSize: 11, fontWeight: '800', letterSpacing: 1.1, color: '#3977B9', marginBottom: 5 }, title: { color: '#102748', fontSize: 27, fontWeight: '800', letterSpacing: -.7 } });
