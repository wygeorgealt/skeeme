import type { ClipFiles } from '@masko/player-react-native';

export type MascotAnimation =
  | 'idle-wakes'
  | 'enthusiastic-scribbles'
  | 'peacefully-opens'
  | 'peacefully-resting'
  | 'quietly-writes-looks'
  | 'profile-ready'
  | 'name-wave';

export const DEFAULT_MASCOT_ANIMATION: MascotAnimation = 'idle-wakes';

export const REMOTE_MASCOT_CLIPS: Record<MascotAnimation, ClipFiles> = {
  'idle-wakes': {
    hevc: 'https://assets.masko.ai/3492e5/skeemy-f58b/idle-wakes-c5942108.mov',
    stacked: 'https://assets.masko.ai/3492e5/skeemy-f58b/idle-wakes-79a7f0b3.mp4',
  },
  'enthusiastic-scribbles': {
    hevc: 'https://assets.masko.ai/82ab06/skeemy-2f1b/lumi-enthusiastically-scribbles-lifts-8ffe03db.mov',
    stacked: 'https://assets.masko.ai/82ab06/skeemy-2f1b/lumi-enthusiastically-scribbles-lifts-fdc1367c.mp4',
  },
  'peacefully-opens': {
    hevc: 'https://assets.masko.ai/82ab06/skeemy-2f1b/skeemy-peacefully-opens-his-4487eabd.mov',
    stacked: 'https://assets.masko.ai/82ab06/skeemy-2f1b/skeemy-peacefully-opens-his-8d9b3378.mp4',
  },
  'peacefully-resting': {
    hevc: 'https://assets.masko.ai/82ab06/skeemy-2f1b/lumi-begins-peacefully-resting-62112382.mov',
    stacked: 'https://assets.masko.ai/82ab06/skeemy-2f1b/lumi-begins-peacefully-resting-d311ef3c.mp4',
  },
  'quietly-writes-looks': {
    hevc: 'https://assets.masko.ai/82ab06/skeemy-2f1b/skemy-quietly-writes-looks-df3c02b1.mov',
    stacked: 'https://assets.masko.ai/82ab06/skeemy-2f1b/skemy-quietly-writes-looks-1c08de58.mp4',
  },
  'profile-ready': {
    hevc: 'https://assets.masko.ai/82ab06/skeemy-2f1b/skeemy-lights-up-and-2d5ead54.mov',
    stacked: 'https://assets.masko.ai/82ab06/skeemy-2f1b/skeemy-lights-up-and-889fa7f5.mp4',
  },
  'name-wave': {
    hevc: 'https://assets.masko.ai/82ab06/skeemy-2f1b/skemy-the-glowing-golden-4493c8d5.mov',
    stacked: 'https://assets.masko.ai/82ab06/skeemy-2f1b/skemy-the-glowing-golden-29f6a722.mp4',
  },
};

export const REMOTE_MASCOT_CLIP =
  REMOTE_MASCOT_CLIPS[DEFAULT_MASCOT_ANIMATION];
