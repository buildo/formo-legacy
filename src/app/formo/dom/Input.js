import React from 'react';
import t, { maybe, union } from 'tcomb';
import { props } from 'tcomb-react';
import { skinnable, pure } from 'revenge';

@pure
@skinnable()
@props({
  value: maybe(union([t.Integer, t.String]), 'InputValue'),
  onChange: t.Function
}, { strict: false })
export default class Input extends React.Component {

  template({ value, onChange, ...others }) {
    return (
      <input
        value={t.Nil.is(value) ? '' : value}
        onChange={(e) => { onChange(e.target.value); }}
        {...others}
      />
    );
  }

}
