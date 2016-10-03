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
      color: isValid ? '#247BA0' : '#F25F5C',
      border: isActive ? '3px solid #247BA0' : '1px solid black',
      background: isActive ? '#B1DDD5' : null
    }}
  />
);

export default Input;
