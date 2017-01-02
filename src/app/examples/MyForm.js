/* eslint-disable no-copy-paste-default-export/default, react/no-multi-comp */
import React from 'react';
import t from 'tcomb';
import { props } from 'tcomb-react';
import { skinnable, pure } from 'revenge';
import View from 'react-flexview';
import { Dropdown } from 'buildo-react-components';
import formo from 'formo';
import every from 'lodash/every';
import map from 'lodash/map';
import printJSON from 'printJSON';

import 'buildo-react-components/src/dropdown/dropdown.scss';

const style = ({ isValid, active, touched }) => ({
  borderColor: touched ? isValid ? 'green' : 'red' : 'black',
  backgroundColor: active ? 'yellow' : 'white'
});

@formo
@pure
@skinnable()
@props({
  title: t.String,
  email: t.Object, // specify
  password: t.Object, //specify
  confirmPassword: t.Object, //specify
  sex: t.Object, //specify
  form: t.Object
})
export default class MyForm extends React.Component {

  template({ title, email, password, confirmPassword, sex, form } ) {

    return (
      <View basis='50%'>
        <View column width={600}>
          {title}
          <View>
            <input
              value={email.value || ''}
              onFocus={email.setActive}
              onBlur={email.unsetActive}
              onChange={e => email.update(e.target.value)}
              style={style(email)}
            />
            {email.touched && map(email.validations).join(', ')}
          </View>
          <View>
            <input
              type='password'
              value={password.value || ''}
              onFocus={password.setActive}
              onBlur={password.unsetActive}
              onChange={e => password.update(e.target.value)}
              style={style(password)}
            />
            {password.touched && map(password.validations).join(', ')}
          </View>
          <View>
            <input
              type='password'
              value={confirmPassword.value || ''}
              onFocus={confirmPassword.setActive}
              onBlur={confirmPassword.unsetActive}
              onChange={e => confirmPassword.update(e.target.value)}
              style={style(confirmPassword)}
            />
            {confirmPassword.touched && map(confirmPassword.validations).join(', ')}
          </View>
          <View style={style(sex)}>
            <Dropdown
              clearable
              value={sex.value || ''}
              onFocus={sex.setActive}
              onBlur={sex.unsetActive}
              options={'male female'.split(' ').map(x => ({ value: x, label: x }))}
              onChange={sex.update}
            />
            {sex.touched && map(sex.validations).join(', ')}
          </View>
          <View>
            {every({ email, password, confirmPassword, sex }, 'isValid') && map(form.validations).join(', ')}
          </View>
          <View>
            <button onClick={form.clearValues}>Clear</button>
          </View>
          <View>
            <button onClick={form.touchAll}>Validate</button>
          </View>
        </View>
        <View column  marginTop={30}>
          <textarea
            readOnly
            style={{ height: 500, width: 500, fontFamily: 'monospace' }}
            value={printJSON({ form, email, password, confirmPassword, sex })}
          />
        </View>
      </View>
    );
  }

}
