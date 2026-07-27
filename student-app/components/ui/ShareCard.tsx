import { Text } from '@/components/ui/Text';
import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { LinearGradient } from 'expo-linear-gradient';
import Fire from '@/assets/icons/pikaicons/sparkle-ai-01.svg';
import MedalRibbonStar from '@/assets/icons/pikaicons/award-medal.svg';
import Stars from '@/assets/icons/pikaicons/award-medal.svg';
import CupStar from '@/assets/icons/pikaicons/award-medal.svg';
import Star from '@/assets/icons/pikaicons/award-medal.svg';

const GRADIENTS = [
    ['#8B5CF6', '#6366F1'], // Skeeme Default
    ['#EC4899', '#8B5CF6'], // Pink to Purple
    ['#3B82F6', '#2DD4BF'], // Blue to Teal
    ['#F97316', '#FACC15'], // Orange to Yellow
    ['#10B981', '#3B82F6'], // Green to Blue
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
    }, [data.topic, data.current_streak, data.score_percentage]);

    return (
        <View style={styles.offscreenContainer}>
            <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }}>
                <LinearGradient
                    colors={randomGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                >
                    <View style={styles.bgIcon1}>
                        <Star width={120} height={120} color="rgba(255,255,255,0.08)" />
                    </View>
                    <View style={styles.bgIcon2}>
                        <Stars width={180} height={180} color="rgba(255,255,255,0.08)" />
                    </View>

                    {/* Content Glass Card */}
                    <View style={styles.glassCard}>
                        <View style={styles.iconContainer}>
                            {type === 'streak' ? (
                                <Fire width={64} height={64} color="white" />
                            ) : (
                                <CupStar width={64} height={64} color="white" />
                            )}
                        </View>

                        <View style={styles.mainContent}>
                            <Text style={styles.headerLabel}>
                                {type === 'streak' ? "STREAK MILESTONE" : "QUIZ PERFORMANCE"}
                            </Text>
                            
                            <View style={styles.numberRow}>
                                <Text style={styles.mainNumber}>
                                    {type === 'streak' ? data.current_streak : `${data.score_percentage}%`}
                                </Text>
                            </View>

                            <Text style={styles.description}>
                                {type === 'streak' 
                                    ? "Consecutive days of learning on Skeeme!"
                                    : `Mastered ${data.topic} with a stellar score!`}
                            </Text>
                        </View>
                    </View>

                    {/* Footer / Call to Action */}
                    <View style={styles.footer}>
                        <View style={styles.ctaCard}>
                            <View style={styles.ctaRight}>
                                <Text style={styles.ctaMainText}>You can do it too! 🚀</Text>
                                <Text style={styles.ctaSubText}>Get Skeeme on the Google Play Store to start testing yourself today.</Text>
                            </View>
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
        width: 1080, // High res for sharing
        height: 1350, // 4:5 Portrait
        padding: 80,
        justifyContent: 'space-between',
        alignItems: 'center',
        overflow: 'hidden',
    },
    bgIcon1: {
        position: 'absolute',
        top: 100,
        right: -40,
        transform: [{ rotate: '15deg' }],
    },
    bgIcon2: {
        position: 'absolute',
        bottom: 200,
        left: -60,
        transform: [{ rotate: '-20deg' }],
    },
    glassCard: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 60,
        padding: 60,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        marginTop: 100,
    },
    iconContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    mainContent: {
        alignItems: 'center',
        width: '100%',
    },
    headerLabel: {
        fontSize: 28,
        fontWeight: '900',
        color: 'white',
        letterSpacing: 4,
        opacity: 0.8,
        marginBottom: 20,
        textAlign: 'center',
    },
    numberRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 20,
    },
    mainNumber: {
        fontSize: 240,
        fontWeight: '900',
        color: 'white',
        letterSpacing: -10,
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 0, height: 10 },
        textShadowRadius: 30,
    },
    description: {
        fontSize: 36,
        fontWeight: '700',
        color: 'white',
        textAlign: 'center',
        lineHeight: 52,
        opacity: 0.9,
    },
    footer: {
        width: '100%',
    },
    ctaCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 40,
        padding: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.25,
        shadowRadius: 30,
        elevation: 20,
    },
    ctaLeft: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: 'rgba(0,122,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 24,
    },
    ctaRight: {
        flex: 1,
    },
    ctaMainText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#1e293b',
        marginBottom: 4,
    },
    ctaSubText: {
        fontSize: 22,
        fontWeight: '600',
        color: '#64748b',
        lineHeight: 28,
    }
});

