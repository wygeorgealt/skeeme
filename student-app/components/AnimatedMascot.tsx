import { useEffect, useState } from 'react';
import { MaskoView } from '@masko/player-react-native';
import { StyleSheet, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import {
  getCachedMascotClip,
  loadMascotClip,
  REMOTE_MASCOT_CLIP,
} from './mascotClip';

export function AnimatedMascot({ size = 260 }: { size?: number }) {
  const reduceMotion = useReducedMotion();
  const [clip, setClip] = useState(getCachedMascotClip);

  useEffect(() => {
    let active = true;

    loadMascotClip()
      .then((source) => {
        if (active) setClip(source);
      })
      .catch((error: unknown) => {
        console.error(
          '[AnimatedMascot] Could not load the bundled clip; using the remote clip.',
          error,
        );
        if (active) setClip(REMOTE_MASCOT_CLIP);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
    >
      {clip ? (
        <MaskoView
          clip={clip}
          autoPlay={!reduceMotion}
          sound={false}
          onError={({ code, detail }) => {
            console.error(
              `[AnimatedMascot] Playback failed (${code})`,
              detail,
            );
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
