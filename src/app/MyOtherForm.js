import React from 'react';
import t from 'tcomb';
import { props } from 'tcomb-react';
import { skinnable, pure } from 'revenge';
import View from 'react-flexview';
import { Dropdown, Toggle } from 'buildo-react-components';
import formo from 'formo';
import compact from 'lodash/compact';
import range from 'lodash/range';
import map from 'lodash/map';
import printJSON from 'printJSON';

import 'buildo-react-components/src/dropdown/dropdown.scss';
import 'buildo-react-components/src/toggle/toggle.scss';

const style = ({ isValid, active, touched }) => ({
  borderColor: touched ? isValid ? 'green' : 'red' : 'black',
  backgroundColor: active ? 'yellow' : 'white'
});

const formoConfig = () => ({
  number: {
    validations: value => {
      return {
        valid: /^\d{16}$/.test(value) ? null : 'Insert a valid credit card number'
      };
    }
  },
  cardholder: {
    validations: value => ({
      valid: /^[A-Z][a-z]+\s[A-Z][a-z]+$/.test(value) ? null : 'Insert a valid name',
      required: value ? null : 'The cardholder name is required'
    })
  },
  expirationMonth: {
    validations: value => {
      return {
        valid: /^\d{2}$/.test(value) ? null : 'Expiration month is not valid',
        required: value ? null : 'The expiration month is required'
      };
    }
  },
  expirationYear: {
    validations: value => {
      return {
        valid: /^\d{4}$/.test(value) ? null : 'Expiration year is not valid',
        required: value ? null : 'The expiration year is required'
      };
    }
  },
  cvv: {
    validations: value => {
      return {
        valid: /^\d{3}$/.test(value) ? null : 'CVV is not valid',
        required: value ? null : 'The CVV is required'
      };
    }
  },
  saveData: {
    initialValue: false
  }
});

const inputStyle = {
  fontSize: 18,
  height: 30,
  marginBottom: 10,
  width: '100%'
};

const Input = ({ onChange, style = {}, ...others }) => <input onChange={e => onChange(e.target.value)} {...others} style={{ ...inputStyle, ...style }} />;

@formo(formoConfig)
@pure
@skinnable()
@props({
  number: t.Object, // specify
  cardholder: t.Object, //specify
  expirationMonth: t.Object, //specify
  expirationYear: t.Object,
  cvv: t.Object,
  saveData: t.Object
})
export default class MyOtherForm extends React.Component {

  template({ number, cardholder, expirationMonth, expirationYear, cvv, saveData }) {

    return (
      <View basis='50%'>
        <View column width={600}>

          <View>
            <Input
              value={cardholder.value}
              {...cardholder.setters}
              style={style(cardholder)}
              placeholder='cardholder'
            />
            {cardholder.touched && compact(map(cardholder.validations)).join(', ')}
          </View>

          <View>
            <Input
              value={number.value}
              {...number.setters}
              style={style(number)}
              placeholder='card number'
            />
            {number.touched && compact(map(number.validations)).join(', ')}
          </View>

          <View style={style(expirationMonth)}>
            <Dropdown
              clearable
              value={expirationMonth.value}
              options={range(12).map(x => `00${x + 1}`.slice(-2)).map(x => ({ value: x, label: x }))}
              {...expirationMonth.setters}
              placeholder='expiration month'
            />
            {expirationMonth.touched && compact(map(expirationMonth.validations)).join(', ')}
          </View>

          <View style={style(expirationYear)}>
            <Dropdown
              clearable
              value={expirationYear.value}
              options={range(2016, 2026).map(x => `${x}`).map(x => ({ value: x, label: x }))}
              {...expirationYear.setters}
              placeholder='expiration year'
            />
            {expirationYear.touched && compact(map(expirationYear.validations)).join(', ')}
          </View>

          <View>
            <Input
              value={cvv.value}
              {...cvv.setters}
              style={style(cvv)}
              placeholder='cvv'
            />
            {cvv.touched && compact(map(cvv.validations)).join(', ')}
          </View>

          <View>
            Save Data?
            <Toggle
              value={Boolean(saveData.value)}
              onChange={saveData.onChange}
              style={style(saveData)}
            />
            {saveData.touched && compact(map(saveData.validations)).join(', ')}
          </View>


        </View>


        <View column  marginTop={30}>
          <textarea
            readOnly
            style={{ height: 500, width: 500, fontFamily: 'monospace' }}
            value={printJSON({ number, cardholder, expirationMonth, expirationYear, cvv, saveData })}
          />
        </View>
      </View>
    );
  }

}
