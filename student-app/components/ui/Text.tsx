import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, Platform } from 'react-native';

export const Text = React.forwardRef<RNText, RNTextProps>((props, ref) => {
  const { style, ...rest } = props;

  // Let React Native handle the system font natively for both platforms
  return <RNText ref={ref} {...rest} style={style} />;
});

Text.displayName = 'Text';
