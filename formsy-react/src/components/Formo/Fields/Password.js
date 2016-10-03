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
  isRequired: t.Function,
  isValid: t.Function,
  getErrorMessage: t.Function
}, { strict: false })
export default class Password extends React.Component {

  changeValue = (e) => {
    this.props.setValue(e.target.value);
  }

  getLocals({ name, getValue, isRequired, isValid, getErrorMessage }) {
    return {
      name,
      value: getValue(),
      onChange: this.changeValue,
      isRequired: isRequired(),
      isValid: isValid(),
      errorMessage: getErrorMessage()
    };
  }

  template({ name, value, onChange, isRequired, isValid, errorMessage }) {
    return (
      <div>
        <span>{isRequired ? '*' : null}</span>
        <span className='form-label' style={{ fontWeight: 'bold', marginRight: 20, width: 100, display: 'inline-block' }}>{name}</span>
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