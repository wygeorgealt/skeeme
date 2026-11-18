import { Asset } from 'expo-asset';
import type { ClipFiles } from '@masko/player-react-native';
import {
  DEFAULT_MASCOT_ANIMATION,
  REMOTE_MASCOT_CLIPS,
  type MascotAnimation,
} from './mascotClipUrls';

export { REMOTE_MASCOT_CLIPS };

const bundledClips: Record<MascotAnimation, Asset> = {
  'idle-wakes': Asset.fromModule(
    require('../assets/mascot/idle-wakes-android.mp4'),
  ),
  'enthusiastic-scribbles': Asset.fromModule(
    require('../assets/mascot/enthusiastic-scribbles-android.mp4'),
  ),
  'peacefully-opens': Asset.fromModule(
    require('../assets/mascot/peacefully-opens-android.mp4'),
  ),
  'peacefully-resting': Asset.fromModule(
    require('../assets/mascot/peacefully-resting-android.mp4'),
  ),
  'quietly-writes-looks': Asset.fromModule(
    require('../assets/mascot/quietly-writes-looks-android.mp4'),
  ),
  'profile-ready': Asset.fromModule(
    require('../assets/mascot/profile-ready-android.mp4'),
  ),
  'name-wave': Asset.fromModule(
    require('../assets/mascot/name-wave-android.mp4'),
  ),
};

const cachedClips: Partial<Record<MascotAnimation, ClipFiles>> = {};
const loadingClips: Partial<Record<MascotAnimation, Promise<ClipFiles>>> = {};

export function getCachedMascotClip(
  animation: MascotAnimation = DEFAULT_MASCOT_ANIMATION,
) {
  return cachedClips[animation] ?? null;
}

export function loadMascotClip(
  animation: MascotAnimation = DEFAULT_MASCOT_ANIMATION,
): Promise<ClipFiles> {
  const cachedClip = cachedClips[animation];
  if (cachedClip) return Promise.resolve(cachedClip);
  const loadingClip = loadingClips[animation];
  if (loadingClip) return loadingClip;

  const nextClip = bundledClips[animation]
    .downloadAsync()
    .then((asset) => {
      if (!asset.localUri) {
        throw new Error(
          `The bundled Android ${animation} clip has no local URI.`,
        );
      }

      const clip: ClipFiles = { stacked: asset.localUri };
      cachedClips[animation] = clip;
      return clip;
    })
    .finally(() => {
      delete loadingClips[animation];
    });

  loadingClips[animation] = nextClip;
  return nextClip;
}
