import React from 'react';
import t, { maybe } from 'tcomb';
import cx from 'classnames';
import { skinnable } from 'revenge';
import { props } from 'tcomb-react';
import FormsyAsyncValidationElement from './asyncValidation';

import './spinner.gif';

@FormsyAsyncValidationElement
@skinnable()
@props({
  value: maybe(t.String),
  setValue: t.Function,
  getErrorMessage: t.Function,
  isValid: t.Function,
  isValidValue: t.Function,
  isValidating: t.Boolean,
  showRequired: t.Function,
  isRequired: t.Function,
  onInvalid: t.Function
}, { strict: false })
export default class Input extends React.Component {

  changeValue = ({ target: { value } }) => {
    // `setValue` triggers 'formsy-react' and the validation mechanism.
    // In this particular case, setValue is overwritten by `FormsyAsyncValidationElement` decorator
    // in order to trigger async validation if any async validator is provided.
    this.props.setValue(value);
    if (!this.props.isValidValue(value))
      this.props.onInvalid(); // invalid email should hide password field
  }

  getLocals({ name, getValue, getErrorMessage, isValid, isValidating, showRequired, isRequired }) {
    return {
      value: getValue(),
      errorMessage: getErrorMessage(),
      isValid: isValid(),
      isValidating,
      showRequired: showRequired(),
      isRequired: isRequired(),
      name
    };
  }

  template({ name, value, errorMessage, isValid, isValidating, showRequired, isRequired }) {
    return (
      <div style={{ height: '30px', padding: 0 }}>
        <span className='form-label' style={{ fontWeight: 'bold', marginRight: 20, width: 100, display: 'inline-block' }}>
          {name}
          {showRequired && <span>{isRequired ? '*' : null}</span>}
        </span>
        <input
          type='text'
          value={value}
          onChange={this.changeValue}
          className={cx({ isValid })}
          style={{
            border: '1px solid grey',
            borderColor: isValid ? 'green' : 'red',
            height: 30,
            outline: 'none',
            fontSize: '16px',
            marginRight: 20
          }}
        />
        {isValidating && <img src='src/components/Formo/Fields/spinner.gif' height='20px' />}
        {errorMessage && <span style={{ color: 'red' }}>{errorMessage}</span>}
      </div>
    );
  }
}