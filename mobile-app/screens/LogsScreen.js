import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, useColorScheme, Text, TouchableOpacity } from 'react-native';
import { getLogs, getErrors } from '../services/api';
import { theme } from '../constants/theme';

export default function LogsScreen() {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [content, setContent] = useState('');
    const [errors, setErrors] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const fetchData = async () => {
        try {
            if (selectedIndex === 0) {
                const data = await getLogs(200);
                setContent(data.content);
            } else {
                const data = await getErrors();
                setErrors(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, [selectedIndex]);

    useEffect(() => {
        fetchData();
    }, [selectedIndex]);

    return (
        <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
            <View style={styles.header}>
                <View style={[styles.segmentedControl, isDark ? styles.segmentedControlDark : styles.segmentedControlLight]}>
                    <TouchableOpacity
                        onPress={() => setSelectedIndex(0)}
                        style={[styles.segment, selectedIndex === 0 && styles.segmentActive]}
                    >
                        <Text style={[styles.segmentText, selectedIndex === 0 ? styles.segmentTextActive : (isDark ? styles.buttonTextDark : styles.buttonTextLight)]}>Live Logs</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setSelectedIndex(1)}
                        style={[styles.segment, selectedIndex === 1 && styles.segmentActive]}
                    >
                        <Text style={[styles.segmentText, selectedIndex === 1 ? styles.segmentTextActive : (isDark ? styles.buttonTextDark : styles.buttonTextLight)]}>Errors</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? '#fff' : '#000'} />}
            >
                {selectedIndex === 0 ? (
                    <View style={styles.logContainer}>
                        <Text style={styles.logText}>{content || 'No logs found.'}</Text>
                    </View>
                ) : (
                    <View style={styles.errorContainer}>
                        {errors.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.noErrorIcon}>👍</Text>
                                <Text style={[styles.noErrorText, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
                                    No recent errors found. System is healthy.
                                </Text>
                            </View>
                        ) : (
                            errors.map((error, i) => (
                                <View key={i} style={[styles.errorItem, isDark ? styles.errorItemDark : styles.errorItemLight]}>
                                    <View style={styles.errorIndicator} />
                                    <Text style={[styles.errorText, isDark ? styles.textDark : styles.textLight]}>{error}</Text>
                                </View>
                            ))
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    containerLight: { backgroundColor: '#f4f4f5' },
    containerDark: { backgroundColor: '#18181b' },

    header: { padding: 16, paddingBottom: 8 },
    segmentedControl: {
        height: 44,
        borderRadius: 8,
        flexDirection: 'row',
        padding: 4,
    },
    segmentedControlLight: { backgroundColor: '#e4e4e7' },
    segmentedControlDark: { backgroundColor: '#27272a' },
    segment: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
    },
    segmentActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    segmentText: { fontSize: 13, fontWeight: '600' },
    segmentTextActive: { color: '#18181b' },

    buttonTextLight: { color: '#71717a' },
    buttonTextDark: { color: '#a1a1aa' },

    scrollView: { flex: 1, paddingHorizontal: 16 },

    logContainer: {
        padding: 16,
        backgroundColor: '#1e1e1e',
        borderRadius: 12,
        minHeight: 500,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    logText: {
        fontFamily: 'monospace',
        color: '#10b981',
        fontSize: 12,
        lineHeight: 18,
    },

    errorContainer: { paddingBottom: 20 },
    errorItem: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderWidth: 1,
        position: 'relative',
        overflow: 'hidden',
    },
    errorItemLight: { backgroundColor: '#fff', borderColor: '#fee2e2' },
    errorItemDark: { backgroundColor: '#27272a', borderColor: '#450a0a' },

    errorIndicator: {
        width: 4,
        height: '200%',
        backgroundColor: '#ef4444',
        position: 'absolute',
        left: 0,
        top: 0,
    },
    errorText: {
        fontSize: 12,
        lineHeight: 18,
        marginLeft: 8,
        fontFamily: 'monospace',
    },

    emptyState: { alignItems: 'center', padding: 40 },
    noErrorIcon: { fontSize: 40, marginBottom: 16 },
    noErrorText: { textAlign: 'center' },

    textLight: { color: theme.colors.textPrimaryLight },
    textDark: { color: theme.colors.textPrimaryDark },
    textSecondaryLight: { color: theme.colors.textSecondaryLight },
    textSecondaryDark: { color: theme.colors.textSecondaryDark },
});
