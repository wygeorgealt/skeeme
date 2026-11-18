import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { BookOpen, CheckCircle, FileText, Layers } from 'lucide-react-native';
import { DASHBOARD_THEME } from './dashboardTokens';

interface LearningSpaceSectionProps {
    onSelectFeature?: (feature: 'notes' | 'flashcards' | 'summaries' | 'quizzes') => void;
}

export function LearningSpaceSection({ onSelectFeature }: LearningSpaceSectionProps) {
    const router = useRouter();

    const handlePress = (feature: 'notes' | 'flashcards' | 'summaries' | 'quizzes') => {
        if (onSelectFeature) {
            onSelectFeature(feature);
            return;
        }

        switch (feature) {
            case 'notes':
                router.push('/(drawer)/(tabs)/library');
                break;
            case 'flashcards':
                router.push('/(drawer)/flashcards/create');
                break;
            case 'summaries':
                router.push('/(drawer)/summary');
                break;
            case 'quizzes':
                router.push('/(drawer)/generate');
                break;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Your learning space</Text>
                <View style={styles.explorePill}>
                    <Text style={styles.exploreText}>Explore</Text>
                </View>
            </View>

            <View style={styles.grid}>
                {/* 1. My notes */}
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handlePress('notes')}
                    style={styles.card}
                    accessibilityRole="button"
                    accessibilityLabel="My notes: Create, upload and organise study materials"
                >
                    <View style={[styles.iconWrap, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}>
                        <FileText size={22} color={DASHBOARD_THEME.primary} strokeWidth={2.2} />
                    </View>
                    <Text style={styles.cardTitle}>My notes</Text>
                    <Text style={styles.cardDesc}>
                        Create, upload and organise study materials.
                    </Text>
                </TouchableOpacity>

                {/* 2. Flashcards */}
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handlePress('flashcards')}
                    style={styles.card}
                    accessibilityRole="button"
                    accessibilityLabel="Flashcards: Turn learning materials into revision cards"
                >
                    <View style={[styles.iconWrap, { backgroundColor: '#FDF4FF', borderColor: '#F5D0FE' }]}>
                        <Layers size={22} color="#A21CAF" strokeWidth={2.2} />
                    </View>
                    <Text style={styles.cardTitle}>Flashcards</Text>
                    <Text style={styles.cardDesc}>
                        Turn learning materials into revision cards.
                    </Text>
                </TouchableOpacity>

                {/* 3. Summaries */}
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handlePress('summaries')}
                    style={styles.card}
                    accessibilityRole="button"
                    accessibilityLabel="Summaries: Make complex materials easier to understand"
                >
                    <View style={[styles.iconWrap, { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' }]}>
                        <BookOpen size={22} color="#15803D" strokeWidth={2.2} />
                    </View>
                    <Text style={styles.cardTitle}>Summaries</Text>
                    <Text style={styles.cardDesc}>
                        Make complex materials easier to understand.
                    </Text>
                </TouchableOpacity>

                {/* 4. Quizzes */}
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handlePress('quizzes')}
                    style={styles.card}
                    accessibilityRole="button"
                    accessibilityLabel="Quizzes: Test understanding and identify knowledge gaps"
                >
                    <View style={[styles.iconWrap, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                        <CheckCircle size={22} color="#B45309" strokeWidth={2.2} />
                    </View>
                    <Text style={styles.cardTitle}>Quizzes</Text>
                    <Text style={styles.cardDesc}>
                        Test understanding and identify knowledge gaps.
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginBottom: 28,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sectionTitle: {
        fontFamily: 'Allo-Bold',
        fontSize: 18,
        color: DASHBOARD_THEME.text,
        letterSpacing: -0.3,
    },
    explorePill: {
        backgroundColor: '#EEF2F6',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
    },
    exploreText: {
        fontFamily: 'Allo-Medium',
        fontSize: 12,
        color: DASHBOARD_THEME.textSecondary,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    card: {
        width: '48%',
        backgroundColor: DASHBOARD_THEME.card,
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: DASHBOARD_THEME.borderLight,
        ...DASHBOARD_THEME.cardShadow,
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        marginBottom: 12,
    },
    cardTitle: {
        fontFamily: 'Allo-Bold',
        fontSize: 15.5,
        lineHeight: 20,
        color: DASHBOARD_THEME.text,
        letterSpacing: -0.2,
        marginBottom: 4,
    },
    cardDesc: {
        fontFamily: 'Allo-Regular',
        fontSize: 12.5,
        lineHeight: 17,
        color: DASHBOARD_THEME.textSecondary,
    },
});
