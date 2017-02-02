import React from 'react';
import t, { dict, maybe, inter, list } from 'tcomb';
import { props } from 'tcomb-react';
import { skinnable, pure, contains } from 'revenge';
import omit from 'lodash/omit';
import omitF from 'lodash/fp/omit';
import pickF from 'lodash/fp/pick';
import mapValues from 'lodash/mapValues';
import pickBy from 'lodash/pickBy';
import every from 'lodash/every';
import includes from 'lodash/includes';
import some from 'lodash/some';
import find from 'lodash/find';
import findKey from 'lodash/findKey';
import flowRight from 'lodash/flowRight';
import constant from 'lodash/constant';
import isEqual from 'lodash/isEqual';
import formoStateHandler from './formo-state-handler';

const FormoField = inter({
  value: t.Any,
  initialValue: t.Any,
  touched: maybe(t.Boolean),
  active: maybe(t.Boolean)
}, { strict: false, name: 'FormoField' });

const FormoFields = dict(t.String, FormoField, 'FormoFields');

const FormoValidations = dict(t.String, dict(t.String, t.Function), 'FormoValidations');
const Validations = list(t.String, 'Validations');
const Validating = list(t.String, 'Validating');

export const Field = inter({
  value: t.Any,
  initialValue: t.Any,
  touched: t.Boolean,
  active: t.Boolean,
  validationErrors: Validations,
  validating: Validating,
  isValid: t.Boolean,
  isChanged: t.Boolean,
  touch: t.Function,
  setActive: t.Function,
  unsetActive: t.Function,
  update: t.Function,
  clear: t.Function,
  set: t.Function
}, { strict: false, name: 'Field' });

export const Form = inter({
  validationErrors: Validations,
  validating: Validating,
  isValid: t.Boolean,
  isChanged: t.Boolean,
  touched: t.Boolean,
  allTouched: t.Boolean,
  clearValues: t.Function,
  touchAll: t.Function
}, { strict: false, name: 'Form' });

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

const touch = (fields) => (fieldName) => {
  return innerSet(fields)(fieldName)('touched')(true);
};

const unsetActive = (fields) => (fieldName) => {
  // set the field to active: false
  const deactivated = innerSet(fields)(fieldName)('active')(false);
  // set the field to touched: true
  return touch(deactivated)(fieldName);
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
  @formoStateHandler
  @pure
  @skinnable(contains(Component))
  @props({
    validations: maybe(FormoValidations),
    fields: FormoFields,
    setValidating: t.Function,
    onChange: t.Function
  }, { strict: false })
  class Formo extends React.Component {

    static displayName = `Formo${(Component.displayName || Component.name || '')}`

    evalValidations = (validations, value, otherValues, fieldName) => {
      const evaluated = mapValues(validations, validationFn => validationFn(value, otherValues));
      const validationErrors = pickBy(evaluated, x => x === false);
      const validating = pickBy(evaluated, x => x instanceof Promise);
      this.props.setValidating(fieldName, validating);
      return mapValues({ validationErrors, validating }, Object.keys);
    };

    getFields = (fields) => mapValues(fields, (field, fieldName) => ({
      ...field,
      value: firstDefined(field.value, field.initialValue),
      validations: this.props.validations[fieldName] || {},
      initialValue: firstDefined(field.initialValue)
    }))

    fieldsWithValidations = fields => {
      return mapValues(fields, (field, fieldName) => {
        const { validationErrors, validating } = this.evalValidations(field.validations, field.value, mapValues(fields, 'value'), fieldName);
        const isValid = validationErrors.length === 0;
        return {
          ...omit(field, 'validations'),
          validationErrors,
          validating,
          isValid
        };
      });
    }

    onChange = (newFields) => {
      const fields = mapValues(newFields, omitF(['validationErrors', 'isValid', 'validating', 'isChanged']));
      const richFields = flowRight(this.fieldsAreChanged, this.fieldsWithValidations, this.enforceOnlyOneActive, this.getFields)(fields);
      const meta = {
        ...mapValues(richFields, pickF(['validationErrors', 'isValid', 'validating', 'isChanged'])),
        form: this.makeForm({ fields, validations: this.props.validations })
      };
      this.props.onChange(fields, meta);
    }

    updateValue = (fieldName) => value => {
      this.onChange(updateValue(this.props.fields)(fieldName)(value));
    };

    setActive = (fieldName) => () => {
      this.onChange(setActive(this.props.fields)(fieldName));
    };

    touch = (fieldName) => () => {
      this.onChange(touch(this.props.fields)(fieldName));
    };

    unsetActive = fieldName => () => {
      this.onChange(unsetActive(this.props.fields)(fieldName));
    };

    set = (fieldName) => (prop, value) => {
      this.onChange(innerSet(this.props.fields)(fieldName)(prop)(value));
    }

    clearValue = (fieldName) => () => {
      this.onChange(clearValue(this.props.fields)(fieldName));
    }

    clearValues = () => {
      this.onChange(clearValues(this.props.fields));
    }

    touchAll = () => {
      this.onChange(touchAll(this.props.fields));
    }

    fieldsWithSetters = fields => mapValues(fields, (field, fieldName) => {
      const setters = {
        set: this.set(fieldName),
        touch: this.clearValue(fieldName),
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
        !isEqual(value, initialValue) &&
        !(includes(similarlyNil, value) && includes(similarlyNil, initialValue))
      );
    }

    fieldsAreChanged = (fields) => {
      return mapValues(fields, (field) => ({ ...field, isChanged: this.isChanged(field) }));
    }

    formIsChanged = fields => some(fields, this.isChanged);

    formIsValid = (fields, validationErrors) => {
      return every(fields, 'isValid') && (validationErrors.length  === 0);
    }

    enforceOnlyOneActive = (fields) => {
      const firstFieldActive = findKey(fields, 'active');
      return mapValues(fields, (field, fieldName) => ({
        ...field,
        active: fieldName === firstFieldActive
      }));
    }

    fieldsAreTouched = (fields) => {
      return mapValues(fields, (field) => ({
        ...field,
        touched: !!field.touched
      }));
    }

    makeForm = ({ fields: rawFields, validations }) => {
      const fields = flowRight(this.fieldsWithValidations, this.enforceOnlyOneActive, this.fieldsAreChanged, this.getFields)(rawFields);
      const { validationErrors, validating } = this.evalValidations(validations.form || returnEmpty, mapValues(fields, 'value'));
      return {
        touched: some(fields, 'touched'),
        allTouched: every(fields, 'touched'),
        validationErrors,
        validating,
        isValid: this.formIsValid(fields,  validationErrors),
        isChanged: this.formIsChanged(fields)
      };
    }

    formWithSetters = (form) => ({
      ...form,
      clearValues: this.clearValues,
      touchAll: this.touchAll
    })

    getLocals(_props) {
      const props = omit(_props, ['onChange', 'fields', 'validations', 'setValidating']);
      const fields = flowRight(this.fieldsAreTouched, this.fieldsWithSetters, this.fieldsWithValidations, this.enforceOnlyOneActive, this.fieldsAreChanged, this.getFields)(this.props.fields);
      const form = flowRight(this.formWithSetters, this.makeForm)({ fields: this.props.fields, validations: this.props.validations });
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
