import { useCallback, useEffect, useRef, useState } from 'react';
import { MaskoView, type MaskoHandle } from '@masko/player-react-native';
import { StyleSheet, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import {
  DEFAULT_MASCOT_ANIMATION,
  type MascotAnimation,
} from './mascotClipUrls';
import {
  getCachedMascotClip,
  loadMascotClip,
  REMOTE_MASCOT_CLIPS,
} from './mascotClip';

export function AnimatedMascot({
  size = 260,
  animation = DEFAULT_MASCOT_ANIMATION,
  playbackKey,
  stopAfterMs,
  onPlaybackStart,
  onPlaybackEnd,
  onPlaybackError,
}: {
  size?: number;
  animation?: MascotAnimation;
  playbackKey?: string | number;
  stopAfterMs?: number;
  onPlaybackStart?: () => void;
  onPlaybackEnd?: () => void;
  onPlaybackError?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [clip, setClip] = useState(() => getCachedMascotClip(animation));
  const playerRef = useRef<MaskoHandle>(null);
  const playbackEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentAnimation = useRef(animation);
  const currentPlaybackKey = useRef(playbackKey);
  const hasStartedPlayback = useRef(false);
  const hasCompletedPlayback = useRef(false);

  useEffect(() => {
    let active = true;
    if (currentAnimation.current !== animation) {
      currentAnimation.current = animation;
      hasStartedPlayback.current = false;
      hasCompletedPlayback.current = false;
      if (playbackEndTimer.current !== null) {
        clearTimeout(playbackEndTimer.current);
        playbackEndTimer.current = null;
      }
    }

    loadMascotClip(animation)
      .then((source) => {
        if (active) setClip(source);
      })
      .catch((error: unknown) => {
        console.error(
          '[AnimatedMascot] Could not load the bundled clip; using the remote clip.',
          error,
        );
        if (active) setClip(REMOTE_MASCOT_CLIPS[animation]);
      });

    return () => {
      active = false;
      if (playbackEndTimer.current !== null) {
        clearTimeout(playbackEndTimer.current);
        playbackEndTimer.current = null;
      }
    };
  }, [animation]);

  useEffect(() => {
    if (currentPlaybackKey.current === playbackKey) return;
    currentPlaybackKey.current = playbackKey;
    hasStartedPlayback.current = false;
    hasCompletedPlayback.current = false;
    if (playbackEndTimer.current !== null) {
      clearTimeout(playbackEndTimer.current);
      playbackEndTimer.current = null;
    }

    if (reduceMotion) return;
    playerRef.current?.reset();
    playerRef.current?.play();
  }, [playbackKey, reduceMotion]);

  const handlePlaybackStart = useCallback(() => {
    if (hasStartedPlayback.current || hasCompletedPlayback.current) return;
    hasStartedPlayback.current = true;
    onPlaybackStart?.();
    if (stopAfterMs === undefined) return;

    playbackEndTimer.current = setTimeout(() => {
      playerRef.current?.pause();
      hasCompletedPlayback.current = true;
      onPlaybackEnd?.();
    }, stopAfterMs);
  }, [onPlaybackEnd, onPlaybackStart, stopAfterMs]);

  const handleClip = useCallback(
    ({ kind }: { kind: string }) => {
      if (kind !== 'still') handlePlaybackStart();
    },
    [handlePlaybackStart],
  );

  useEffect(() => {
    if (
      !clip ||
      reduceMotion ||
      (stopAfterMs === undefined && onPlaybackStart === undefined)
    ) {
      return;
    }

    handlePlaybackStart();
  }, [
    clip,
    handlePlaybackStart,
    onPlaybackStart,
    playbackKey,
    reduceMotion,
    stopAfterMs,
  ]);

  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
    >
      {clip ? (
        <MaskoView
          ref={playerRef}
          clip={clip}
          autoPlay={!reduceMotion}
          sound={false}
          onPose={handlePlaybackStart}
          onClip={handleClip}
          onError={({ code, detail }) => {
            console.error(
              `[AnimatedMascot] Playback failed (${code})`,
              detail,
            );
            onPlaybackError?.();
          }}
          style={[styles.animation, { width: size, height: size }]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  animation: {
    width: 260,
    height: 260,
  },
});
