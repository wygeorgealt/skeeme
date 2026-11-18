import { Platform, StyleSheet, type StyleProp, type TextStyle } from 'react-native';

const families = {
  regular: 'Allo-Regular',
  medium: 'Allo-Medium',
  bold: 'Allo-Bold',
  black: 'Allo-Black',
} as const;

const alloFamilies = new Set<string>(Object.values(families));
const fontWeightForFamily: Record<string, TextStyle['fontWeight']> = {
  [families.regular]: '400',
  [families.medium]: '500',
  [families.bold]: '700',
  [families.black]: '900',
};

const weightClasses: Record<string, string> = {
  'font-thin': families.regular,
  'font-extralight': families.regular,
  'font-light': families.regular,
  'font-normal': families.regular,
  'font-medium': families.medium,
  'font-semibold': families.bold,
  'font-bold': families.bold,
  'font-extrabold': families.black,
  'font-black': families.black,
};

const weightClassNames = new Set(Object.keys(weightClasses));

const familyForWeight = (weight: TextStyle['fontWeight']) => {
  if (weight === undefined) {
    return undefined;
  }

  const numericWeight = Number(weight);
  if (!Number.isNaN(numericWeight)) {
    if (numericWeight >= 800) return families.black;
    if (numericWeight >= 600) return families.bold;
    if (numericWeight >= 500) return families.medium;
    return families.regular;
  }

  switch (weight) {
    case 'black':
      return families.black;
    case 'bold':
    case 'semibold':
      return families.bold;
    case 'medium':
      return families.medium;
    case 'normal':
    case 'thin':
    case 'ultralight':
    case 'light':
      return families.regular;
    default:
      return undefined;
  }
};

const familyForClassName = (className?: string) => {
  if (!className) {
    return undefined;
  }

  const tokens = className.split(/\s+/).reverse();
  for (const token of tokens) {
    const tokenParts = token.split(':');
    const utility = tokenParts[tokenParts.length - 1]
      ?.split('/')[0]
      ?.replace(/^!/, '');
    if (utility && weightClasses[utility]) {
      return weightClasses[utility];
    }

    if (utility === 'font-mono') {
      return Platform.OS === 'ios' ? 'Menlo' : 'monospace';
    }
  }

  return undefined;
};

const utilityForClassToken = (token: string) => {
  const tokenParts = token.split(':');
  const utility = tokenParts[tokenParts.length - 1]?.split('/')[0];
  return utility?.replace(/^!/, '');
};

export function resolveAlloTextProps(
  style?: StyleProp<TextStyle>,
  className?: string,
) {
  const flattenedStyle = StyleSheet.flatten(style);
  const resolvedFamily =
    flattenedStyle?.fontFamily ??
    familyForWeight(flattenedStyle?.fontWeight) ??
    familyForClassName(className) ??
    families.regular;
  const resolvedStyle = flattenedStyle && { ...flattenedStyle };

  if (resolvedStyle && alloFamilies.has(resolvedFamily)) {
    if (Platform.OS === 'web') {
      resolvedStyle.fontWeight ??= fontWeightForFamily[resolvedFamily];
    } else {
      delete resolvedStyle.fontWeight;
    }
  }

  const resolvedClassName = className
    ?.split(/\s+/)
    .filter((token) => {
      const utility = utilityForClassToken(token);
      return (
        utility !== 'font-sans' &&
        utility !== 'font-mono' &&
        (Platform.OS === 'web' || !weightClassNames.has(utility ?? ''))
      );
    })
    .join(' ');

  return {
    fontFamily: Platform.OS === 'web' && alloFamilies.has(resolvedFamily)
      ? 'Allo'
      : resolvedFamily,
    style: resolvedStyle,
    className: resolvedClassName || undefined,
  };
}
