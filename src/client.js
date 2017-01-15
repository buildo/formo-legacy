import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import t from 'tcomb';

// set interfaces strict by default
t.inter.strict = true;

ReactDOM.render(<App />, document.getElementById('app'));
