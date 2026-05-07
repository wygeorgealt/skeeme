import { Text } from '@/components/ui/Text';
import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { LinearGradient } from 'expo-linear-gradient';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { FireIcon, Medal01Icon, SparklesIcon } from '@hugeicons/core-free-icons';

const GRADIENTS = [
    ['#FF5F6D', '#FFC371'], // Sweet Morning (Orange/Yellow)
    ['#8B5CF6', '#6366F1'], // Skeeme Default (Indigo/Purple)
    ['#00c6ff', '#0072ff'], // Blue Water
    ['#f12711', '#f5af19'], // Flare
    ['#834d9b', '#d04ed6'], // Suzie
    ['#11998e', '#38ef7d'], // Emerald
    ['#ec008c', '#fc6767'], // Pink
] as const;

export interface ShareCardProps {
    type: 'streak' | 'quiz';
    data: {
        current_streak?: number;
        score_percentage?: number;
        topic?: string;
    };
    viewShotRef: React.RefObject<any>;
}

export const ShareCard = ({ type, data, viewShotRef }: ShareCardProps) => {
    const randomGradient = useMemo(() => {
        const randomIndex = Math.floor(Math.random() * GRADIENTS.length);
        return GRADIENTS[randomIndex];
    }, [data]);

    return (
        <View style={styles.offscreenContainer}>
            <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 1 }}>
                <LinearGradient
                    colors={randomGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                >
                    {/* Watermark/Background Graphic */}
                    <View style={styles.watermark}>
                        {type === 'streak' ? (
                            <HugeiconsIcon icon={FireIcon} size={280} color="rgba(255,255,255,0.12)" />
                        ) : (
                            <HugeiconsIcon icon={Medal01Icon} size={280} color="rgba(255,255,255,0.12)" />
                        )}
                    </View>

                    <View style={styles.content}>
                        {type === 'streak' ? (
                            <>
                                <Text style={styles.headerText}>I'm on a</Text>
                                <Text 
                                    style={[
                                        styles.mainNumber, 
                                        { fontSize: (data.current_streak || 0) > 99 ? 120 : 150 }
                                    ]}
                                >
                                    {data.current_streak}
                                </Text>
                                <Text style={styles.subText}>day learning streak!</Text>
                            </>
                        ) : (
                            <>
                                <Text style={styles.headerText}>I scored</Text>
                                <Text style={styles.mainNumber}>{data.score_percentage}%</Text>
                                <Text style={styles.subText} numberOfLines={2}>on {data.topic}!</Text>
                            </>
                        )}
                    </View>

                    <View style={styles.footer}>
                        <View style={styles.brandRow}>
                            <HugeiconsIcon icon={SparklesIcon} size={20} color="white" />
                            <Text style={styles.brandName}>skeeme</Text>
                        </View>
                    </View>
                </LinearGradient>
            </ViewShot>
        </View>
    );
};

const styles = StyleSheet.create({
    offscreenContainer: {
        position: 'absolute',
        top: -10000,
        left: -10000,
    },
    card: {
        width: 360,
        height: 450, // 4:5 ratio, perfect for Insta/WhatsApp
        justifyContent: 'space-between',
        padding: 32,
        overflow: 'hidden',
    },
    watermark: {
        position: 'absolute',
        right: -60,
        bottom: -20,
        transform: [{ rotate: '-15deg' }],
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    headerText: {
        fontSize: 32,
        fontWeight: '800',
        color: 'white',
        letterSpacing: -0.5,
        opacity: 0.9,
    },
    mainNumber: {
        fontWeight: '900',
        color: 'white',
        letterSpacing: -4,
        lineHeight: 160,
        textShadowColor: 'rgba(0,0,0,0.15)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 15,
        marginTop: -10,
    },
    subText: {
        fontSize: 26,
        fontWeight: '800',
        color: 'white',
        letterSpacing: -0.5,
        lineHeight: 32,
        marginTop: -10,
        paddingRight: 20,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
    },
    brandName: {
        color: 'white',
        fontWeight: '900',
        fontSize: 18,
        letterSpacing: -0.5,
        marginLeft: 8,
    }
});
