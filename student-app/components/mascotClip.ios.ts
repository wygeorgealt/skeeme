import { Asset } from 'expo-asset';
import type { ClipFiles } from '@masko/player-react-native';
import { REMOTE_MASCOT_CLIP } from './mascotClipUrls';

export { REMOTE_MASCOT_CLIP };

const bundledClip = Asset.fromModule(
  require('../assets/mascot/idle-wakes-ios.mov'),
);

let cachedClip: ClipFiles | null = null;
let loadingClip: Promise<ClipFiles> | null = null;

export function getCachedMascotClip() {
  return cachedClip;
}

export function loadMascotClip(): Promise<ClipFiles> {
  if (cachedClip) return Promise.resolve(cachedClip);
  if (loadingClip) return loadingClip;

  loadingClip = bundledClip
    .downloadAsync()
    .then((asset) => {
      if (!asset.localUri) {
        throw new Error('The bundled iOS mascot clip has no local URI.');
      }

      cachedClip = { hevc: asset.localUri };
      return cachedClip;
    })
    .finally(() => {
      loadingClip = null;
    });

  return loadingClip;
}
