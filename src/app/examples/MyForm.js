/* eslint-disable no-copy-paste-default-export/default, react/no-multi-comp */
import React from 'react';
import t from 'tcomb';
import { props } from 'tcomb-react';
import { skinnable, pure } from 'revenge';
import View from 'react-flexview';
import { Dropdown } from 'buildo-react-components';
import formo, { Field, Form } from 'formo';
import every from 'lodash/every';
import map from 'lodash/map';
import printJSON from 'printJSON';
import { Input } from 'formo/dom';

import 'buildo-react-components/src/dropdown/dropdown.scss';

const style = ({ isValid, active, touched }) => ({
  borderColor: touched ? isValid ? 'green' : 'red' : 'black',
  backgroundColor: active ? 'yellow' : 'white'
});

console.log({ Field, Form });

@formo
@pure
@skinnable()
@props({
  title: t.String,
  email: Field,
  favouriteNumber: Field,
  password: Field,
  confirmPassword: Field,
  sex: Field,
  form: Form
})
export default class MyForm extends React.Component {

  template({ title, email, password, confirmPassword, sex, form, favouriteNumber } ) {

    return (
      <View basis='50%'>
        <View column width={600}>
          {title}
          <View>
            <Input
              type='email'
              placeholder='Insert your email'
              value={email.value}
              onFocus={email.setActive}
              onBlur={email.unsetActive}
              onChange={email.update}
              style={style(email)}
            />
            {email.touched && map(email.validations).join(', ')}
          </View>
          <View>
            <Input
              type='text'
              placeholder='Type your favourite number'
              value={favouriteNumber.value}
              onFocus={favouriteNumber.setActive}
              onBlur={favouriteNumber.unsetActive}
              onChange={favouriteNumber.update}
              style={style(favouriteNumber)}
            />
            {favouriteNumber.touched && map(favouriteNumber.validations).join(', ')}
          </View>
          <View>
            <Input
              type='password'
              placeholder='Choose a password'
              value={password.value}
              onFocus={password.setActive}
              onBlur={password.unsetActive}
              onChange={password.update}
              style={style(password)}
            />
            {password.touched && map(password.validations).join(', ')}
            {password.isChanged && <button onClick={password.clear}>CLEAR</button>}
          </View>
          <View>
            <Input
              type='password'
              placeholder='Repeat the password'
              value={confirmPassword.value}
              onFocus={confirmPassword.setActive}
              onBlur={confirmPassword.unsetActive}
              onChange={confirmPassword.update}
              style={style(confirmPassword)}
            />
            {confirmPassword.touched && map(confirmPassword.validations).join(', ')}
          </View>
          <View style={style(sex)}>
            <Dropdown
              clearable
              placeholder='your sex'
              value={sex.value}
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
            value={printJSON({ email, favouriteNumber, password, confirmPassword, sex, form })}
          />
        </View>
      </View>
    );
  }

}
