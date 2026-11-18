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
    require('../assets/mascot/idle-wakes-ios.mov'),
  ),
  'enthusiastic-scribbles': Asset.fromModule(
    require('../assets/mascot/enthusiastic-scribbles-ios.mov'),
  ),
  'peacefully-opens': Asset.fromModule(
    require('../assets/mascot/peacefully-opens-ios.mov'),
  ),
  'peacefully-resting': Asset.fromModule(
    require('../assets/mascot/peacefully-resting-ios.mov'),
  ),
  'quietly-writes-looks': Asset.fromModule(
    require('../assets/mascot/quietly-writes-looks-ios.mov'),
  ),
  'profile-ready': Asset.fromModule(
    require('../assets/mascot/profile-ready-ios.mov'),
  ),
  'name-wave': Asset.fromModule(
    require('../assets/mascot/name-wave-ios.mov'),
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
        throw new Error(`The bundled iOS ${animation} clip has no local URI.`);
      }

      const clip: ClipFiles = { hevc: asset.localUri };
      cachedClips[animation] = clip;
      return clip;
    })
    .finally(() => {
      delete loadingClips[animation];
    });

  loadingClips[animation] = nextClip;
  return nextClip;
}
