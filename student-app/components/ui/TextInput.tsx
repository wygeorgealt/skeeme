import React from 'react';
import {
  TextInput as RNTextInput,
  type TextInputProps as RNTextInputProps,
} from 'react-native';
import { resolveSatoshiTextProps } from './satoshiFont';

type AppTextInputProps = RNTextInputProps & {
  className?: string;
};

export const TextInput = React.forwardRef<RNTextInput, AppTextInputProps>(
  ({ style, className, ...rest }, ref) => {
    const resolved = resolveSatoshiTextProps(style, className);

    return (
      <RNTextInput
        ref={ref}
        {...rest}
        className={resolved.className}
        style={[{ fontFamily: resolved.fontFamily }, resolved.style]}
      />
    );
  },
);

TextInput.displayName = 'TextInput';
