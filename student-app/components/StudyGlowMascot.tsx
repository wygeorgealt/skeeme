import { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, View, useColorScheme } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { MaskoView, type MaskoHandle } from '@masko/player-react-native';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/theme';

const STUDY_GLOW_URL = process.env.EXPO_PUBLIC_MASKO_STUDY_GLOW_URL;

export default function StudyGlowMascot({ size }: { size: number }) {
    const playerRef = useRef<MaskoHandle>(null);
    const discoveryStarted = useRef(false);
    const [playerReady, setPlayerReady] = useState(false);
    const [playerError, setPlayerError] = useState(false);
    const reducedMotion = useReducedMotion();
    const isDark = useColorScheme() === 'dark';
    const showStill = reducedMotion || playerError || !STUDY_GLOW_URL;
    const mascotStyle = { width: size, height: size };

    useEffect(() => {
        if (!STUDY_GLOW_URL) {
            console.error('[StudyGlowMascot] EXPO_PUBLIC_MASKO_STUDY_GLOW_URL is not configured.');
        }
    }, []);

    const beginReadingAfterDiscovery = () => {
        if (discoveryStarted.current) return;
        discoveryStarted.current = true;
        playerRef.current?.set('behavior::focus', true, { instant: true });
        setPlayerReady(true);
    };

    const handlePlayerError = (event: { code: string; detail?: string }) => {
        console.error('[StudyGlowMascot] Masko playback failed', event.code, event.detail);
        setPlayerError(true);
    };

    return (
        <View style={[styles.container, { width: size, minHeight: size }]}>
            {showStill ? (
                <Image
                    source={require('@/assets/images/study-glow-idle.png')}
                    style={mascotStyle}
                    resizeMode="contain"
                    accessibilityLabel="Skeemy ready to help with your study plan"
                />
            ) : (
                <>
                    {!playerReady ? (
                        <Image
                            source={require('@/assets/images/study-glow-idle.png')}
                            style={[mascotStyle, styles.poster]}
                            resizeMode="contain"
                            accessibilityLabel="Skeemy ready to help with your study plan"
                        />
                    ) : null}
                    <MaskoView
                        ref={playerRef}
                        url={STUDY_GLOW_URL}
                        autoPlay
                        onPose={beginReadingAfterDiscovery}
                        onClip={(event) => {
                            if (event.kind === 'pose') beginReadingAfterDiscovery();
                        }}
                        onError={handlePlayerError}
                        style={mascotStyle}
                    />
                </>
            )}
            {!reducedMotion && showStill ? (
                <Text style={[styles.unavailable, { color: Colors[isDark ? 'dark' : 'light'].textSecondary }]}>
                    Skeemy&apos;s animation couldn&apos;t load, but your plan is ready.
                </Text>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    poster: {
        position: 'absolute',
        zIndex: 1,
    },
    unavailable: {
        fontSize: 13,
        textAlign: 'center',
        marginTop: -4,
        width: 280,
    },
});
