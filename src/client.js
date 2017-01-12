import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import t from 'tcomb';

// set structs strict by default
t.struct.strict = true;

ReactDOM.render(<App />, document.getElementById('app'));
