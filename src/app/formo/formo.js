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

const set = (key) => (value) => (object) => ({
  ...object,
  [key]: value
});

const firstDefined = (...args) => find(args, x => x !== void 0);

const innerSet = (object) => (firstKey) => (secondKey) => (value) => {
  const newFirstKeyObject = set(secondKey)(value)(object[firstKey]);
  return set(firstKey)(newFirstKeyObject)(object);
};

const updateValue = (fields) => (fieldName) => (value) => {
  return innerSet(fields)(fieldName)('value')(value);
};

const setActive = (fields) => (fieldName) => {
  // set all fields to active: false
  const activeFalseFields = mapValues(fields, set('active')(false));
  // set fieldName field to active: true
  return innerSet(activeFalseFields)(fieldName)('active')(true);
};

const unsetActive = (fields) => (fieldName) => {
  // set the field to active: false
  const deactivated = innerSet(fields)(fieldName)('active')(false);
  // set the field to touched: true
  return innerSet(deactivated)(fieldName)('touched')(true);
};

const clearValue = (fields) => (fieldName) => {
  return innerSet(fields)(fieldName)('value')(undefined);
};

const clearValues = (fields) => {
  return mapValues(fields, field => set('value')(field.initialValue)(field));
};

const touchAll = (fields) => {
  return mapValues(fields, set('touched')(true));
};

const formo = (Component) => {
  @pure
  @skinnable(contains(Component))
  @props({
    validations: t.maybe(t.dict(t.String, t.Function)),
    fields: t.Object, // dict(t.String, t.Object) or dict(t.String, Field)
    onChange: t.Function// should it be maybe? it works also in full stateful mode
  }, { strict: false })
  class Formo extends React.Component {

    static defaultProps = {
      validations: {}// add onChange: () => {}
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
      this.onChange(updateValue(this.state.fields)(fieldName)(value));
    };

    setActive = fieldName => () => {
      this.onChange(setActive(this.state.fields)(fieldName));
    };

    unsetActive = fieldName => () => {
      this.onChange(unsetActive(this.state.fields)(fieldName));
    };

    set = (fieldName) => (prop, value) => {
      this.onChange(innerSet(this.state.fields)(fieldName)(prop)(value));
    }

    clearValue = (fieldName) => () => {
      this.onChange(clearValue(this.state.fields)(fieldName));
    }

    clearValues = () => {
      this.onChange(clearValues(this.state.fields));
    }

    touchAll = () => {
      this.onChange(touchAll(this.state.fields));
    }

    fieldsWithSetters = fields => mapValues(fields, (field, fieldName) => {
      const setters = {
        set: this.set(fieldName),
        clear: this.clearValue(fieldName),
        update: this.updateValue(fieldName),
        setActive: this.setActive(fieldName),
        unsetActive: this.unsetActive(fieldName)
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

    fieldsAreChanged = (fields) => {
      return mapValues(fields, (field) => ({ ...field, isChanged: this.isChanged(field) }));
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
      const fields = flowRight(this.fieldsWithSetters, this.enforceOnlyOneActive, this.fieldsAreChanged)(this.state.fields);
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
