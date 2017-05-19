import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './app';
import * as t from 'tcomb';

// set interfaces strict by default
t.inter.strict = true;

ReactDOM.render(<App />, document.getElementById('app'));
