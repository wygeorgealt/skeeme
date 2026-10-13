import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';

export const BackButton = () => {
  const router = useRouter();
  return (
    <TouchableOpacity style={styles.button} onPress={() => router.back()} accessibilityLabel="Go back">
      <Icon name="ArrowLeft" size={24} color="primary" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 10,
  },
});
