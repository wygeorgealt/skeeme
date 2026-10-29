import React from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LiquidGlassIconButton } from '@/components/ui/LiquidGlassIconButton';

export const BackButton = () => {
  const router = useRouter();
  return (
    <LiquidGlassIconButton
      style={styles.button}
      onPress={() => router.back()}
      accessibilityLabel="Go back"
      icon="ArrowLeft"
      size={48}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 10,
  },
});
