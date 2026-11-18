import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { MaskoView, type MaskoHandle } from '@masko/player-react-native';
import type { Delivery } from '@masko/player-react-native';
import { getStudyGlowDelivery, preloadStudyGlow } from '@/lib/preloadStudyGlow';

const STUDY_GLOW_URL =
    process.env.EXPO_PUBLIC_MASKO_STUDY_GLOW_URL ||
    'https://api.masko.ai/v1/canvases/34193939-fa2d-4515-bb81-e5c01b7fc313/delivery?key=masko_app_d9ebf795c9974b3150851a8246e4bb62accd880c055e81273ab5c7dbdaa1e16e';

/**
 * Fetch a fresh delivery from the API when the signed URLs expire.
 * The player calls this automatically when links go stale.
 */
async function fetchFreshDelivery(): Promise<Delivery> {
    const url = STUDY_GLOW_URL + '&target=apple&formats=hevc';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Delivery fetch failed: ${res.status}`);
    return res.json();
}

export default function StudyGlowMascot({ size = 220 }: { size?: number }) {
    const playerRef = useRef<MaskoHandle>(null);
    const reducedMotion = useReducedMotion();
    const mascotStyle = { width: size, height: size };
    const [delivery, setDelivery] = useState<Delivery>(() => getStudyGlowDelivery());
    const [videoReady, setVideoReady] = useState(false);

    const getDelivery = useCallback(() => fetchFreshDelivery(), []);

    // Ensure preloading is complete (swaps in local file URIs if downloaded)
    useEffect(() => {
        void preloadStudyGlow().then((localDelivery) => {
            setDelivery(localDelivery);
        });
    }, []);

    // Safety fallback: if videoReady event hasn't fired in 3s, reveal anyway
    useEffect(() => {
        const timer = setTimeout(() => {
            setVideoReady(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    // Idle -> Reading transition timing: starts only after Skeemy is visible and playing Idle
    useEffect(() => {
        if (reducedMotion || !videoReady) return;

        const timer = setTimeout(() => {
            playerRef.current?.set('behavior::focus', true);
        }, 1200);

        return () => clearTimeout(timer);
    }, [reducedMotion, videoReady]);

    const handleVideoReady = useCallback(() => {
        setVideoReady(true);
    }, []);

    if (reducedMotion) {
        return (
            <View style={[styles.container, mascotStyle]}>
                <Image
                    source={require('@/assets/images/study-glow-idle.png')}
                    style={mascotStyle}
                    resizeMode="contain"
                    accessibilityLabel="Skeemy ready to help with your study plan"
                />
            </View>
        );
    }

    return (
        <View style={[styles.container, mascotStyle]}>
            <MaskoView
                ref={playerRef}
                delivery={delivery}
                getDelivery={getDelivery}
                autoPlay={!reducedMotion}
                sound={false}
                onClip={handleVideoReady}
                onPose={handleVideoReady}
                onError={(e) => {
                    console.error('[StudyGlowMascot] Playback error:', e.code, e.detail);
                }}
                style={mascotStyle}
            />
            {!videoReady ? (
                <View style={[mascotStyle, styles.poster]} pointerEvents="none">
                    <Image
                        source={require('@/assets/images/study-glow-idle.png')}
                        style={mascotStyle}
                        resizeMode="contain"
                        accessibilityLabel="Skeemy ready to help with your study plan"
                    />
                </View>
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
    },
});
