import { Text } from '@/components/ui/Text';
import { View, ScrollView, RefreshControl, useColorScheme, StyleSheet, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { IosCard } from '@/components/ui/IosCard';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AddCircle, Calendar, TrashBinTrash } from '@solar-icons/react-native/Bold';

export default function ExamsScreen() {
    const { user, updateUser } = useAuthStore();
    const queryClient = useQueryClient();
    const insets = useSafeAreaInsets();
    const isDark = useColorScheme() === 'dark';
    const C = Colors[isDark ? 'dark' : 'light'];
    const [animKey, setAnimKey] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDate, setNewDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    const [showDatePicker, setShowDatePicker] = useState(false);

    useFocusEffect(
        useCallback(() => {
            setAnimKey(prev => prev + 1);
        }, [])
    );

    const { data: exams = [], isLoading, refetch } = useQuery({
        queryKey: ['user-exams'],
        queryFn: async () => {
            const res = await api.get('user-exams');
            return res.data;
        },
    });

    const addMutation = useMutation({
        mutationFn: async (data: { title: string, exam_date: string }) => {
            return api.post('user-exams', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-exams'] });
            queryClient.invalidateQueries({ queryKey: ['me'] });
            setIsModalOpen(false);
            setNewTitle('');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            return api.delete(`user-exams/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-exams'] });
            queryClient.invalidateQueries({ queryKey: ['me'] });
        }
    });

    const handleAdd = () => {
        if (!newTitle.trim()) {
            Alert.alert('Error', 'Please enter a title for the exam.');
            return;
        }
        addMutation.mutate({
            title: newTitle,
            exam_date: newDate.toISOString(),
        });
    };

    const handleDelete = (id: number) => {
        Alert.alert('Delete Exam', 'Are you sure you want to remove this exam date?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) }
        ]);
    };

    const onRefresh = useCallback(async () => {
        await refetch();
    }, [refetch]);

    const textColor = isDark ? '#FFFFFF' : '#000000';

    return (
        <View style={{ flex: 1, backgroundColor: C.background }}>
            <ScrollView 
                contentContainerStyle={[s.scroll, { paddingTop: insets.top + Spacing.sm, paddingBottom: 120 }]}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={C.primary} />}
            >
                <Animated.View key={`header-${animKey}`} entering={FadeInUp.duration(500)} style={s.header}>
                    <View>
                        <Text style={[s.title, { color: textColor }]}>Your Exams</Text>
                        <Text style={[s.subtitle, { color: C.textSecondary }]}>Track your upcoming tests and reminders</Text>
                    </View>
                    <TouchableOpacity 
                        onPress={() => setIsModalOpen(true)}
                        style={[s.addBtn, { backgroundColor: C.primary }]}
                    >
                        <AddCircle size={20} color="#FFF" />
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View key={`exams-${animKey}`} entering={FadeInDown.delay(80).duration(400)}>
                    {exams.length === 0 ? (
                        <View style={s.emptyState}>
                            <Calendar size={64} color={C.textTertiary} />
                            <Text style={[s.emptyText, { color: C.textSecondary }]}>No upcoming exams set.</Text>
                        </View>
                    ) : (
                        exams.map((exam: any) => {
                            const daysLeft = Math.ceil((new Date(exam.exam_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            return (
                                <IosCard key={exam.id} style={s.examCard} padding="md">
                                    <View style={s.examRow}>
                                        <View style={[s.examIcon, { backgroundColor: C.primary + '15' }]}>
                                            <Calendar size={20} color={C.primary} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[s.examTitle, { color: textColor }]}>{exam.title}</Text>
                                            <Text style={[s.examDate, { color: C.textSecondary }]}>
                                                {new Date(exam.exam_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                            </Text>
                                        </View>
                                        <View style={s.daysBox}>
                                            <Text style={[s.daysNum, { color: C.primary }]}>{daysLeft < 0 ? 0 : daysLeft}</Text>
                                            <Text style={[s.daysLabel, { color: C.textSecondary }]}>days left</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => handleDelete(exam.id)} style={s.deleteBtn}>
                                            <TrashBinTrash size={20} color="#FF3B30" />
                                        </TouchableOpacity>
                                    </View>
                                </IosCard>
                            );
                        })
                    )}
                </Animated.View>
            </ScrollView>

            <Modal visible={isModalOpen} animationType="slide" transparent>
                <View style={s.modalOverlay}>
                    <View style={[s.modalContent, { backgroundColor: C.secondaryBackground }]}>
                        <Text style={[s.modalTitle, { color: textColor }]}>Add New Exam</Text>
                        
                        <Text style={[s.inputLabel, { color: C.textSecondary }]}>Exam Title</Text>
                        <TextInput 
                            value={newTitle}
                            onChangeText={setNewTitle}
                            placeholder="e.g. Final Math Exam"
                            placeholderTextColor={C.textTertiary}
                            style={[s.input, { color: textColor, borderColor: C.separator, backgroundColor: C.card }]}
                        />

                        <Text style={[s.inputLabel, { color: C.textSecondary }]}>Exam Date</Text>
                        <DateTimePicker
                            value={newDate}
                            mode="date"
                            display="spinner"
                            onChange={(e, d) => d && setNewDate(d)}
                            minimumDate={new Date()}
                            textColor={textColor}
                            style={{ height: 120 }}
                        />

                        <View style={s.modalActions}>
                            <TouchableOpacity onPress={() => setIsModalOpen(false)} style={s.cancelBtn}>
                                <Text style={[s.cancelBtnText, { color: C.textSecondary }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={handleAdd} 
                                style={[s.saveBtn, { backgroundColor: C.primary }]}
                                disabled={addMutation.isPending}
                            >
                                <Text style={s.saveBtnText}>{addMutation.isPending ? 'Saving...' : 'Add Exam'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const s = StyleSheet.create({
    scroll: { paddingHorizontal: Spacing.md, paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 12 },
    title: { fontSize: 28, fontWeight: '800' },
    subtitle: { fontSize: 14, marginTop: 4 },
    addBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
    
    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100, gap: 16 },
    emptyText: { fontSize: 16, fontWeight: '500' },

    examCard: { marginBottom: 12 },
    examRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    examIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    examTitle: { fontSize: 17, fontWeight: '700', marginBottom: 2 },
    examDate: { fontSize: 13, fontWeight: '500' },
    daysBox: { alignItems: 'center', paddingHorizontal: 12, borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: 'rgba(0,0,0,0.1)' },
    daysNum: { fontSize: 20, fontWeight: '800' },
    daysLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
    deleteBtn: { padding: 4 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
    modalTitle: { fontSize: 24, fontWeight: '800', marginBottom: 24 },
    inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', marginLeft: 4 },
    input: { height: 56, borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, fontSize: 17, marginBottom: 24 },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
    cancelBtn: { flex: 1, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    cancelBtnText: { fontSize: 17, fontWeight: '600' },
    saveBtn: { flex: 1.5, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    saveBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});