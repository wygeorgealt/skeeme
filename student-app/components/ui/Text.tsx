import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { resolveSatoshiTextProps } from './satoshiFont';

type AppTextProps = RNTextProps & {
  className?: string;
};

export const Text = React.forwardRef<RNText, AppTextProps>(
  ({ style, className, ...rest }, ref) => {
    const resolved = resolveSatoshiTextProps(style, className);

    return (
      <RNText
        ref={ref}
        {...rest}
        className={resolved.className}
        style={[
          { includeFontPadding: false, fontFamily: resolved.fontFamily },
          resolved.style,
        ]}
      />
    );
  },
);

Text.displayName = 'Text';
