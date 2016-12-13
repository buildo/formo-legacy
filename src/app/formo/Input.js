import React from 'react';

const Input = ({ onChange, value, ...others }) => <input onChange={e => onChange(e.target.value)} value={value || ''} {...others} />;

export default Input;
