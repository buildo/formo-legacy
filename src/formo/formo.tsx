import * as React from 'react';
import { omit } from 'lodash';
import { pick } from 'lodash';
import { mapValues } from 'lodash';
import { pickBy } from 'lodash';
import { every } from 'lodash';
import { includes } from 'lodash';
import { some } from 'lodash';
import { find } from 'lodash';
import { findKey } from 'lodash';
import { flowRight } from 'lodash';
import { constant } from 'lodash';
import { isEqual } from 'lodash';
import formoStateHandler from './formo-state-handler';
import {
  Form, FormoValidation, FormoValidations,
  ComponentProps, FormoStateHandlerProps, FormoProps,
  FormoField, FormoFields, MetaForm, ValidationsErrors
} from './types';

const returnEmpty = constant({});

const set = (key: string) => (value: any) => (object: Object) => ({
  ...object,
  [key]: value
});

const firstDefined = (...args: any[]) => find(args, x => x !== void 0);

const innerSet = (object: { [key:string]: any }) => (firstKey: string) => (secondKey: string) => (value: any) => {
  const newFirstKeyObject = set(secondKey)(value)(object[firstKey]);
  return set(firstKey)(newFirstKeyObject)(object);
};

const updateValue = (fields: FormoFields) => (fieldName: string) => (value: any) => {
  return innerSet(fields)(fieldName)('value')(value);
};

const setActive = (fields: FormoFields) => (fieldName: string) => {
  // set all fields to active: false
  const activeFalseFields = mapValues(fields, set('active')(false));
  // set fieldName field to active: true
  return innerSet(activeFalseFields)(fieldName)('active')(true);
};

const touch = (fields: FormoFields) => (fieldName: string) => {
  return innerSet(fields)(fieldName)('touched')(true);
};

const unsetActive = (fields: FormoFields) => (fieldName: string) => {
  // set the field to active: false
  const deactivated = innerSet(fields)(fieldName)('active')(false);
  // set the field to touched: true
  return touch(deactivated)(fieldName);
};

const clearValue = (fields: FormoFields) => (fieldName: string) => {
  return innerSet(fields)(fieldName)('value')(undefined);
};

const clearValues = (fields: FormoFields) => {
  return mapValues(fields, field => set('value')(field.initialValue)(field));
};

const touchAll = (fields: FormoFields): FormoFields => {
  return mapValues(fields, set('touched')(true));
};

const formo = (Component: React.ComponentClass<ComponentProps>): React.ComponentClass<FormoStateHandlerProps> => {

  class Formo extends React.PureComponent<FormoProps, React.ComponentState> {

    static displayName = `Formo${(Component.displayName || '')}`

    evalValidations = (validations: FormoValidation | (() => {}), value: any, otherValues?: any) => {
      const evaluated = mapValues(validations, (validationFn) => validationFn(value, otherValues));
      const validationErrors = pickBy(evaluated, x => x === false);
      return mapValues({ validationErrors }, Object.keys);
    };

    getFieldsValues = (fields: FormoFields) => mapValues(fields, (field) => ({
      ...field,
      value: firstDefined(field.value, field.initialValue),
      initialValue: firstDefined(field.initialValue)
    }))

    fieldsWithValidations = (fields: FormoFields) => {
      return mapValues(fields, (field, fieldName) => {
        const fieldValidations = fieldName && this.props.validations ? this.props.validations[fieldName] : {};
        const { validationErrors } = this.evalValidations(fieldValidations, field.value, mapValues(fields, 'value'));
        const isValid = validationErrors.length === 0;
        return {
          ...omit(field, 'validations'),
          validationErrors,
          isValid
        };
      });
    }

    onChange = (newFields: FormoFields): void => {
      const fields: FormoFields = mapValues(this.getFieldsValues(newFields), x => omit(x, ['validationErrors', 'isValid', 'isChanged']));
      const richFields = flowRight(this.fieldsAreChanged, this.fieldsWithValidations, this.enforceOnlyOneActive)(fields);
      const meta = {
        ...mapValues(richFields, x => pick(x, ['validationErrors', 'isValid', 'isChanged'])),
        form: this.makeForm({ fields, validations: this.props.validations })
      };
      this.props.onChange(fields, meta);
    }

    updateValue = (fieldName: string) => (value: any) => {
      this.onChange(updateValue(this.props.fields)(fieldName)(value));
    };

    setActive = (fieldName: string) => () => {
      this.onChange(setActive(this.props.fields)(fieldName));
    };

    touch = (fieldName: string) => (): void => {
      this.onChange(touch(this.props.fields)(fieldName));
    };

    unsetActive = (fieldName: string) => (): void => {
      this.onChange(unsetActive(this.props.fields)(fieldName));
    };

    set = (fieldName: string) => (prop: string, value: any) => {
      this.onChange(innerSet(this.props.fields)(fieldName)(prop)(value));
    }

    clearValue = (fieldName: string) => (): void => {
      this.onChange(clearValue(this.props.fields)(fieldName));
    }

    clearValues = (): void => {
      this.onChange(clearValues(this.props.fields));
    }

    touchAll = (): void => {
      this.onChange(touchAll(this.props.fields));
    }

    fieldsWithSetters = (fields: FormoFields) => mapValues(fields, (field: FormoField<any>, fieldName: string) => {
      const setters = {
        set: this.set(fieldName),
        touch: this.touch(fieldName),
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

    isChanged = ({ value, initialValue } : FormoField<any>) => {
      const similarlyNil = ['', undefined, null];
      return (
        !isEqual(value, initialValue) &&
        !(includes(similarlyNil, value) && includes(similarlyNil, initialValue))
      );
    }

    fieldsAreChanged = (fields: FormoFields) => {
      return mapValues(fields, (field: FormoField<any>) => ({ ...field, isChanged: this.isChanged(field) }));
    }

    formIsChanged = (fields: FormoFields) => some(fields, this.isChanged);

    formIsValid = (fields: FormoFields, validationErrors: ValidationsErrors) => {
      return every(fields, 'isValid') && (validationErrors.length === 0);
    }

    enforceOnlyOneActive = (fields: FormoFields) => {
      const firstFieldActive = findKey(fields, 'active');
      return mapValues(fields, (field, fieldName) => ({
        ...field,
        active: fieldName === firstFieldActive
      }));
    }

    fieldsAreTouched = (fields: FormoFields) => {
      return mapValues(fields, (field) => ({
        ...field,
        touched: !!field.touched
      }));
    }

    makeForm = ({ fields: rawFields, validations }: { fields: FormoFields, validations?: FormoValidations }): MetaForm => {
      const fields = flowRight(this.fieldsWithValidations, this.enforceOnlyOneActive, this.fieldsAreChanged, this.getFieldsValues)(rawFields);
      const formValidation = validations && validations.form || returnEmpty;
      const { validationErrors } = this.evalValidations(formValidation, mapValues(fields, 'value'));
      return {
        touched: some(fields, 'touched'),
        allTouched: every(fields, 'touched'),
        validationErrors,
        isValid: this.formIsValid(fields, validationErrors),
        isChanged: this.formIsChanged(fields)
      };
    }

    formWithSetters = (form: MetaForm): Form => ({
      ...form,
      clearValues: this.clearValues,
      touchAll: this.touchAll
    })

    getLocals(_props: FormoProps): ComponentProps {
      const props = omit(_props, ['onChange', 'fields', 'validations']);
      const fields = flowRight(this.fieldsAreTouched, this.fieldsWithSetters, this.fieldsWithValidations, this.enforceOnlyOneActive, this.fieldsAreChanged, this.getFieldsValues)(this.props.fields);
      const form: Form = flowRight(this.formWithSetters, this.makeForm)({ fields: this.props.fields, validations: this.props.validations });
      return {
        ...props,
        ...fields,
        form
      };
    }

    render() {
      return <Component {...this.getLocals(this.props)} />;
    }

  }

  return formoStateHandler(Formo);
};

export default formo;
