import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export const SkipButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity style={styles.button} onPress={onPress} accessibilityLabel="Skip step">
    <Text style={styles.text}>Skip</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 8,
    zIndex: 10,
  },
  text: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
