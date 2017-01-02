import React from 'react';
import * as _examples from './examples';
import View from 'react-flexview';
import map from 'lodash/map';
import omit from 'lodash/omit';

const examples = omit(_examples, ['__esModule']);

import 'react-flexview/src/flexView.scss';

const otherProps = {
  MyForm: {
    title: 'My Form',
    validations: {
      form: ({ email, sex }) => ({
        stupidRequirement: (sex === 'male' && email.slice(-1) !== 'o') ? 'Males\' mails should finish with "o"' : null
      }),
      email: (value) => {
        const required = !value ? 'email is required' : null;
        return {
          required,
          length: !required && value.length > 5 ? null : 'email must be longer than 5 chars'
        };
      },
      password: (value) => ({
        length: value && value.length > 5 ? null : 'password must be >5'
      }),
      confirmPassword: (value, { password }) => ({
        same: value === password ? null : 'passwords must be the same'
      }),
      sex: (value) => {
        const required = !value ? 'sex is required' : null;
        return {
          required
        };
      }
    },
    fields: {
      email: {
        initialValue: 'mario.poverello@gmail.com'
      },
      password: {},
      confirmPassword: {},
      sex: {
        initialValue: 'male'
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
            fields={(this.state[name] || {}).fields || (otherProps[name] || {}).fields}
          />
        ))}

      </View>
    );
  }
}
