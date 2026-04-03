import { 
  Home, 
  Send, 
  Code, 
  NavArrowRight 
} from 'iconoir-react-native';
import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

const MAPPING = {
  'house.fill': Home,
  'paperplane.fill': Send,
  'chevron.left.forwardslash.chevron.right': Code,
  'chevron.right': NavArrowRight,
} as const;

type IconSymbolName = keyof typeof MAPPING;

/**
 * iOS implementation of IconSymbol using Iconoir for project-wide consistency.
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
  const IconComponent = MAPPING[name];
  
  if (!IconComponent) return null;

  return (
    <IconComponent 
      width={size} 
      height={size} 
      color={color} 
      strokeWidth={strokeWidth} 
      style={style as any} 
    />
  );
}
