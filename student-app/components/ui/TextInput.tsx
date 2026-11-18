import React from 'react';
import {
  TextInput as RNTextInput,
  type TextInputProps as RNTextInputProps,
} from 'react-native';
import { resolveAlloTextProps } from './alloFont';

type AppTextInputProps = RNTextInputProps & {
  className?: string;
};

export const TextInput = React.forwardRef<RNTextInput, AppTextInputProps>(
  ({ style, className, ...rest }, ref) => {
    const resolved = resolveAlloTextProps(style, className);

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
