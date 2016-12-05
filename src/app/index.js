/* eslint-disable no-copy-paste-default-export/default, react/no-multi-comp */
import React from 'react';
import t from 'tcomb';
import { skinnable, pure } from 'revenge';
import { props } from 'tcomb-react';
import View from 'react-flexview';
import { Dropdown } from 'buildo-react-components';
import omit from 'lodash/omit';
import mapValues from 'lodash/mapValues';
import map from 'lodash/map';

const getForm = fields => mapValues(fields, field => ({
  value: field.value || field.initialValue || '',
  getSyncValidationErrors: field.getSyncValidationErrors || (() => ({}))
}));

const formo = getOptions => Component => {
  @props({
    value: t.maybe(t.Object), // should be a Formo object,
    onChange: t.Function
  }, { strict: false })
  class Formo extends React.Component {
    state = {
      form: null
    };

    componentWillMount() {
      this.setState({
        form: getForm(getOptions(this.props.value || {}))
      });
    }

    componentWillReceiveProps(props) {
      this.setState({
        formOptions: getOptions(props.value),
        form: props.value
      });
    }

    onChange = key => fieldValue => {
      const value = this.state.form;
      const newValue = {
        ...value,
        [key]: {
          ...value[key],
          value: fieldValue,
          touched: true
        }
      };
      this.props.onChange(newValue);
    };

    onFocus = key => () => {
      const value = this.state.form;
      const newValue = {
        ...value,
        [key]: {
          ...value[key],
          active: true
        }
      };
      this.props.onChange(newValue);
    };

    onBlur = key => () => {
      const value = this.state.form;
      const newValue = {
        ...value,
        [key]: {
          ...value[key],
          active: false
        }
      };
      this.props.onChange(newValue);
    };

    formWithSetters = form => mapValues(form, (field, key) => {
      const setters = {
        onChange: this.onChange(key),
        onFocus: this.onFocus(key),
        onBlur: this.onBlur(key)
      };
      return {
        ...field,
        ...setters,
        setters
      };
    });

    formWithSyncValidation = form => mapValues(form, field => {
      const syncValidationErrors = field.getSyncValidationErrors(field.value);
      const isValid = map(syncValidationErrors).every(x => x === null);
      return {
        ...field,
        syncValidationErrors,
        isValid
      };
    });

    render() {
      return (
        <Component
          {...omit(this.props, ['onChange', 'value'])}
          {...this.formWithSetters(this.formWithSyncValidation(this.state.form))}
        />
      );
    }
  }

  return Formo;
};

@formo((props) => ({
  email: {
    initialValue: props.email || '',
    getSyncValidationErrors: value => {
      const required = !value ? 'email is required' : null;
      return {
        required,
        length: !required && value.length > 5 ? null : 'email must be longer than 5 chars'
      };
    }
  },
  password: {
    getSyncValidationErrors: value => ({
      length: value && value.length > 5 ? null : 'password must be >5'
    })
  },
  sex: {
    initialValue: props.sex || ''
  }
}))
@pure
@skinnable()
class MyForm extends React.Component {
  template(props) {
    const { email, password, sex, sexOptions } = props;
    const style = field => ({
      borderColor: field.isValid ? 'green' : 'red',
      backgroundColor: field.active ? 'yellow' : 'white'
    });

    return (
      <View row>
        <View column>
          <input
            value={email.value}
            {...email.setters}
            onChange={e => email.onChange(e.target.value)}
            style={style(email)}
          />
          <input
            type='password'
            value={password.value}
            {...password.setters}
            onChange={e => password.onChange(e.target.value)}
            style={style(password)}
          />
          <Dropdown
            value={sex.value}
            options={sexOptions}
            {...sex.setters}
          />
        </View>
        <View column>
          <View>{!email.isValid && email.touched && JSON.stringify(email.syncValidationErrors)}</View>
          <View>{!password.isValid && password.touched && JSON.stringify(password.syncValidationErrors)}</View>
          <View />
        </View>
      </View>
    );
  }
}

export default class Component extends React.Component {
  state = {
    form: null
  };

  render() {
    return (
      <MyForm
        sexOptions={['male', 'female'].map(value => ({ value, label: value }))}
        value={this.state.form}
        onChange={value => { this.setState({ form: value }); }}
      />
    );
  }
}
