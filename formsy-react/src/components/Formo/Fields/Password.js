import React from 'react';
import t, { maybe } from 'tcomb';
import cx from 'classnames';
import { skinnable } from 'revenge';
import { props } from 'tcomb-react';
import { Decorator as FormsyElement } from 'formsy-react';

@FormsyElement()
@skinnable()
@props({
  name: t.String,
  value: maybe(t.String),
  setValue: t.Function,
  showRequired: t.Function,
  isRequired: t.Function,
  isValid: t.Function,
  getErrorMessage: t.Function
}, { strict: false })
export default class Password extends React.Component {

  changeValue = (e) => {
    // `setValue` triggers 'formsy-react' and the validation mechanism.
    this.props.setValue(e.target.value);
  }

  getLocals({ name, getValue, showRequired, isRequired, isValid, getErrorMessage }) {
    return {
      name,
      value: getValue(),
      onChange: this.changeValue,
      showRequired: showRequired(),
      isRequired: isRequired(),
      isValid: isValid(),
      errorMessage: getErrorMessage()
    };
  }

  template({ name, value, onChange, showRequired, isRequired, isValid, errorMessage }) {
    return (
      <div>
        <span className='form-label' style={{ fontWeight: 'bold', marginRight: 20, width: 100, display: 'inline-block' }}>
          {name}
          {showRequired && <span>{isRequired ? '*' : null}</span>}
        </span>
        <input
          type='password'
          value={value}
          onChange={onChange}
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
        {errorMessage && <span style={{ color: 'red' }}>{errorMessage}</span>}
      </div>
    );
  }
}