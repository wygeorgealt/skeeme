import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, Platform } from 'react-native';

export const Text = React.forwardRef<RNText, RNTextProps>((props, ref) => {
  const { style, ...rest } = props;

  // Use the platform system face by default: SF Pro on iOS and Roboto on Android.
  // Screen-level weights/sizes remain the source of hierarchy.
  return <RNText ref={ref} {...rest} style={[styles.system, style]} />;
});

Text.displayName = 'Text';

const styles = StyleSheet.create({
  system: { includeFontPadding: false },
});
