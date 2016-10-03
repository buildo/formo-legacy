import React from 'react';
import { Button, LoadingSpinner } from 'buildo-react-components';
import View from 'react-flexview';
import Input from './Input';

import 'react-flexview/src/flexView.scss';
import 'buildo-react-components/src/button/button.scss';

const Message = ({ iff = true, children, ...other }) => iff ? (
  <View vAlignContent='center' style={{ color: 'red', marginLeft: 10 }} {...other}>
    {children}
  </View>
) : <View />;

const containerStyle = {
  padding: 20,
  background: 'rgba(123,32,98,.2)'
};

const FormoComponent = ({
  log,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onFieldTouch,
  onFieldActivate,
  userExists
}) => (
  <View column grow vAlignContent='center' hAlignContent='center'>

    <View width='600' column style={containerStyle}>
      <View style={{ position: 'relative', marginBottom: 20 }}>
        <View basis={100} vAlignContent='center'>Email</View>
        <Input
          type='email'
          value={email.value}
          onChange={onEmailChange}
          onFocus={onFieldActivate('email')}
          onBlur={onFieldTouch('email')}
          isValid={!email.touched || email.isValid}
          isActive={email.active}
        />
        {email.validating && <LoadingSpinner size='small' />}
        <Message iff={email.touched && !email.isValid}>Please digit a valid email</Message>
        <Message iff={userExists === true}>{`Email ${email.value} is already registered`}</Message>
      </View>
      {userExists === false && email.isValid && (
        <View style={{ position: 'relative', marginBottom: 20 }}>
          <View basis={100} vAlignContent='center'>Password</View>
          <Input
            type='password'
            value={password.value}
            onChange={onPasswordChange}
            onFocus={onFieldActivate('password')}
            onBlur={onFieldTouch('password')}
            isValid={!password.touched || password.isValid}
            isActive={password.active}
          />
          <Message iff={password.touched && !password.isValid}>Please at least 10 characters for your password</Message>
        </View>
      )}
      <View hAlignContent='right'>
        <Button
          label='Submit'
          buttonState={(email.isValid && password.isValid) ? 'ready' : 'not-allowed'}
          onClick={() => alert('thank you for sign up')}
        />
      </View>
    </View>
    <View shrink={false}>
      {log}
    </View>

  </View>
  );



export default FormoComponent;
