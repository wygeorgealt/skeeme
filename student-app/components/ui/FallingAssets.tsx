import React, { useEffect } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  cancelAnimation,
  Easing
} from 'react-native-reanimated';
import Svg, { Rect, Path, Circle, Defs, LinearGradient, RadialGradient, Stop, G } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Glossy SVG Icons (all themed to #007AFF) ───────────────────────────────

const GlossyBook = ({ size = 52 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Defs>
      <LinearGradient id="bkCover" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#66B2FF" />
        <Stop offset="50%" stopColor="#007AFF" />
        <Stop offset="100%" stopColor="#003ECC" />
      </LinearGradient>
      <LinearGradient id="bkGloss" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.55} />
        <Stop offset="40%" stopColor="#FFFFFF" stopOpacity={0.15} />
        <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
      </LinearGradient>
    </Defs>
    <Rect x="8" y="6" width="30" height="36" rx="4" fill="url(#bkCover)" />
    <Path d="M34 8h2v32h-2z" fill="#DBEAFE" opacity={0.9} />
    <Path d="M12 6h2v36h-2z" fill="#002288" opacity={0.4} />
    <Path d="M20 6h4v12l-2-2-2 2V6z" fill="#93C5FD" />
    <Path d="M8 6h30L18 42H8V6z" fill="url(#bkGloss)" />
  </Svg>
);

const GlossyPencil = ({ size = 52 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Defs>
      <LinearGradient id="pcBody" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#66B2FF" />
        <Stop offset="50%" stopColor="#007AFF" />
        <Stop offset="100%" stopColor="#003ECC" />
      </LinearGradient>
      <LinearGradient id="pcEraser" x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0%" stopColor="#93C5FD" />
        <Stop offset="100%" stopColor="#3B82F6" />
      </LinearGradient>
      <LinearGradient id="pcGloss" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.65} />
        <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
      </LinearGradient>
    </Defs>
    <G transform="rotate(45 24 24)">
      <Rect x="16" y="8" width="16" height="28" rx="2" fill="url(#pcBody)" />
      <Rect x="16" y="32" width="16" height="6" fill="url(#pcEraser)" />
      <Path d="M16 8l8-8 8 8z" fill="#DBEAFE" />
      <Path d="M22 2l4 0l-2 4z" fill="#002288" />
      <Rect x="16" y="30" width="16" height="2" fill="#E2E8F0" />
      <Rect x="20" y="8" width="4" height="22" fill="url(#pcGloss)" opacity={0.4} />
    </G>
  </Svg>
);

const GlossyNote = ({ size = 52 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Defs>
      <LinearGradient id="ntBg" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#EFF6FF" />
        <Stop offset="100%" stopColor="#DBEAFE" />
      </LinearGradient>
      <LinearGradient id="ntGloss" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.8} />
        <Stop offset="40%" stopColor="#FFFFFF" stopOpacity={0.2} />
        <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
      </LinearGradient>
    </Defs>
    <Rect x="10" y="6" width="28" height="36" rx="4" fill="url(#ntBg)" stroke="#007AFF" strokeWidth="1.5" />
    <Rect x="14" y="12" width="20" height="3" rx="1.5" fill="#007AFF" />
    <Rect x="14" y="19" width="20" height="3" rx="1.5" fill="#3B82F6" opacity={0.7} />
    <Rect x="14" y="26" width="20" height="3" rx="1.5" fill="#60A5FA" opacity={0.6} />
    <Rect x="14" y="33" width="12" height="3" rx="1.5" fill="#93C5FD" opacity={0.5} />
    <Path d="M10 6h28L18 42H10V6z" fill="url(#ntGloss)" />
  </Svg>
);

const GlossyBulb = ({ size = 52 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Defs>
      <RadialGradient id="blGlow" cx="50%" cy="50%" rx="50%" ry="50%" fx="35%" fy="35%">
        <Stop offset="0%" stopColor="#EFF6FF" />
        <Stop offset="55%" stopColor="#007AFF" />
        <Stop offset="100%" stopColor="#003ECC" />
      </RadialGradient>
      <LinearGradient id="blGloss" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.65} />
        <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
      </LinearGradient>
    </Defs>
    <Circle cx="24" cy="20" r="13" fill="url(#blGlow)" />
    <Path d="M19 29h10l-1.5 6h-7z" fill="#93C5FD" />
    <Rect x="20.5" y="35" width="7" height="3" rx="1.5" fill="#003ECC" />
    <Circle cx="20" cy="16" r="4" fill="url(#blGloss)" />
  </Svg>
);

const GlossyGradCap = ({ size = 52 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Defs>
      <LinearGradient id="gcBg" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#66B2FF" />
        <Stop offset="60%" stopColor="#007AFF" />
        <Stop offset="100%" stopColor="#002288" />
      </LinearGradient>
      <LinearGradient id="gcGloss" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.4} />
        <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
      </LinearGradient>
    </Defs>
    <Path d="M16 26v5c0 2 4 4 8 4s8-2 8-4v-5" fill="url(#gcBg)" />
    <Path d="M24 12l14 5.5-14 5.5-14-5.5z" fill="url(#gcBg)" />
    <Path d="M24 17.5l-8 3.5v6" stroke="#93C5FD" strokeWidth="2" />
    <Circle cx="16" cy="27" r="2.5" fill="#93C5FD" />
    <Path d="M24 12l14 5.5-14 5.5-14-5.5z" fill="url(#gcGloss)" />
  </Svg>
);

// ─── Config: pre-computed, deterministic, uniform ───────────────────────────

const ASSET_COMPONENTS = [GlossyBook, GlossyPencil, GlossyNote, GlossyBulb, GlossyGradCap];
const NUM_PARTICLES = 8;
const ICON_SIZE = 52;
const FALL_DURATION = 10000; // All items fall at EXACTLY the same speed (10s)
const TOTAL_TRAVEL = SCREEN_HEIGHT + ICON_SIZE * 2; // full distance from above top to below bottom

// Pre-compute each particle's fixed X position and evenly-spaced initial Y offset
// so they start spread across the screen, not all at the top simultaneously
const PARTICLES = Array.from({ length: NUM_PARTICLES }).map((_, i) => {
  const laneWidth = SCREEN_WIDTH / NUM_PARTICLES;
  const x = laneWidth * i + laneWidth * 0.2 + Math.random() * (laneWidth * 0.6);
  // Distribute initial Y positions across the full travel distance so screen
  // always has items spread evenly — no bunching and no waiting
  const initialY = (TOTAL_TRAVEL / NUM_PARTICLES) * i - ICON_SIZE;
  return { x, initialY };
});

// ─── Single falling item ─────────────────────────────────────────────────────

function FallingItem({ index }: { index: number }) {
  const { x, initialY } = PARTICLES[index];
  const AssetComponent = ASSET_COMPONENTS[index % ASSET_COMPONENTS.length];

  const startY = -ICON_SIZE;
  const endY = SCREEN_HEIGHT + ICON_SIZE;

  const posY = useSharedValue(initialY);  // Start at pre-distributed Y position
  const rotation = useSharedValue((index * 47) % 360); // deterministic rotation offset
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Fade in immediately
    opacity.value = withTiming(0.28, { duration: 1500 });

    // Calculate how far this item has left to travel based on its initial Y,
    // then loop from top. This ensures items don't jump to top on first cycle.
    const distanceRemaining = endY - initialY;
    const firstCycleDuration = Math.round((distanceRemaining / TOTAL_TRAVEL) * FALL_DURATION);

    posY.value = withSequence(
      // First pass: complete remaining travel from its distributed position
      withTiming(endY, { duration: firstCycleDuration, easing: Easing.linear }),
      // All subsequent passes: full top-to-bottom at uniform speed
      withRepeat(
        withSequence(
          withTiming(startY, { duration: 0 }),
          withTiming(endY, { duration: FALL_DURATION, easing: Easing.linear })
        ),
        -1,
        false
      )
    );

    // Slow, calm rotation — same speed for all
    rotation.value = withRepeat(
      withTiming(rotation.value + 360, { duration: 14000, easing: Easing.linear }),
      -1,
      false
    );

    return () => {
      cancelAnimation(posY);
      cancelAnimation(rotation);
      cancelAnimation(opacity);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: 0,
    left: x,
    transform: [
      { translateY: posY.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle} pointerEvents="none">
      <AssetComponent size={ICON_SIZE} />
    </Animated.View>
  );
}

// ─── Container ───────────────────────────────────────────────────────────────

export function FallingAssets() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: NUM_PARTICLES }).map((_, index) => (
        <FallingItem key={index} index={index} />
      ))}
    </View>
  );
}
