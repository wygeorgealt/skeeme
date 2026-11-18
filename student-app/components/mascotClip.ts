import {
  DEFAULT_MASCOT_ANIMATION,
  REMOTE_MASCOT_CLIPS,
  type MascotAnimation,
} from './mascotClipUrls';

export {
  DEFAULT_MASCOT_ANIMATION,
  REMOTE_MASCOT_CLIPS,
  type MascotAnimation,
};
export const REMOTE_MASCOT_CLIP =
  REMOTE_MASCOT_CLIPS[DEFAULT_MASCOT_ANIMATION];

export function getCachedMascotClip(
  animation: MascotAnimation = DEFAULT_MASCOT_ANIMATION,
) {
  return REMOTE_MASCOT_CLIPS[animation];
}

export async function loadMascotClip(
  animation: MascotAnimation = DEFAULT_MASCOT_ANIMATION,
) {
  return REMOTE_MASCOT_CLIPS[animation];
}
