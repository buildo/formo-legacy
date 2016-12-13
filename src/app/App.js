import React from 'react';
import * as _examples from './examples';
import View from 'react-flexview';
import map from 'lodash/map';
import omit from 'lodash/omit';

const examples = omit(_examples, ['__esModule']);

import 'react-flexview/src/flexView.scss';

export default class App extends React.Component {

  state = { example: 'LastOneIPromise' }

  render() {
    return (
      <View column>

        <View style={{ backgroundColor: '#ddd' }} marginBottom={100}>
          {map(examples, (_, x) => (
            <View
              marginRight={30}
              key={x}
              style={{ cursor: 'pointer', fontWeight: this.state.example === x && 'bold' }}
              onClick={() => this.setState({ example: x })}
            >
              {x}
            </View>
          ))}
        </View>

        {map(examples, (Component, name) => this.state.example === name && (
          <Component
            key={name}
            value={this.state[name]}
            onChange={value => { this.setState({ [name]: value }); }}
          />
        ))}

      </View>
    );
  }
}
