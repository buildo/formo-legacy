import React from 'react';
import t from 'tcomb';
import { props } from 'tcomb-react';
import { skinnable, pure, contains } from 'revenge';
import omit from 'lodash/omit';
import mapValues from 'lodash/mapValues';
import omitBy from 'lodash/omitBy';
import map from 'lodash/map';
import every from 'lodash/every';
import includes from 'lodash/includes';
import some from 'lodash/some';
import find from 'lodash/find';
import flowRight from 'lodash/flowRight';

const set = (key) => (value) => object => ({
  ...object,
  [key]: value
});

//TODO handle when more than one input is passed active -> throw warning

//TODO think about how to handle null in this case
const firstAvailable = (...args) => find(args, x => x !== void 0);

const getForm = (form) => mapValues(form, field => ({
  ...field,
  value: firstAvailable(field.value, field.initialValue),
  validations: field.validations || (() => ({})),
  initialValue: firstAvailable(field.initialValue)
}));

const formo = (Component) => {
  @pure
  @skinnable(contains(Component))
  @props({
    form: t.Object,
    onChange: t.Function
  }, { strict: false })
  class Formo extends React.Component {

    static displayName = `Formo${(Component.displayName || Component.name || '')}`

    state = {
      form: getForm(this.props.form)
    };

    onChange = (newForm) => {
      this.setState({ form: newForm }, () => {
        this.props.onChange(this.state.form);
      });
    }

    componentWillReceiveProps(props) {
      const form = mapValues(this.state.form, (field, fieldName) => ({
        ...this.state.form[fieldName],
        ...(props.form || {})[fieldName]
      }));
      this.setState({ form });
    }

    updateValue = fieldName => value => {
      const { form } = this.state;
      const { [fieldName]: field } = form;
      const newField = set('value')(value)(field);
      const newForm = set(fieldName)(newField)(form);
      this.onChange(newForm);
    };

    setActive = fieldName => () => {
      const { form } = this.state;
      const { [fieldName]: field } = form;
      const newField = set('active')(true)(field);
      const activeFalseForm = mapValues(form, set('active')(false));
      const newForm = set(fieldName)(newField)(activeFalseForm);
      this.onChange(newForm);
    };

    unsetActive = fieldName => () => {
      const { form } = this.state;
      const { [fieldName]: field } = form;
      const _newField = set('active')(false)(field);
      const newField = set('touched')(true)(_newField);
      const newForm = set(fieldName)(newField)(form);
      this.onChange(newForm);
    };

    set = (fieldName) => (prop, value) => {
      const { form } = this.state;
      const { [fieldName]: field } = form;
      const newField = set(prop)(value)(field);
      const newForm = set(fieldName)(newField)(form);
      this.onChange(newForm);
    }

    clearValues = () => {
      const { form } = this.state;
      const clearedForm = mapValues(form, field => set('value')(firstAvailable(field.initialValue))(field));
      this.onChange(clearedForm);
    }

    touchAll = () => {
      const { form } = this.state;
      const touchedForm =  mapValues(form, set('touched')(true));
      this.onChange(touchedForm);
    }

    formWithSetters = form => mapValues(form, (field, key) => {
      const setters = {
        set: this.set(key),
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
      const validations = omitBy(field.validations(field.value), x => x === null);
      const isValid = map(validations).every(x => x === null);
      return {
        ...field,
        validations,
        isValid
      };
    });

    isAdequatelyEqual = ({ value, initialValue }) => {
      const similars = ['', undefined, null];
      return (
        (includes(similars, value) && includes(similars, initialValue)) ||
        value === initialValue
      );
    }

    isChanged = form => some(map(form, v => !this.isAdequatelyEqual(v)));

    getLocals(_props) {
      const props = omit(_props, ['onChange', 'form']);
      const fields = flowRight(this.formWithSetters, this.formWithSyncValidation)(this.state.form);
      const form = {
        clearValues: this.clearValues,
        touchAll: this.touchAll,
        isValid: every(map(fields, f => f.isValid)),
        isChanged: this.isChanged(fields)
      };
      return {
        ...props,
        ...fields,
        form
      };
    }

  }

  return Formo;
};

export default formo;
