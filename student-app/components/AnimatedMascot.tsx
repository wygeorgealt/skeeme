import { MaskoView } from '@masko/player-react-native';
import { StyleSheet, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

const mascotClip = {
  hevc: 'https://assets.masko.ai/3492e5/skeemy-f58b/idle-wakes-c5942108.mov',
  stacked: 'https://assets.masko.ai/3492e5/skeemy-f58b/idle-wakes-79a7f0b3.mp4',
};

export function AnimatedMascot({ size = 260 }: { size?: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
    >
      <MaskoView
        clip={mascotClip}
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
    </View>
  );
}

const styles = StyleSheet.create({
  animation: {
    width: 260,
    height: 260,
  },
});
