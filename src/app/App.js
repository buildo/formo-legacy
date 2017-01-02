import React from 'react';
import * as _examples from './examples';
import View from 'react-flexview';
import map from 'lodash/map';
import omit from 'lodash/omit';

const examples = omit(_examples, ['__esModule']);

import 'react-flexview/src/flexView.scss';

const otherProps = {
  MyForm: {
    form: {
      email: {
        initialValue: 'mario.poverello@gmail.com',
        validations: (value) => {
          const required = !value ? 'email is required' : null;
          return {
            required,
            length: !required && value.length > 5 ? null : 'email must be longer than 5 chars'
          };
        }
      },
      password: {
        validations: value => ({
          length: value && value.length > 5 ? null : 'password must be >5'
        })
      },
      confirmPassword: {
        validations: (value, { password }) => ({
          same: value === password ? null : 'passwords must be the same'
        })
      },
      sex: {
        initialValue: 'male',
        validations: value => {
          const required = !value ? 'sex is required' : null;
          return {
            required
          };
        }
      }
    }
  }
};


export default class App extends React.Component {

  state = {
    example: 'MyForm'
  }

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
            onChange={newForm => {this.setState({ [name]: newForm });}}
            {...otherProps[name]}
            form={(this.state[name] || {}).form || (otherProps[name] || {}).form}
          />
        ))}

      </View>
    );
  }
}
