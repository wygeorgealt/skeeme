import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Icon } from '@/components/ui/Icon';
import { ArrowRight, BookOpen, Layers, FileText, CheckCircle2 } from 'lucide-react-native';
import { DASHBOARD_THEME } from './dashboardTokens';

export interface RecentStudyItem {
    id: string;
    title: string;
    type: 'notes' | 'flashcards' | 'summary' | 'quiz';
    subtitle: string;
    lastAccessed: string;
    progress?: {
        current: number;
        total: number;
        label?: string;
    };
    route: string;
}

interface RecentActivitySectionProps {
    items?: RecentStudyItem[];
    onSeeAll?: () => void;
}

export function RecentActivitySection({
    items = [],
    onSeeAll,
}: RecentActivitySectionProps) {
    const router = useRouter();

    const handleSeeAll = () => {
        if (onSeeAll) onSeeAll();
        else router.push('/(drawer)/(tabs)/library');
    };

    const getTypeIcon = (type: RecentStudyItem['type']) => {
        switch (type) {
            case 'notes':
                return <FileText size={18} color={DASHBOARD_THEME.primary} strokeWidth={2.2} />;
            case 'flashcards':
                return <Layers size={18} color={DASHBOARD_THEME.primary} strokeWidth={2.2} />;
            case 'summary':
                return <BookOpen size={18} color={DASHBOARD_THEME.primary} strokeWidth={2.2} />;
            case 'quiz':
                return <CheckCircle2 size={18} color={DASHBOARD_THEME.primary} strokeWidth={2.2} />;
            default:
                return <FileText size={18} color={DASHBOARD_THEME.primary} strokeWidth={2.2} />;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Pick up where you left off</Text>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleSeeAll}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Text style={styles.seeAllText}>See all</Text>
                </TouchableOpacity>
            </View>

            {items.length === 0 ? (
                /* Empty / Starter State */
                <View style={styles.card}>
                    <View style={styles.cardContent}>
                        <View style={styles.iconCircle}>
                            <FileText size={20} color={DASHBOARD_THEME.primary} strokeWidth={2.2} />
                        </View>
                        <View style={styles.infoCol}>
                            <Text style={styles.itemTitle}>Introduction to Biology</Text>
                            <Text style={styles.itemMeta}>Notes · Recently opened</Text>
                            <Text style={styles.itemStatus}>Last position saved</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => router.push('/(drawer)/(tabs)/library')}
                        style={styles.continueButton}
                    >
                        <Text style={styles.continueText}>Continue</Text>
                        <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>
            ) : (
                items.slice(0, 3).map((item) => (
                    <View key={item.id} style={styles.card}>
                        <View style={styles.cardContent}>
                            <View style={styles.iconCircle}>{getTypeIcon(item.type)}</View>
                            <View style={styles.infoCol}>
                                <Text style={styles.itemTitle} numberOfLines={1}>
                                    {item.title}
                                </Text>
                                <Text style={styles.itemMeta}>{item.subtitle}</Text>
                                {item.progress ? (
                                    <View style={styles.progressRow}>
                                        <View style={styles.progressBarTrack}>
                                            <View
                                                style={[
                                                    styles.progressBarFill,
                                                    {
                                                        width: `${Math.min(
                                                            100,
                                                            Math.max(
                                                                8,
                                                                (item.progress.current / item.progress.total) *
                                                                    100,
                                                            ),
                                                        )}%`,
                                                    },
                                                ]}
                                            />
                                        </View>
                                        <Text style={styles.progressLabel}>
                                            {item.progress.label ||
                                                `${item.progress.current}/${item.progress.total}`}
                                        </Text>
                                    </View>
                                ) : (
                                    <Text style={styles.itemStatus}>{item.lastAccessed}</Text>
                                )}
                            </View>
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => router.push(item.route as any)}
                            style={styles.continueButton}
                        >
                            <Text style={styles.continueText}>Continue</Text>
                            <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.5} />
                        </TouchableOpacity>
                    </View>
                ))
            )}
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
    seeAllText: {
        fontFamily: 'Allo-Bold',
        fontSize: 14,
        color: DASHBOARD_THEME.primary,
    },
    card: {
        backgroundColor: DASHBOARD_THEME.card,
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: DASHBOARD_THEME.borderLight,
        ...DASHBOARD_THEME.cardShadow,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 14,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    infoCol: {
        flex: 1,
    },
    itemTitle: {
        fontFamily: 'Allo-Bold',
        fontSize: 16,
        lineHeight: 21,
        color: DASHBOARD_THEME.text,
        letterSpacing: -0.2,
    },
    itemMeta: {
        fontFamily: 'Allo-Medium',
        fontSize: 13,
        color: DASHBOARD_THEME.textSecondary,
        marginTop: 2,
    },
    itemStatus: {
        fontFamily: 'Allo-Regular',
        fontSize: 12,
        color: DASHBOARD_THEME.textMuted,
        marginTop: 4,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 6,
    },
    progressBarTrack: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#F1F5F9',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: DASHBOARD_THEME.primary,
        borderRadius: 3,
    },
    progressLabel: {
        fontFamily: 'Allo-Medium',
        fontSize: 11,
        color: DASHBOARD_THEME.textSecondary,
    },
    continueButton: {
        backgroundColor: DASHBOARD_THEME.primary,
        borderRadius: 12,
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    continueText: {
        fontFamily: 'Allo-Bold',
        fontSize: 14.5,
        color: '#FFFFFF',
    },
});
