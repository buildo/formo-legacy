/* eslint-disable no-copy-paste-default-export/default, react/no-multi-comp */
import React from 'react';
import t from 'tcomb';
import { props } from 'tcomb-react';
import { skinnable, pure } from 'revenge';
import View from 'react-flexview';
import { Dropdown } from 'buildo-react-components';
import formo from 'formo';
import compact from 'lodash/compact';
import map from 'lodash/map';
import printJSON from 'printJSON';

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
    initialValue: props.sex || '',
    getSyncValidationErrors: value => {
      const required = !value ? 'sex is required' : null;
      return {
        required
      };
    }
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
        <View column width={600}>
          <View>
            <input
              value={email.value}
              {...email.setters}
              onChange={e => email.onChange(e.target.value)}
              style={style(email)}
            />
            {email.touched && compact(map(email.syncValidationErrors)).join(', ')}
          </View>
          <View>
            <input
              type='password'
              value={password.value}
              {...password.setters}
              onChange={e => password.onChange(e.target.value)}
              style={style(password)}
            />
            {password.touched && compact(map(password.syncValidationErrors)).join(', ')}
          </View>
          <View>
            <Dropdown
              clearable
              value={sex.value}
              options={sexOptions}
              {...sex.setters}
              style={style(sex)}
            />
            {sex.touched && compact(map(sex.syncValidationErrors)).join(', ')}
          </View>
        </View>
        <View column  marginTop={30}>
          <textarea
            readOnly
            style={{ height: 500, width: 500, fontFamily: 'monospace' }}
            value={printJSON({ email, password, sex })}
          />
        </View>
      </View>
    );
  }

}
