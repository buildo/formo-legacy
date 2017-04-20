/* eslint-disable no-copy-paste-default-export/default, react/no-multi-comp */
import * as React from 'react';
import * as t from 'tcomb';
import { props } from 'tcomb-react';
import { skinnable, pure } from 'revenge';
import View from 'react-flexview';
import { Dropdown } from 'buildo-react-components';
import formo, { Input } from 'formo';
import { compact } from 'lodash';
import { map } from 'lodash';
import printJSON from 'printJSON';

import 'buildo-react-components/src/dropdown/dropdown.scss';

const style = ({ isValid, active, touched }) => ({
  borderColor: touched ? isValid ? 'green' : 'red' : 'black',
  backgroundColor: active ? 'yellow' : 'white'
});

const formoConfig = (props) => {
  return props.value || ({
    email: {
      initialValue: props.emailInitialValue,
      validations: value => {
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
    sex: {
      initialValue: props.sex || '',
      validations: value => {
        const required = !value ? 'sex is required' : null;
        return {
          required
        };
      }
    }
  });
};

@formo(formoConfig)
@pure
@skinnable()
@props({
  value: t.maybe(t.Object),
  emailInitialValue: t.maybe(t.String),
  emailona: t.maybe(t.String),
  email: t.Object, // specify
  password: t.Object, // specify
  sex: t.Object, // specify
  form: t.Object
})
export default class MyForm extends React.Component {

  template({ email, password, sex } ) {

    return (
      <View basis='50%'>
        <View column width={600}>
          <View>
            <Input
              value={email.value}
              onFocus={email.setActive}
              onBlur={email.unsetActive}
              onChange={email.update}
              style={style(email)}
            />
            {email.touched && compact(map(email.validations)).join(', ')}
          </View>
          <View>
            <Input
              type='password'
              value={password.value}
              onFocus={password.setActive}
              onBlur={password.unsetActive}
              onChange={password.update}
              style={style(password)}
            />
            {password.touched && compact(map(password.validations)).join(', ')}
          </View>
          <View style={style(sex)}>
            <Dropdown
              clearable
              value={sex.value}
              options={'male female'.split(' ').map(x => ({ value: x, label: x }))}
              onChange={sex.update}
            />
            {sex.touched && compact(map(sex.validations)).join(', ')}
          </View>
        </View>
        <View column marginTop={30}>
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
