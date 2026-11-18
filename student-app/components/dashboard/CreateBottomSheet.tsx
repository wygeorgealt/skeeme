import { Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { KubaiNativeIcon } from '@/components/ui/KubaiNativeIcon';
import { DASHBOARD_THEME } from './dashboardTokens';

interface CreateBottomSheetProps {
    visible: boolean;
    onClose: () => void;
}

export function CreateBottomSheet({ visible, onClose }: CreateBottomSheetProps) {
    const router = useRouter();

    const handleAction = (route: string) => {
        onClose();
        setTimeout(() => {
            router.push(route as any);
        }, 150);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.sheet}>
                            {/* Handle & Close */}
                            <View style={styles.headerRow}>
                                <View style={styles.handleBar} />
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={onClose}
                                    style={styles.closeButton}
                                    accessibilityLabel="Close sheet"
                                >
                                    <KubaiNativeIcon
                                        name="close"
                                        size={20}
                                        color={DASHBOARD_THEME.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Title & Subtitle */}
                            <Text style={styles.title}>What would you like to create?</Text>
                            <Text style={styles.subtitle}>
                                Let&apos;s turn your materials into bright ideas.
                            </Text>

                            {/* Action List */}
                            <View style={styles.actionList}>
                                {/* 1. New notes */}
                                <TouchableOpacity
                                    activeOpacity={0.75}
                                    onPress={() => handleAction('/(drawer)/(tabs)/library')}
                                    style={styles.actionRow}
                                >
                                    <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
                                        <KubaiNativeIcon
                                            name="newNote"
                                            size={20}
                                            color={DASHBOARD_THEME.primary}
                                        />
                                    </View>
                                    <View style={styles.actionTextCol}>
                                        <Text style={styles.actionTitle}>New notes</Text>
                                        <Text style={styles.actionSubtitle}>Start writing your ideas</Text>
                                    </View>
                                </TouchableOpacity>

                                {/* 2. Upload material */}
                                <TouchableOpacity
                                    activeOpacity={0.75}
                                    onPress={() => handleAction('/(drawer)/scan')}
                                    style={styles.actionRow}
                                >
                                    <View style={[styles.iconCircle, { backgroundColor: '#FFFBEA' }]}>
                                        <KubaiNativeIcon
                                            name="upload"
                                            size={20}
                                            color="#B45309"
                                        />
                                    </View>
                                    <View style={styles.actionTextCol}>
                                        <Text style={styles.actionTitle}>Upload material</Text>
                                        <Text style={styles.actionSubtitle}>Bring in your study documents</Text>
                                    </View>
                                </TouchableOpacity>

                                {/* 3. Generate summary */}
                                <TouchableOpacity
                                    activeOpacity={0.75}
                                    onPress={() => handleAction('/(drawer)/summary')}
                                    style={styles.actionRow}
                                >
                                    <View style={[styles.iconCircle, { backgroundColor: '#F0FDF4' }]}>
                                        <KubaiNativeIcon
                                            name="summary"
                                            size={20}
                                            color="#15803D"
                                        />
                                    </View>
                                    <View style={styles.actionTextCol}>
                                        <Text style={styles.actionTitle}>Generate summary</Text>
                                        <Text style={styles.actionSubtitle}>Understand your material faster</Text>
                                    </View>
                                </TouchableOpacity>

                                {/* 4. Create flashcards */}
                                <TouchableOpacity
                                    activeOpacity={0.75}
                                    onPress={() => handleAction('/(drawer)/flashcards/create')}
                                    style={styles.actionRow}
                                >
                                    <View style={[styles.iconCircle, { backgroundColor: '#FDF4FF' }]}>
                                        <KubaiNativeIcon
                                            name="flashcards"
                                            size={20}
                                            color="#A21CAF"
                                        />
                                    </View>
                                    <View style={styles.actionTextCol}>
                                        <Text style={styles.actionTitle}>Create flashcards</Text>
                                        <Text style={styles.actionSubtitle}>Build your revision deck</Text>
                                    </View>
                                </TouchableOpacity>

                                {/* 5. Create a quiz */}
                                <TouchableOpacity
                                    activeOpacity={0.75}
                                    onPress={() => handleAction('/(drawer)/generate')}
                                    style={styles.actionRow}
                                >
                                    <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
                                        <KubaiNativeIcon
                                            name="quiz"
                                            size={20}
                                            color={DASHBOARD_THEME.primary}
                                        />
                                    </View>
                                    <View style={styles.actionTextCol}>
                                        <Text style={styles.actionTitle}>Create a quiz</Text>
                                        <Text style={styles.actionSubtitle}>Challenge your understanding</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: DASHBOARD_THEME.card,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 40,
        ...DASHBOARD_THEME.cardShadow,
    },
    headerRow: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginBottom: 16,
    },
    handleBar: {
        width: 38,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#CBD5E1',
    },
    closeButton: {
        position: 'absolute',
        right: 0,
        top: -4,
        padding: 4,
    },
    title: {
        fontFamily: 'Allo-Bold',
        fontSize: 21,
        lineHeight: 26,
        color: DASHBOARD_THEME.text,
        letterSpacing: -0.3,
    },
    subtitle: {
        fontFamily: 'Allo-Medium',
        fontSize: 14,
        color: DASHBOARD_THEME.textSecondary,
        marginTop: 4,
        marginBottom: 20,
    },
    actionList: {
        gap: 10,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 16,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: DASHBOARD_THEME.borderLight,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    actionTextCol: {
        flex: 1,
    },
    actionTitle: {
        fontFamily: 'Allo-Bold',
        fontSize: 15.5,
        color: DASHBOARD_THEME.text,
    },
    actionSubtitle: {
        fontFamily: 'Allo-Regular',
        fontSize: 12.5,
        color: DASHBOARD_THEME.textSecondary,
        marginTop: 2,
    },
});
