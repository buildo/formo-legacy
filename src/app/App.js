import React from 'react';
import * as _examples from './examples';
import View from 'react-flexview';
import map from 'lodash/map';
import omit from 'lodash/omit';
import isUndefined from 'lodash/isUndefined';

const examples = omit(_examples, ['__esModule']);

import 'react-flexview/src/flexView.scss';

const integerPattern = /^([+-]?[1-9]\d*|0)$/;
const isInteger = (value) => integerPattern.test(value);

const checkEmail = (email) => {
  return email !== 'esistegia@gmail.com';
};

const otherProps = {
  MyForm: {
    title: 'My Form',
    validations: {
      form: {
        ifMaleMustFinishWithO: ({ email, sex }) => sex !== 'male' || (email || '').slice(-1) === 'o'
      },
      email: {
        isAvailable: checkEmail,
        isBeautiful: e => e === 'beautiful',
        required: (value) => !!value,
        lengthMoreThan5: (value) => !!value && value.length > 5
      },
      password: {
        lengthMoreThan5: (value) => !!value && value.length > 5,
        unsafePassword: (value, { favouriteNumber }) => value !== favouriteNumber
      },
      favouriteNumber: {
        isInteger,
        bigEnough: (value) => isInteger(value) && value > 10
      },
      confirmPassword: {
        sameAsPassword: (value, { password }) => value === password
      },
      sex: {
        required: (value) => !!value
      }
    },
    fields: {
      email: {},
      favouriteNumber: {},
      password: {},
      confirmPassword: {},
      sex: { initialValue: 'male' }
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
            onChange={(newForm, meta) => {
              this.setState({
                [name]: newForm,
                [`${name}IsValid`]: meta.form.isValid,
                [`${name}IsChanged`]: meta.form.isChanged,
                [`${name}IsTouched`]: meta.form.touched,
                [`${name}IsAllTouched`]: meta.form.allTouched
              });
            }}
            {...otherProps[name]}
            fields={this.state[name] || (otherProps[name] || {}).fields}
          />
        ))}

        {map(examples, (Component, name) => this.state.example === name && (
          <div key={name}>
            This is a sibling of the form {name}
            {!isUndefined(this.state[`${name}IsValid`]) && !isUndefined(this.state[`${name}IsChanged`]) && (
              <div>
                Still, it knows that the form
                <div> {this.state[`${name}IsChanged`] ? 'is changed' : 'didn\'t change'}</div>
                <div>{this.state[`${name}IsValid`] ? 'is valid' : 'is not valid'}</div>
                <div>{this.state[`${name}IsTouched`] ? 'has been touched' : 'has\'t been touched'}</div>
                <div>{this.state[`${name}IsAllTouched`] ? 'has been touched everywhere' : 'hasn\'t been touched everywhere'}</div>
              </div>
            )}
          </div>
        ))}

      </View>
    );
  }
}
