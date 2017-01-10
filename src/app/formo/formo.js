import React from 'react';
import t from 'tcomb';
import { props } from 'tcomb-react';
import { skinnable, pure, contains } from 'revenge';
import omit from 'lodash/omit';
import omitF from 'lodash/fp/omit';
import pickF from 'lodash/fp/pick';
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

const firstDefined = (...args) => find(args, x => x !== void 0 && x !== null);

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
    onChange: t.maybe(t.Function)
  }, { strict: false })
  class Formo extends React.Component {

    static defaultProps = {
      validations: {},
      onChange: () => {}
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
      fields: this.props.fields
    }

    onChange = (newFields) => {
      const fields = mapValues(newFields, omitF(['validations', 'isValid']));
      const richFields = flowRight(this.fieldsAreChanged, this.fieldsWithValidations, this.enforceOnlyOneActive, this.getFields)(fields);
      const meta = {
        ...mapValues(richFields, pickF(['validations', 'isValid'])),
        form: this.makeForm({ fields, validations: this.props.validations })
      };
      this.setState({ fields }, () => {
        this.props.onChange(fields, meta);
      });
    }

    mergeFields = (fieldsFromProps, fieldsFromState) => {
      //the source of truths of which fields are in the form come from the props (they can be removed, or new ones added)
      return mapValues(fieldsFromProps, (field, fieldName) => ({
        //still, bits of form state can be managed just from formo component state
        ...fieldsFromState[fieldName],
        ...field
      }));
    }

    componentWillReceiveProps({ fields }) {
      this.setState({
        fields: this.mergeFields(fields, this.state.fields)
      });
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

    makeForm = ({ fields: rawFields, validations }) => {
      const fields = flowRight(this.fieldsWithValidations, this.enforceOnlyOneActive, this.fieldsAreChanged, this.getFields)(rawFields);
      const formValidations = (validations.form || returnEmpty)(mapValues(fields, 'value'));
      return {
        touched: some(fields, 'touched'),
        allTouched: every(fields, 'touched'),
        validations: omitBy(formValidations, x => x === null),
        isValid: this.formIsValid(fields, formValidations),
        isChanged: this.formIsChanged(fields)
      };
    }

    formWithSetters = (form) => ({
      ...form,
      clearValues: this.clearValues,
      touchAll: this.touchAll
    })

    getLocals(_props) {
      const props = omit(_props, ['onChange', 'fields', 'validations']);
      const fields = flowRight(this.fieldsWithSetters, this.fieldsWithValidations, this.enforceOnlyOneActive, this.fieldsAreChanged, this.getFields)(this.state.fields);
      const form = flowRight(this.formWithSetters, this.makeForm)({ fields: this.state.fields, validations: this.props.validations });
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
