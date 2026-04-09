import { SymbolView, SymbolWeight } from 'expo-symbols';
import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { IconSymbolName } from './icon-symbol';

/**
 * iOS implementation of IconSymbol using native SF Symbols (expo-symbols).
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  strokeWidth = 2.5
}: {
  name: IconSymbolName;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  strokeWidth?: number;
}) {
  // Map strokeWidth to SF Symbol weights loosely
  let weight: SymbolWeight = 'regular';
  if (strokeWidth >= 3) weight = 'bold';
  else if (strokeWidth >= 2.5) weight = 'semibold';
  else if (strokeWidth <= 1.5) weight = 'light';

  return (
    <SymbolView
      name={name}
      size={size}
      tintColor={color}
      weight={weight}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}
