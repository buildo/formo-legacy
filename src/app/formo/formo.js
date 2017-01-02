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

const firstDefined = (...args) => find(args, x => x !== void 0);

const formo = (Component) => {
  @pure
  @skinnable(contains(Component))
  @props({
    validations: t.maybe(t.dict(t.String, t.Function)),
    fields: t.Object,
    onChange: t.Function// should it be maybe? it works also in full stateful mode
  }, { strict: false })
  class Formo extends React.Component {

    static defaultProps = {
      validations: {}
    }

    static displayName = `Formo${(Component.displayName || Component.name || '')}`

    getFields = (fields) => mapValues(fields, (field, fieldName) => ({
      ...field,
      value: firstDefined(field.value, field.initialValue),
      validations: this.props.validations[fieldName] || returnEmpty,
      initialValue: firstDefined(field.initialValue)
    }))

    fieldsWithValidations = fields => {
      return mapValues(fields, (field) => {
        const validations = omitBy(field.validations(field.value, mapValues(fields, 'value')), x => x === null);
        const isValid = every(validations, isNull);
        return {
          ...field,
          validations,
          isValid
        };
      });
    }

    state = {
      fields: flowRight(this.fieldsWithValidations, this.getFields)(this.props.fields)
    }

    onChange = (_newFields) => {
      const newFields = mapValues(_newFields, field => omit(field, ['validations', 'isValid']));
      const fields = flowRight(this.fieldsWithValidations, this.getFields)(newFields);
      this.setState({ fields }, () => {
        this.props.onChange(newFields);
      });
    }

    componentWillReceiveProps(props) {
      const fields = mapValues(this.state.fields, (field, fieldName) => ({
        ...this.state.fields[fieldName],
        ...(props.fields || {})[fieldName]
      }));
      const newFields = flowRight(this.fieldsWithValidations, this.getFields)(fields);
      this.setState({ fields: newFields });
    }

    updateValue = fieldName => value => {
      const { fields } = this.state;
      const { [fieldName]: field } = fields;
      const newField = set('value')(value)(field);
      const newFields = set(fieldName)(newField)(fields);
      this.onChange(newFields);
    };

    setActive = fieldName => () => {
      const { fields } = this.state;
      const { [fieldName]: field } = fields;
      const newField = set('active')(true)(field);
      const activeFalseFields = mapValues(fields, set('active')(false));
      const newFields = set(fieldName)(newField)(activeFalseFields);
      this.onChange(newFields);
    };

    unsetActive = fieldName => () => {
      const { fields } = this.state;
      const { [fieldName]: field } = fields;
      const _newField = set('active')(false)(field);
      const newField = set('touched')(true)(_newField);
      const newFields = set(fieldName)(newField)(fields);
      this.onChange(newFields);
    };

    set = (fieldName) => (prop, value) => {
      const { fields } = this.state;
      const { [fieldName]: field } = fields;
      const newField = set(prop)(value)(field);
      const newFields = set(fieldName)(newField)(fields);
      this.onChange(newFields);
    }

    clearValues = () => {
      const { fields } = this.state;
      const clearedFields = mapValues(fields, field => set('value')(firstDefined(field.initialValue))(field));
      this.onChange(clearedFields);
    }

    touchAll = () => {
      const { fields } = this.state;
      const touchedFields =  mapValues(fields, set('touched')(true));
      this.onChange(touchedFields);
    }

    formWithSetters = fields => mapValues(fields, (field, key) => {
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

    formIsChanged = fields => some(fields, this.isChanged);

    formIsValid = (fields, formValidations) => {
      return every(fields, 'isValid') && every(formValidations, x => x === null);
    }

    enforceOnlyOneActive = (fields) => {
      const firstFieldActive = findKey(fields, 'active');
      return mapValues(fields, (field, fieldName) => ({
        ...field,
        active: fieldName === firstFieldActive
      }));
    }

    getLocals(_props) {
      const props = omit(_props, ['onChange', 'fields', 'validations']);
      const fields = flowRight(this.formWithSetters, this.enforceOnlyOneActive)(this.state.fields);
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
