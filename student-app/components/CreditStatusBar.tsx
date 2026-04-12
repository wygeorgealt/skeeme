import { Text } from '@/components/ui/Text';
import React, { useEffect, useState, useCallback } from 'react';
import { View, useColorScheme } from 'react-native';
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

    if (!summary) {
        return (
            <View
                style={{
                    backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(241, 245, 249, 0.9)',
                    borderRadius: 16,
                    padding: 14,
                    marginHorizontal: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: isDark ? `rgba(255,255,255,0.05)` : `rgba(0,0,0,0.05)`,
                }}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: isDark ? '#334155' : '#CBD5E1' }} />
                        <View style={{ backgroundColor: isDark ? '#334155' : '#E2E8F0', height: 16, width: 90, borderRadius: 4 }} />
                    </View>
                    <View style={{ backgroundColor: isDark ? '#334155' : '#E2E8F0', height: 14, width: 60, borderRadius: 4 }} />
                </View>
                <View style={{ height: 4, backgroundColor: isDark ? '#334155' : '#E2E8F0', borderRadius: 2, marginTop: 10 }} />
                
                {activeAction && (
                    <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ backgroundColor: isDark ? '#334155' : '#E2E8F0', height: 14, width: 110, borderRadius: 4 }} />
                        <View style={{ backgroundColor: isDark ? '#334155' : '#E2E8F0', height: 14, width: 80, borderRadius: 4 }} />
                    </View>
                )}
            </View>
        );
    }

    const { current_credits, credit_percentage, estimated_actions_remaining, weekly_refresh_in_days } = summary;

    // Color coding based on percentage
    const { pricingConfig } = require('@/store/authStore').useAuthStore();

    // Color coding based on percentage
    const getColor = () => {
        if (credit_percentage > 50) return '#A1C4FD'; // Green/Blue
        if (credit_percentage >= 20) return '#F59E0B'; // Amber (Show warning at 20%)
        return '#EF4444'; // Red
    };

    const color = getColor();

    const rates = pricingConfig?.rates || { scan_solve: 25, quiz_base: 1, flashcard_base: 1 };

    // Inline action cost estimate
    const actionInfo: Record<string, { cost: string; remaining: number; label: string }> = {
        scan: { cost: `~${rates.scan_solve}`, remaining: estimated_actions_remaining.scans, label: 'scans' },
        quiz: { cost: `~${rates.quiz_base}`, remaining: estimated_actions_remaining.quizzes_10q, label: 'quizzes' },
        flashcard: { cost: `~${rates.flashcard_base}`, remaining: estimated_actions_remaining.flashcard_decks_20c, label: 'decks' },
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
