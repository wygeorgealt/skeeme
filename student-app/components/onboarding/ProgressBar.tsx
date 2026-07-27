import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
  step: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ step, total }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i < step ? styles.active : styles.inactive]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  dot: {
    width: 16,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  active: {
    backgroundColor: '#007AFF',
  },
  inactive: {
    backgroundColor: '#D1D1D6',
  },
});
