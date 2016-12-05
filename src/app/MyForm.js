/* eslint-disable no-copy-paste-default-export/default, react/no-multi-comp */
import React from 'react';
import t from 'tcomb';
import { props } from 'tcomb-react';
import { skinnable, pure } from 'revenge';
import View from 'react-flexview';
import { Dropdown } from 'buildo-react-components';
import formo from 'formo';

import 'buildo-react-components/src/dropdown/dropdown.scss';

const style = ({ isValid, active }) => ({
  borderColor: isValid ? 'green' : 'red',
  backgroundColor: active ? 'yellow' : 'white'
});

const formoConfig = (props) => ({
  email: {
    initialValue: props.email || '',
    getSyncValidationErrors: value => {
      const required = !value ? 'email is required' : null;
      return {
        required,
        length: !required && value.length > 5 ? null : 'email must be longer than 5 chars'
      };
    }
  },
  password: {
    getSyncValidationErrors: value => ({
      length: value && value.length > 5 ? null : 'password must be >5'
    })
  },
  sex: {
    initialValue: props.sex || ''
  }
});

@formo(formoConfig)
@pure
@skinnable()
@props({
  email: t.Object, // specify
  password: t.Object, //specify
  sex: t.Object, //specify
  sexOptions: t.Array

})
export default class MyForm extends React.Component {

  template({ email, password, sex, sexOptions } ) {

    return (
      <View row>
        <View column>
          <input
            value={email.value}
            {...email.setters}
            onChange={e => email.onChange(e.target.value)}
            style={style(email)}
          />
          <input
            type='password'
            value={password.value}
            {...password.setters}
            onChange={e => password.onChange(e.target.value)}
            style={style(password)}
          />
          <Dropdown
            value={sex.value}
            options={sexOptions}
            {...sex.setters}
          />
        </View>
        <View column>
          <View>{!email.isValid && email.touched && JSON.stringify(email.syncValidationErrors)}</View>
          <View>{!password.isValid && password.touched && JSON.stringify(password.syncValidationErrors)}</View>
          <View />
        </View>
      </View>
    );
  }

}
