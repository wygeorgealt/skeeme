import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { CheckCircle } from '@solar-icons/react-native/Bold';
import { Colors } from '@/constants/theme';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

interface ProgressStagesProps {
    progressPercent: number;
    isDark: boolean;
}

const STAGES = [
    { threshold: 10, label: 'Reassess the question' },
    { threshold: 30, label: 'Searching relevant sources in library' },
    { threshold: 60, label: 'In-depth analysis' },
    { threshold: 90, label: 'Generating answer' }
];

export function ProgressStages({ progressPercent, isDark }: ProgressStagesProps) {
    const C = Colors[isDark ? 'dark' : 'light'];

    return (
        <View style={styles.container}>
            {STAGES.map((stage, index) => {
                const isActive = progressPercent >= stage.threshold && (index === STAGES.length - 1 || progressPercent < STAGES[index + 1].threshold);
                const isCompleted = index < STAGES.length - 1 && progressPercent >= STAGES[index + 1].threshold;
                const isPending = progressPercent < stage.threshold && !isActive;

                // Only show current and completed stages to mimic the screenshot
                if (isPending && !isActive) return null;

                return (
                    <Animated.View 
                        entering={SlideInDown.duration(300).delay(index * 100)}
                        key={index} 
                        style={styles.stageRow}
                    >
                        <View style={styles.iconContainer}>
                            {isCompleted ? (
                                <CheckCircle size={20} color={C.primary} />
                            ) : isActive ? (
                                <ActivityIndicator size="small" color={C.primary} />
                            ) : (
                                <View style={[styles.pendingCircle, { borderColor: isDark ? '#334155' : '#cbd5e1' }]} />
                            )}
                        </View>
                        <Text style={[
                            styles.label, 
                            { color: isDark ? '#cbd5e1' : '#475569' },
                            isActive && { color: isDark ? '#f8fafc' : '#0f172a', fontWeight: '600' }
                        ]}>
                            {stage.label}
                        </Text>
                    </Animated.View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        gap: 16,
    },
    stageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pendingCircle: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
    },
    label: {
        fontSize: 15,
        fontWeight: '500',
    }
});
