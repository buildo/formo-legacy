import React from 'react';
import t from 'tcomb';
import { props } from 'tcomb-react';
import omit from 'lodash/omit';
import mapValues from 'lodash/mapValues';
import map from 'lodash/map';
import find from 'lodash/find';

const set = (key) => (value) => object => ({
  ...object,
  [key]: value
});

const firstAvailable = (...args) => find(args, x => x !== void 0);

const getForm = fields => mapValues(fields, field => ({
  value: firstAvailable(field.value, field.initialValue, ''),
  validations: field.validations || (() => ({})),
  initialValue: firstAvailable(field.initialValue, '')
}));

const formo = getOptions => Component => {
  @props({
    value: t.maybe(t.Object), // should be a Formo object,
    onChange: t.Function
  }, { strict: false })
  class Formo extends React.Component {

    static displayName = `Formo${(Component.displayName || Component.name || '')}`

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

    updateValue = fieldName => value => {
      const { form } = this.state;
      const { [fieldName]: field } = form;
      const newField = set('value')(value)(field);
      const newForm = set(fieldName)(newField)(form);
      this.props.onChange(newForm);
    };

    setActive = fieldName => () => {
      const { form } = this.state;
      const { [fieldName]: field } = form;
      const newField = set('active')(true)(field);
      const activeFalseForm = mapValues(form, set('active')(false));
      const newForm = set(fieldName)(newField)(activeFalseForm);
      this.props.onChange(newForm);
    };

    unsetActive = fieldName => () => {
      const { form } = this.state;
      const { [fieldName]: field } = form;
      const _newField = set('active')(false)(field);
      const newField = set('touched')(true)(_newField);
      const newForm = set(fieldName)(newField)(form);
      this.props.onChange(newForm);
    };

    formWithSetters = form => mapValues(form, (field, key) => {
      const setters = {
        update: this.updateValue(key),
        setActive: this.setActive(key),
        unsetActive: this.unsetActive(key)
      };
      return {
        ...field,
        ...setters
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
