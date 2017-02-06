/* eslint-disable no-copy-paste-default-export/default, react/no-multi-comp */
import React from 'react';
import t from 'tcomb';
import { props } from 'tcomb-react';
import { skinnable, pure } from 'revenge';
import View from 'react-flexview';
import { Dropdown } from 'buildo-react-components';
import formo, { Field, Form } from 'formo';
import every from 'lodash/every';
import printJSON from 'printJSON';
import { Input } from 'formo/dom';

import 'buildo-react-components/src/dropdown/dropdown.scss';
import 'buildo-react-components/src/loading-spinner/loadingSpinner.scss';
import './myForm.scss';

const style = ({ isValid, active, touched }) => ({
  borderColor: touched ? isValid ? 'green' : 'red' : 'black',
  backgroundColor: active ? 'yellow' : 'white'
});

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
      <View basis='50%' style={{ fontSize: 26 }}>
        <View column width='50%'>
          {title}
          <View style={{ position: 'relative' }}>
            <Input
              type='email'
              placeholder='Insert your email'
              value={email.value}
              onFocus={email.setActive}
              onBlur={email.unsetActive}
              onChange={email.update}
              style={style(email)}
            />
            {email.touched && email.validationErrors.join(', ')}
          </View>
          <View style={{ position: 'relative' }}>
            <Input
              type='text'
              placeholder='Type your favourite number'
              value={favouriteNumber.value}
              onFocus={favouriteNumber.setActive}
              onBlur={favouriteNumber.unsetActive}
              onChange={favouriteNumber.update}
              style={style(favouriteNumber)}
            />
            {favouriteNumber.touched && favouriteNumber.validationErrors.join(', ')}
          </View>
          <View style={{ position: 'relative' }}>
            <Input
              type='password'
              placeholder='Choose a password'
              value={password.value}
              onFocus={password.setActive}
              onBlur={password.unsetActive}
              onChange={password.update}
              style={style(password)}
            />
            {password.touched && password.validationErrors.join(', ')}
            {password.isChanged && <button onClick={password.clear}>CLEAR</button>}
          </View>
          <View style={{ position: 'relative' }}>
            <Input
              type='password'
              placeholder='Repeat the password'
              value={confirmPassword.value}
              onFocus={confirmPassword.setActive}
              onBlur={confirmPassword.unsetActive}
              onChange={confirmPassword.update}
              style={style(confirmPassword)}
            />
            {confirmPassword.touched && confirmPassword.validationErrors.join(', ')}
          </View>
          <View style={{ position: 'relative', ...style(sex) }}>
            <Dropdown
              clearable
              placeholder='your sex'
              value={sex.value}
              onFocus={sex.setActive}
              onBlur={sex.unsetActive}
              options={'male female'.split(' ').map(x => ({ value: x, label: x }))}
              onChange={sex.update}
            />
            {sex.touched && sex.validationErrors.join(', ')}
          </View>
          <View>
            {every({ email, password, confirmPassword, sex }, 'isValid') && form.validationErrors.join(', ')}
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
            style={{ height: 1000, width: 1000, fontFamily: 'monospace', fontSize: 20 }}
            value={printJSON({ email, favouriteNumber, password, confirmPassword, sex, form })}
          />
        </View>
      </View>
    );
  }

}
