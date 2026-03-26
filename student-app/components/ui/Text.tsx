import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, Platform } from 'react-native';

const FONT_WEIGHT_MAP: Record<string, string> = {
  'normal': 'ClashGrotesk-Regular',
  '400': 'ClashGrotesk-Regular',
  '300': 'ClashGrotesk-Light',
  '200': 'ClashGrotesk-Extralight',
  '500': 'ClashGrotesk-Medium',
  '600': 'ClashGrotesk-Semibold',
  '700': 'ClashGrotesk-Bold',
  'bold': 'ClashGrotesk-Bold',
  '800': 'ClashGrotesk-Bold',
  '900': 'ClashGrotesk-Bold',
};

export const Text = React.forwardRef<RNText, RNTextProps>((props, ref) => {
  const { style, ...rest } = props;

  // On iOS, use the default system font (San Francisco) — no custom font mapping
  if (Platform.OS === 'ios') {
    return <RNText ref={ref} {...rest} style={style} />;
  }

  // On Android, map font weights to ClashGrotesk variants
  let flatStyle: any = {};
  if (style) {
    const flattened = StyleSheet.flatten(style);
    flatStyle = flattened || {};
  }

  const weight = flatStyle.fontWeight || flatStyle.fontWeight === 0 ? String(flatStyle.fontWeight) : 'normal';
  const isCustomFont = flatStyle.fontFamily && !flatStyle.fontFamily.startsWith('ClashGrotesk');
  
  const mappedFont = isCustomFont ? flatStyle.fontFamily : (FONT_WEIGHT_MAP[weight] || 'ClashGrotesk-Regular');

  return (
    <RNText
      ref={ref}
      {...rest}
      style={[
        style,
        { fontFamily: mappedFont }
      ]}
    />
  );
});

Text.displayName = 'Text';
