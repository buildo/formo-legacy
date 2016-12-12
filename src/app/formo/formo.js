import React from 'react';
import t from 'tcomb';
import { props } from 'tcomb-react';
import omit from 'lodash/omit';
import mapValues from 'lodash/mapValues';
import map from 'lodash/map';

const set = (key) => (value) => object => ({
  ...object,
  [key]: value
});

const getForm = fields => mapValues(fields, field => ({
  value: field.value || field.initialValue || '',
  validations: field.validations || (() => ({})),
  initialValue: field.initialValue || ''
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

    onChange = fieldName => value => {
      const { form } = this.state;
      const { [fieldName]: field } = form;
      const newField = set('value')(value)(field);
      const newForm = set(fieldName)(newField)(form);
      this.props.onChange(newForm);
    };

    onFocus = fieldName => () => {
      const { form } = this.state;
      const { [fieldName]: field } = form;
      const newField = set('active')(true)(field);
      const activeFalseForm = mapValues(form, set('active')(false));
      const newForm = set(fieldName)(newField)(activeFalseForm);
      this.props.onChange(newForm);
    };

    onBlur = fieldName => () => {
      const { form } = this.state;
      const { [fieldName]: field } = form;
      const _newField = set('active')(false)(field);
      const newField = set('touched')(true)(_newField);
      const newForm = set(fieldName)(newField)(form);
      this.props.onChange(newForm);
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
      const validations = field.validations(field.value);
      const isValid = map(validations).every(x => x === null);
      return {
        ...field,
        validations,
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
