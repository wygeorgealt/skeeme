import { Image, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { DASHBOARD_THEME } from './dashboardTokens';
import { getSkeemyDashboardDialogue } from '@/lib/dashboardMascotDialogue';

interface SkeemyCompanionCardProps {
    streak?: number;
    hasRecentSession?: boolean;
}

export function SkeemyCompanionCard({
    streak = 0,
    hasRecentSession = false,
}: SkeemyCompanionCardProps) {
    const dialogue = getSkeemyDashboardDialogue({ streak, hasRecentSession });

    return (
        <View style={styles.card}>
            <View style={styles.mascotWrap}>
                <Image
                    source={require('@/assets/images/study-glow-idle.png')}
                    style={styles.mascotImage}
                    resizeMode="contain"
                    accessibilityLabel="Skeemy study companion"
                />
            </View>

            <View style={styles.textWrap}>
                <Text style={styles.headline}>{dialogue.message}</Text>
                <Text style={styles.subtext}>{dialogue.subtext}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: DASHBOARD_THEME.card,
        borderRadius: 18,
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: DASHBOARD_THEME.borderLight,
        ...DASHBOARD_THEME.cardShadow,
    },
    mascotWrap: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFFBEA',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
        borderWidth: 1,
        borderColor: '#FEF08A',
    },
    mascotImage: {
        width: 52,
        height: 52,
    },
    textWrap: {
        flex: 1,
    },
    headline: {
        fontFamily: 'Allo-Bold',
        fontSize: 15,
        lineHeight: 20,
        color: DASHBOARD_THEME.text,
        letterSpacing: -0.2,
    },
    subtext: {
        fontFamily: 'Allo-Regular',
        fontSize: 13,
        lineHeight: 18,
        color: DASHBOARD_THEME.textSecondary,
        marginTop: 3,
    },
});
