import React from 'react';
import t from 'tcomb';
import { pure, skinnable, contains } from 'revenge';
import FormoComponent from './FormoComponent';
import { Formo, Fieldo } from 'formo';

const initialTextField = {
  type: t.String,
  originalValue: '',
  value: '',
  touched: false,
  active: false,
  validating: false,
  isValid: false
};

const log = x => { //eslint-disable-line
  console.log(x); // eslint-disable-line
  return x;
};

const isValidPassword = (value) => value.length > 10;

const emailRegex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

const isValidEmail = (value) => emailRegex.test(value);

const formoTransition = (formo) => Formo({
  email: Fieldo({ ...formo.email, isValid: isValidEmail(formo.email.value) }),
  password: Fieldo({ ...formo.password, isValid: isValidPassword(formo.password.value) })
});

const initialFormo = Formo({
  email: Fieldo({ ...initialTextField, isValid: isValidEmail(initialTextField.value) }),
  password: Fieldo({ ...initialTextField, isValid: isValidPassword(initialTextField.value) })
});

@pure
@skinnable(contains(FormoComponent))
export default class FormoComponentContainer extends React.Component {

  state = {
    formo: initialFormo
  }

  onFieldTouch = (formo) => (fieldName) => () => {
    const newFormo = formoTransition(Formo.deactivate(Formo.touch(formo)(fieldName))(fieldName));
    this.setState({
      formo: newFormo
    });
  };


  onFieldActivate = (formo) => (fieldName) => () => {
    const newFormo = formoTransition(Formo.activate(formo)(fieldName));
    this.setState({
      formo: newFormo
    });
  };

  onEmailChange = (formo) => (newValue) => {
    const newFormo = formoTransition(Formo.update(formo)('email')(newValue));
    this.setState({
      formo: newFormo
    });
  };

  onPasswordChange = (formo) => (newValue) => {
    const newFormo = formoTransition(Formo.update(formo)('password')(newValue));
    this.setState({
      formo: newFormo
    });
  };

  getLocals = () => {
    return ({
      log: JSON.stringify(this.state.formo, null, 2),
      email: this.state.formo.email,
      password: this.state.formo.password,
      onEmailChange: this.onEmailChange(this.state.formo),
      onPasswordChange: this.onPasswordChange(this.state.formo),
      onFieldTouch: this.onFieldTouch(this.state.formo),
      onFieldActivate: this.onFieldActivate(this.state.formo),
      userExists: false
    });
  }

}
