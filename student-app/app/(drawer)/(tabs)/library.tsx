import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Search, BookOpen, Layers, CheckCircle2, FileText, ArrowRight } from 'lucide-react-native';
import { DASHBOARD_THEME } from '@/components/dashboard/dashboardTokens';
import { useTabBarScroll } from '@/components/ui/TabBarScrollContext';

type FilterType = 'all' | 'notes' | 'summaries' | 'flashcards' | 'quizzes';

function isFilterType(value: unknown): value is FilterType {
    return value === 'all' || value === 'notes' || value === 'summaries' ||
        value === 'flashcards' || value === 'quizzes';
}

interface LibraryItem {
    id: string;
    title: string;
    type: 'notes' | 'summaries' | 'flashcards' | 'quizzes';
    typeLabel: string;
    metadata: string;
    date: string;
    route: string;
}

const SAMPLE_ITEMS: LibraryItem[] = [
    {
        id: '1',
        title: 'Introduction to Biology',
        type: 'notes',
        typeLabel: 'Notes',
        metadata: 'Cell structure & photosynthesis',
        date: 'Today',
        route: '/(drawer)/scan',
    },
    {
        id: '2',
        title: 'Cellular Respiration Overview',
        type: 'summaries',
        typeLabel: 'Summary',
        metadata: 'Glycolysis, Krebs cycle, ETC',
        date: 'Yesterday',
        route: '/(drawer)/summary',
    },
    {
        id: '3',
        title: 'Organic Chemistry Reactions',
        type: 'flashcards',
        typeLabel: 'Flashcards',
        metadata: '18 cards · 85% mastery',
        date: '2 days ago',
        route: '/(drawer)/flashcards/create',
    },
    {
        id: '4',
        title: 'Newtonian Mechanics Quiz',
        type: 'quizzes',
        typeLabel: 'Quiz',
        metadata: '10 questions · Practice test',
        date: '3 days ago',
        route: '/(drawer)/generate',
    },
];

export default function LibraryScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { filter } = useLocalSearchParams<{ filter?: string }>();
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
    const activeFilter = isFilterType(filter) ? filter : selectedFilter;
    const [searchQuery, setSearchQuery] = useState('');
    const handleScroll = useTabBarScroll('library');

    const filters: { id: FilterType; label: string }[] = [
        { id: 'all', label: 'All' },
        { id: 'notes', label: 'Notes' },
        { id: 'summaries', label: 'Summaries' },
        { id: 'flashcards', label: 'Flashcards' },
        { id: 'quizzes', label: 'Quizzes' },
    ];

    const filteredItems = SAMPLE_ITEMS.filter((item) => {
        const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getTypeIcon = (type: LibraryItem['type']) => {
        switch (type) {
            case 'notes':
                return <FileText size={18} color={DASHBOARD_THEME.primary} strokeWidth={2.2} />;
            case 'summaries':
                return <BookOpen size={18} color="#15803D" strokeWidth={2.2} />;
            case 'flashcards':
                return <Layers size={18} color="#A21CAF" strokeWidth={2.2} />;
            case 'quizzes':
                return <CheckCircle2 size={18} color="#B45309" strokeWidth={2.2} />;
        }
    };

    return (
        <View style={[styles.root, { backgroundColor: DASHBOARD_THEME.surface }]}>
            <StatusBar style="dark" />

            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 8 }]}>
                <Text style={styles.headerTitle}>Library</Text>
                <Text style={styles.headerSubtitle}>
                    All your notes, uploads, summaries, and quizzes in one place.
                </Text>

                {/* Search Bar */}
                <View style={styles.searchBar}>
                    <Search size={18} color={DASHBOARD_THEME.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search your library..."
                        placeholderTextColor={DASHBOARD_THEME.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Filter Pills */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterList}
                >
                    {filters.map((f) => {
                        const isActive = activeFilter === f.id;
                        return (
                            <TouchableOpacity
                                key={f.id}
                                activeOpacity={0.75}
                                onPress={() => {
                                    setSelectedFilter(f.id);
                                    if (isFilterType(filter)) router.setParams({ filter: '' });
                                }}
                                style={[styles.filterPill, isActive && styles.filterPillActive]}
                            >
                                <Text
                                    style={[
                                        styles.filterPillText,
                                        isActive && styles.filterPillTextActive,
                                    ]}
                                >
                                    {f.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Content List */}
            <ScrollView
                contentContainerStyle={[
                    styles.contentList,
                    { paddingBottom: Math.max(insets.bottom + 100, 120) },
                ]}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {filteredItems.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.8}
                        onPress={() => router.push(item.route as any)}
                        style={styles.card}
                    >
                        <View style={styles.cardHeader}>
                            <View style={styles.iconCircle}>{getTypeIcon(item.type)}</View>
                            <View style={styles.tagWrap}>
                                <Text style={styles.tagText}>{item.typeLabel}</Text>
                            </View>
                            <Text style={styles.dateText}>{item.date}</Text>
                        </View>

                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Text style={styles.itemMeta}>{item.metadata}</Text>

                        <View style={styles.cardFooter}>
                            <Text style={styles.openText}>Open</Text>
                            <ArrowRight size={14} color={DASHBOARD_THEME.primary} strokeWidth={2.5} />
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    header: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: DASHBOARD_THEME.borderLight,
    },
    headerTitle: {
        fontFamily: 'Allo-Bold',
        fontSize: 26,
        color: DASHBOARD_THEME.text,
        letterSpacing: -0.4,
    },
    headerSubtitle: {
        fontFamily: 'Allo-Regular',
        fontSize: 13.5,
        color: DASHBOARD_THEME.textSecondary,
        marginTop: 4,
        marginBottom: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 42,
        borderWidth: 1,
        borderColor: DASHBOARD_THEME.borderLight,
        marginBottom: 14,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'Allo-Regular',
        fontSize: 14,
        color: DASHBOARD_THEME.text,
        paddingVertical: 0,
    },
    filterList: {
        gap: 8,
    },
    filterPill: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
    },
    filterPillActive: {
        backgroundColor: DASHBOARD_THEME.primary,
    },
    filterPillText: {
        fontFamily: 'Allo-Medium',
        fontSize: 13,
        color: DASHBOARD_THEME.textSecondary,
    },
    filterPillTextActive: {
        fontFamily: 'Allo-Bold',
        color: '#FFFFFF',
    },
    contentList: {
        padding: 20,
        gap: 12,
    },
    card: {
        backgroundColor: DASHBOARD_THEME.card,
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: DASHBOARD_THEME.borderLight,
        ...DASHBOARD_THEME.cardShadow,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    tagWrap: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        backgroundColor: '#EEF2F6',
        marginRight: 'auto',
    },
    tagText: {
        fontFamily: 'Allo-Bold',
        fontSize: 11,
        color: DASHBOARD_THEME.text,
    },
    dateText: {
        fontFamily: 'Allo-Regular',
        fontSize: 12,
        color: DASHBOARD_THEME.textMuted,
    },
    itemTitle: {
        fontFamily: 'Allo-Bold',
        fontSize: 16,
        color: DASHBOARD_THEME.text,
        lineHeight: 21,
    },
    itemMeta: {
        fontFamily: 'Allo-Regular',
        fontSize: 13,
        color: DASHBOARD_THEME.textSecondary,
        marginTop: 3,
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 'auto',
    },
    openText: {
        fontFamily: 'Allo-Bold',
        fontSize: 13,
        color: DASHBOARD_THEME.primary,
    },
});
