import React from 'react';
import ReactDOM from 'react-dom';
import LoginForm from './example/LoginForm';

export const main = (mountNode) => {
  ReactDOM.render(<LoginForm />, mountNode);
};