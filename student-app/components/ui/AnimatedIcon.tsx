import React from 'react';
import { Pressable, ViewStyle, ImageStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { Image } from 'expo-image';

interface AnimatedIconProps {
  source: any;
  size?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  animationType?: 'pop' | 'spin' | 'twist' | 'wobble';
  children?: React.ReactNode;
}

export function AnimatedIcon({
  source,
  size = 24,
  onPress,
  style,
  imageStyle,
  animationType = 'pop',
  children
}: AnimatedIconProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const handlePressIn = () => {
    if (animationType === 'pop' || animationType === 'wobble') {
      scale.value = withSpring(0.85, { damping: 12, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (animationType === 'pop') {
      scale.value = withSpring(1, { damping: 10, stiffness: 400 });
    } else if (animationType === 'spin') {
      rotation.value = withSequence(
        withTiming(rotation.value + 360, { duration: 600 })
      );
    } else if (animationType === 'twist') {
      scale.value = withSequence(
        withSpring(0.8, { damping: 12, stiffness: 300 }),
        withSpring(1, { damping: 10, stiffness: 400 })
      );
      rotation.value = withSequence(
        withTiming(-20, { duration: 100 }),
        withSpring(0, { damping: 4, stiffness: 200 })
      );
    } else if (animationType === 'wobble') {
      scale.value = withSpring(1, { damping: 10, stiffness: 400 });
      rotation.value = withSequence(
        withTiming(-15, { duration: 100 }),
        withTiming(15, { duration: 100 }),
        withTiming(-10, { duration: 100 }),
        withSpring(0, { damping: 5, stiffness: 300 })
      );
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotateZ: `${rotation.value}deg` }
    ]
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPress ? handlePressIn : undefined}
      onPressOut={onPress ? handlePressOut : undefined}
      style={[{ alignItems: 'center', justifyContent: 'center' }, style]}
    >
      <Animated.View style={[animatedStyle, { alignItems: 'center' }]}>
        <Image
          source={source}
          style={[{ width: size, height: size }, imageStyle]}
          contentFit="contain"
          transition={200}
        />
        {children}
      </Animated.View>
    </Pressable>
  );
}
