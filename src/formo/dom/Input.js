import React from 'react';
import t, { maybe, union } from 'tcomb';
import { props } from 'tcomb-react';
import { skinnable, pure } from 'revenge';
import noop from 'lodash/noop';

@pure
@skinnable()
@props({
  value: maybe(union([t.Integer, t.String]), 'InputValue'),
  onChange: t.Function,
  onEnter: maybe(t.Function),
  onKeyUp: maybe(t.Function)
}, { strict: false })
export default class Input extends React.Component {

  template({ value, onChange, onEnter = noop, onKeyUp = noop, ...others }) {
    return (
      <input
        value={t.Nil.is(value) ? '' : value}
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

}
