import { noop, omit } from 'lodash';
import * as React from 'react';

export interface Props {
  value?: number | string | null;
  onChange: (value: string) => void;
  onEnter?: () => void;
  onKeyUp?: (evt: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function Input<T extends Props>(props: T) {
  const { value, onChange, onEnter = noop, onKeyUp = noop } = props;
  const others = omit(props, ['value', 'onChange', 'onEnter', 'onKeyUp']);
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
