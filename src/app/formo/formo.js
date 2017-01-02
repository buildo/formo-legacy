import React from 'react';
import t from 'tcomb';
import { props } from 'tcomb-react';
import { skinnable, pure, contains } from 'revenge';
import omit from 'lodash/omit';
import mapValues from 'lodash/mapValues';
import omitBy from 'lodash/omitBy';
import isNull from 'lodash/isNull';
import every from 'lodash/every';
import includes from 'lodash/includes';
import some from 'lodash/some';
import find from 'lodash/find';
import findKey from 'lodash/findKey';
import flowRight from 'lodash/flowRight';
import constant from 'lodash/constant';

const returnEmpty = constant({});

const set = (key) => (value) => object => ({
  ...object,
  [key]: value
});

//TODO handle when more than one input is passed active -> throw warning

//TODO think about how to handle null in this case
const firstDefined = (...args) => find(args, x => x !== void 0);

const formo = (Component) => {
  @pure
  @skinnable(contains(Component))
  @props({
    validations: t.maybe(t.dict(t.String, t.Function)), //TODO use this object for all the fields validations
    form: t.Object,
    onChange: t.Function// should it be maybe? it works also in full stateful mode
  }, { strict: false })
  class Formo extends React.Component {

    static defaultProps = {
      validations: {}
    }

    static displayName = `Formo${(Component.displayName || Component.name || '')}`

    validations = mapValues(this.props.form, field => field.validations || returnEmpty)

    getForm = (form) => mapValues(form, (field, fieldName) => ({
      ...field,
      value: firstDefined(field.value, field.initialValue),
      initialValue: firstDefined(field.initialValue),
      validations: field.validations || this.validations[fieldName] || returnEmpty
    }))

    formWithValidations = form => {
      return mapValues(form, (field) => {
        const validations = omitBy(field.validations(field.value, mapValues(form, 'value')), x => x === null);
        const isValid = every(validations, isNull);
        return {
          ...field,
          validations,
          isValid
        };
      });
    }

    state = {
      form: flowRight(this.formWithValidations, this.getForm)(this.props.form)
    }

    onChange = (_newForm) => {
      const newForm = mapValues(_newForm, field => omit(field, ['validations', 'isValid']));
      const form = flowRight(this.formWithValidations, this.getForm)(newForm);
      this.setState({ form }, () => {
        this.props.onChange(newForm);
      });
    }

    componentWillReceiveProps(props) {
      const form = mapValues(this.state.form, (field, fieldName) => ({
        ...this.state.form[fieldName],
        ...(props.form || {})[fieldName]
      }));
      const newForm = flowRight(this.formWithValidations, this.getForm)(form);
      this.setState({ form: newForm });
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
      const clearedForm = mapValues(form, field => set('value')(firstDefined(field.initialValue))(field));
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

    isChanged = ({ value, initialValue }) => {
      const similarlyNil = ['', undefined, null];
      return (
        value !== initialValue &&
        !(includes(similarlyNil, value) && includes(similarlyNil, initialValue))
      );
    }

    formIsChanged = form => some(form, this.isChanged);

    formIsValid = (fields, formValidations) => {
      return every(fields, 'isValid') && every(formValidations, x => x === null);
    }

    enforceOnlyOneActive = (form) => {
      const firstFieldActive = findKey(form, 'active');
      return mapValues(form, (field, fieldName) => ({
        ...field,
        active: fieldName === firstFieldActive
      }));
    }

    getLocals(_props) {
      const props = omit(_props, ['onChange', 'form', 'validations']);
      const fields = flowRight(this.formWithSetters, this.enforceOnlyOneActive)(this.state.form);
      const formValidations = (this.props.validations.form || returnEmpty)(mapValues(fields, 'value'));
      const form = {
        clearValues: this.clearValues,
        touchAll: this.touchAll,
        touched: some(fields, 'touched'),
        allTouched: every(fields, 'touched'),
        validations: omitBy(formValidations, x => x === null),
        isValid: this.formIsValid(fields, formValidations),
        isChanged: this.formIsChanged(fields)
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
