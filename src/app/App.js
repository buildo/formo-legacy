import React from 'react';
import * as examples from './examples';
import View from 'react-flexview';
import map from 'lodash/map';

import 'react-flexview/src/flexView.scss';

export default class App extends React.Component {

  state = { example: 'MyForm' }

  render() {
    return (
      <View column>

        <View style={{ backgroundColor: '#ddd' }} marginBottom={100}>
          {'MyForm MyOtherForm AnotherOneOfMyForms'.split(' ').map(x => (
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
