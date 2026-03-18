import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { api } from '@/lib/api';

interface CreditSummary {
    current_credits: number;
    plan: string;
    weekly_refresh_in_days: number | null;
    estimated_actions_remaining: {
        scans: number;
        quizzes_10q: number;
        flashcard_decks_20c: number;
    };
    credit_percentage: number;
}

interface CreditStatusBarProps {
    /** The action the user is about to take, to show inline cost estimate */
    activeAction?: 'scan' | 'quiz' | 'flashcard' | null;
    /** Called when summary is fetched so parent can read credits */
    onSummaryLoaded?: (summary: CreditSummary) => void;
    /** External trigger to refetch (increment to refetch) */
    refreshKey?: number;
}

export default function CreditStatusBar({ activeAction, onSummaryLoaded, refreshKey }: CreditStatusBarProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [summary, setSummary] = useState<CreditSummary | null>(null);

    const fetchSummary = useCallback(async () => {
        try {
            const res = await api.get('credits/summary');
            setSummary(res.data);
            onSummaryLoaded?.(res.data);
        } catch {
            // Silently fail — don't block the user
        }
    }, [onSummaryLoaded]);

    useEffect(() => {
        fetchSummary();
    }, [refreshKey, fetchSummary]);

    if (!summary) return null;

    const { current_credits, credit_percentage, estimated_actions_remaining, weekly_refresh_in_days } = summary;

    // Color coding based on percentage
    const getColor = () => {
        if (credit_percentage > 30) return '#2EBD85'; // Green
        if (credit_percentage > 10) return '#F59E0B'; // Amber
        return '#EF4444'; // Red
    };

    const color = getColor();

    // Inline action cost estimate
    const actionInfo: Record<string, { cost: string; remaining: number; label: string }> = {
        scan: { cost: '~10', remaining: estimated_actions_remaining.scans, label: 'scans' },
        quiz: { cost: '~15', remaining: estimated_actions_remaining.quizzes_10q, label: 'quizzes' },
        flashcard: { cost: '~35', remaining: estimated_actions_remaining.flashcard_decks_20c, label: 'decks' },
    };

    const activeInfo = activeAction ? actionInfo[activeAction] : null;

    return (
        <View
            style={{
                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(241, 245, 249, 0.9)',
                borderRadius: 16,
                padding: 14,
                marginHorizontal: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: isDark ? `${color}33` : `${color}22`,
            }}
        >
            {/* Credits Row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
                    <Text style={{ color: isDark ? '#F1F5F9' : '#1E293B', fontWeight: '800', fontSize: 15 }}>
                        {current_credits.toLocaleString()} credits
                    </Text>
                </View>
                {weekly_refresh_in_days !== null && (
                    <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 12, fontWeight: '600' }}>
                        Refill in {weekly_refresh_in_days}d
                    </Text>
                )}
            </View>

            {/* Progress bar */}
            <View style={{ height: 4, backgroundColor: isDark ? '#334155' : '#E2E8F0', borderRadius: 2, marginTop: 10 }}>
                <View style={{ height: 4, backgroundColor: color, borderRadius: 2, width: `${Math.min(100, credit_percentage)}%` }} />
            </View>

            {/* Inline action cost */}
            {activeInfo && (
                <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: isDark ? '#CBD5E1' : '#475569', fontSize: 12, fontWeight: '600' }}>
                        This costs {activeInfo.cost} credits
                    </Text>
                    <Text style={{ color, fontSize: 12, fontWeight: '700' }}>
                        ~{activeInfo.remaining} more {activeInfo.label}
                    </Text>
                </View>
            )}
        </View>
    );
}
