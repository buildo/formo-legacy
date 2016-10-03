import React from 'react';
import { pure, skinnable } from 'revenge';
import { FormoInput, FormoPassword } from 'Formo';
import Formsy from 'formsy-react-wrapper';

@skinnable()
@pure
export default class LoginForm extends React.Component {

  state = { canSubmit: false, showPassword: false }

  constructor(args) {
    super(args);

    // Fake validation rule, used only to delay the validation till we know if the 'password'
    // field should be visible (if an async rule is used in any field, the form validation is false
    // till the rule is validated)
    Formsy.addAsyncValidationRule('existsEmail', (value) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.setState({ showPassword: value === 'vincenzo@buildo.io' });
          resolve('check ok');
        }, 1000);
      });
    });
  }

  enableSubmitButton = () => {
    this.setState({
      canSubmit: true
    });
  };

  disableSubmitButton = () => {
    this.setState({
      canSubmit: false
    });
  };

  // when the sync validation fails, the async validation is not even triggered, so we need
  // a way to hide the 'password' field when the email is not valid
  onInvalidEmail = () => {
    if (this.state.showPassword)
      this.setState({ showPassword: false });
  }

  getLocals() {

    const {
      enableSubmitButton,
      disableSubmitButton,
      state: {
        canSubmit,
        showPassword
      }
    } = this;

    return {
      enableSubmitButton,
      disableSubmitButton,
      canSubmit,
      showPassword
    };
  }

  template({
    enableSubmitButton,
    disableSubmitButton,
    canSubmit,
    showPassword
  }) {

    return (
      <Formsy.Form
        onValid={enableSubmitButton}
        onInvalid={disableSubmitButton}
        onValidSubmit={(model) => {
          alert(JSON.stringify(model));
        }}
        onInvalidSubmit={() => {
          alert('ERROR');
        }}
      >
        <div className='formsy' style={{ maxWidth: 500, border: '1px solid grey', padding: 20 }}>
          <div style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: 20 }}>Login</div>
          <div className='groupBody'>
            <FormoInput
              name='email'
              validations='isEmail'
              validationError='This is not a valid email'
              required
              asyncValidations='existsEmail'
              onInvalid={this.onInvalidEmail}
            />
            {showPassword &&
              <FormoPassword
                name='password'
                validations='minLength:4'
                validationError='Password should be at least 4 chars long'
                required
              />
            }
          </div>
          <div style={{ textAlign: 'center' }}>
            <button
              type='submit'
              disabled={!canSubmit}
              style={{
                width: 100,
                height: 30,
                border: '1px solid',
                textAlign: 'center',
                marginTop: 20,
                backgroundColor: 'white',
                cursor: canSubmit ? 'pointer' : 'not-allowed'
              }}
            >Submit</button>
          </div>
        </div>
      </Formsy.Form>
    );
  }
}