import React from 'react';
import { Button } from 'buildo-react-components';
import View from 'react-flexview';
import Input from './Input';

import 'react-flexview/src/flexView.scss';
import 'buildo-react-components/src/button/button.scss';
import './style.scss';

import Highlight from 'react-highlight';
import 'highlight.js/styles/monokai-sublime.css';

const Message = ({ iff = true, children, style, ...other }) => iff ? (
  <View vAlignContent='center' style={{ color: '#F25F5C', marginLeft: 10, ...style }} {...other}>
    {children}
  </View>
) : <View />;

const Log = ({ children, style, ...other }) => {
  return (
    <View vAlignContent='center' style={{ fontSize: 18, marginTop: 20, ...style }} {...other}>
      <Highlight>{children}</Highlight>
    </View>
  );
};

const EmailField = ({
  email,
  onEmailChange,
  onFieldTouch,
  onFieldActivate,
  userExists
}) => (
  <View style={{ position: 'relative', marginBottom: 20 }}>
    <View basis={200} vAlignContent='center'>Email</View>
    <Input
      type='email'
      value={email.value}
      onChange={onEmailChange}
      onFocus={onFieldActivate('email')}
      onBlur={onFieldTouch('email')}
      isValid={!email.touched || email.isValid}
      isActive={email.active}
    />
    <Message iff={email.validating} style={{ color: '#247BA0' }}>Verifying email...</Message>
    <Message iff={email.touched && !email.isValid}>Please digit a valid email</Message>
    <Message iff={userExists === true && email.isValid}>{`Email ${email.value} is already registered`}</Message>
  </View>
);

const PasswordField = ({ password, onPasswordChange, onFieldTouch, onFieldActivate }) => (
  <View style={{ position: 'relative', marginBottom: 20 }}>
    <View basis={200} vAlignContent='center'>Password</View>
    <Input
      type='password'
      value={password.value}
      onChange={onPasswordChange}
      onFocus={onFieldActivate('password')}
      onBlur={onFieldTouch('password')}
      isValid={!password.touched || password.isValid}
      isActive={password.active}
    />
    <Message iff={password.touched && !password.isValid}>Please allow at least 10 characters for your password</Message>
  </View>
);

const SubmitButton = ({ email, password }) => (
  <View hAlignContent='right'>
    <Button
      label='Submit'
      buttonState={(email.isValid && password.isValid) ? 'ready' : 'not-allowed'}
      onClick={() => alert('thank you for sign up')}
    />
  </View>
);

const containerStyle = {
  padding: 20,
  background: '#DFDFDF'
};

const FormoComponent = ({ ...props, log }) => (
  <View
    column
    grow
    height='100%'
    vAlignContent='center'
    hAlignContent='center'
    style={{ background: '#247BA0' }}
  >


    <View width='1000' column style={containerStyle}>

      <EmailField {...props} />

      {props.userExists === false && props.email.isValid && <PasswordField {...props} />}

      <SubmitButton {...props} />

    </View>


    <Log shrink={false}>
      {log}
    </Log>

  </View>
  );



export default FormoComponent;
