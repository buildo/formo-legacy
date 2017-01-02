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

const style = ({ isValid, active, touched }) => ({
  borderColor: touched ? isValid ? 'green' : 'red' : 'black',
  backgroundColor: active ? 'yellow' : 'white'
});

@formo
@pure
@skinnable()
@props({
  email: t.Object, // specify
  password: t.Object, //specify
  confirmPassword: t.Object, //specify
  sex: t.Object, //specify
  form: t.Object
})
export default class MyForm extends React.Component {

  template({ email, password, confirmPassword, sex, form } ) {

    return (
      <View basis='50%'>
        <View column width={600}>
          <View>
            <input
              value={email.value || ''}
              onFocus={email.setActive}
              onBlur={email.unsetActive}
              onChange={e => email.update(e.target.value)}
              style={style(email)}
            />
            {email.touched && compact(map(email.validations)).join(', ')}
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
            {password.touched && compact(map(password.validations)).join(', ')}
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
            {confirmPassword.touched && compact(map(confirmPassword.validations)).join(', ')}
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
            {sex.touched && compact(map(sex.validations)).join(', ')}
          </View>
          <View>
            <button onClick={form.clearValues}>Clear</button>
          </View>
        </View>
        <View column  marginTop={30}>
          <textarea
            readOnly
            style={{ height: 500, width: 500, fontFamily: 'monospace' }}
            value={printJSON({ isChanged: form.isChanged, isValid: form.isValid, email, password, sex })}
          />
        </View>
      </View>
    );
  }

}
