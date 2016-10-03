import React from 'react';

const Input = ({
  type,
  value,
  onChange,
  onFocus,
  onBlur,
  isValid,
  isActive
}) => (
  <input
    type={type}
    value={value}
    onChange={e => onChange(e.target.value)}
    onFocus={onFocus}
    onBlur={onBlur}
    style={{
      color: isValid ? 'blue' : 'red',
      border: isActive ? '1px solid blue' : '1px solid black'
    }}
  />
);

export default Input;
