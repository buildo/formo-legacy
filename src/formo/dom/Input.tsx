import * as React from 'react';
import { noop } from 'lodash';

export type Props = {
  value?: number | string | null,
  onChange: (value: string) => void,
  onEnter?: () => void,
  onKeyUp?: (evt: React.KeyboardEvent<HTMLInputElement>) => void
};

export default function Input({ value, onChange, onEnter = noop, onKeyUp = noop, ...others }: Props) {

  return (
    <input
      value={value == null ? '' : value}
      onChange={(e) => { onChange(e.target.value); }}
      onKeyUp={(evt) => {
        const { keyCode, which } = evt;
        const isEnter = keyCode === 13 || which === 13;
        if (isEnter) {
          onEnter();
        }
        onKeyUp(evt);
      }}
      {...others}
    />
  );
}
