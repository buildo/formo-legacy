import React from 'react';
import t from 'tcomb';
import { props } from 'tcomb-react';
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

export default formo;
