import React from 'react';
import { Fields, reduxForm } from 'redux-form';
import validate from './validate';
import validateAsync from './validateAsync';

function renderFields({ email, password }) {
  console.log(email, password);

  const {
    valid: emailValid,
    error: emailError,
    touched: emailTouched
  } = email.meta;

  const showPassword = emailValid && !emailError;
  return (
    <div>
      <input type='email' {...email.input} />
      {emailTouched && emailError && <span>{emailError}</span>}
      {showPassword && (
        <input type='password' {...password.input} />
      )}
    </div>
  );
}

function ReduxForm(props) {

  const { handleSubmit, pristine, submitting, valid } = props;

  const submitDisabled = !valid || pristine || submitting;

  return (
    <form onSubmit={handleSubmit}>
      <Fields names={['email', 'password']} component={renderFields} />
      <button type='submit' disabled={submitDisabled}>Submit</button>
    </form>
  );
}

export default reduxForm({
  form: 'redux-form',
  validate,
  asyncValidate: validateAsync,
  asyncBlurFields: ['email']
})(ReduxForm);
