import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import rawDelivery from '@/components/studyGlowDelivery.json';
import type { Delivery } from '@masko/player-react-native';

let memoryDelivery: Delivery = rawDelivery as Delivery;
let preloadPromise: Promise<Delivery> | null = null;
let isPreloaded = false;

export function isStudyGlowPreloaded(): boolean {
    return isPreloaded;
}

export function getStudyGlowDelivery(): Delivery {
    return memoryDelivery;
}

/**
 * Pre-downloads the 3 Study Glow video clips (.mov) to the local file system cache.
 * When downloaded, the Delivery schema edges point to local file:// URIs,
 * allowing MaskoPlayer / AVPlayer to load and play instantly without network buffering.
 */
export function preloadStudyGlow(): Promise<Delivery> {
    if (Platform.OS !== 'ios') {
        return Promise.resolve(memoryDelivery);
    }
    if (preloadPromise) return preloadPromise;

    preloadPromise = (async () => {
        try {
            const cacheDir = FileSystem.cacheDirectory;
            if (!cacheDir) return memoryDelivery;

            const updatedDelivery: Delivery = JSON.parse(JSON.stringify(rawDelivery));
            const edges = (updatedDelivery.runtimeGraph as any)?.edges ?? [];

            await Promise.all(
                edges.map(async (edge: any) => {
                    const remoteUrl: string | undefined = edge.videos?.hevc;
                    if (!remoteUrl || !remoteUrl.startsWith('http')) return;

                    const localFile = `${cacheDir}study_glow_${edge.id}.mov`;
                    try {
                        const info = await FileSystem.getInfoAsync(localFile);
                        if (info.exists && (info as any).size > 0) {
                            edge.videos.hevc = localFile;
                            return;
                        }

                        const downloadResult = await FileSystem.downloadAsync(remoteUrl, localFile);
                        if (downloadResult.status === 200) {
                            edge.videos.hevc = downloadResult.uri;
                        }
                    } catch (err) {
                        if (__DEV__) {
                            console.warn(`[preloadStudyGlow] Failed to cache ${edge.name}:`, err);
                        }
                    }
                })
            );

            memoryDelivery = updatedDelivery;
            isPreloaded = true;
            return memoryDelivery;
        } catch (e) {
            if (__DEV__) {
                console.warn('[preloadStudyGlow] Error preloading Study Glow:', e);
            }
            return memoryDelivery;
        }
    })();

    return preloadPromise;
}
