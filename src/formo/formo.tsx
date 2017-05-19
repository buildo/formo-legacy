import { constant } from 'lodash';
import { every } from 'lodash';
import { find } from 'lodash';
import { findKey } from 'lodash';
import { flowRight } from 'lodash';
import { includes } from 'lodash';
import { isEqual } from 'lodash';
import { mapValues } from 'lodash';
import { omit } from 'lodash';
import { pick } from 'lodash';
import { pickBy } from 'lodash';
import { some } from 'lodash';
import * as React from 'react';
import formoStateHandler from './formo-state-handler';
import {
  Form, FormoField, FormoFields, FormoProps,
  FormoStateHandlerProps, FormoValidation,  FormoValidations, FormoWrapperProps,
  MetaForm, ValidationsErrors
} from './types';

const returnEmpty = constant({});

const set = (key: string) => (value: any) => (object: object) => ({
  ...object,
  [key]: value
});

const firstDefined = (...args: any[]) => find(args, (x: any) => x !== void 0);

const innerSet = (object: { [key: string]: any }) => (firstKey: string) => (secondKey: string) => (value: any) => {
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
  return mapValues(fields, (field) => set('value')(field.initialValue)(field));
};

const touchAll = (fields: FormoFields): FormoFields => {
  return mapValues(fields, set('touched')(true));
};

const formo = (Component: React.ComponentClass<FormoWrapperProps>): React.ComponentClass<FormoStateHandlerProps> => {

  class Formo extends React.PureComponent<FormoProps, React.ComponentState> {

    public static displayName = `Formo${(Component.displayName || '')}`;

    public evalValidations = (validations: FormoValidation | (() => {}), value: any, otherValues?: any) => {
      const evaluated = mapValues(validations, (validationFn) => validationFn(value, otherValues));
      const validationErrors = pickBy(evaluated, (x) => x === false);
      return mapValues({ validationErrors }, Object.keys);
    }

    public getFieldsValues = (fields: FormoFields) => mapValues(fields, (field) => ({
      ...field,
      initialValue: firstDefined(field.initialValue),
      value: firstDefined(field.value, field.initialValue)
    }))

    public fieldsWithValidations = (fields: FormoFields) => {
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

    public onChange = (newFields: FormoFields): void => {
      const { fieldsAreChanged, fieldsWithValidations, enforceOnlyOneActive } = this;
      const propsKeysToOmit = ['validationErrors', 'isValid', 'isChanged'];
      const newFieldsValues = this.getFieldsValues(newFields);

      const fields: FormoFields = mapValues(newFieldsValues, (x) => omit(x, propsKeysToOmit));
      const richFields = flowRight(fieldsAreChanged, fieldsWithValidations, enforceOnlyOneActive)(fields);
      const meta = {
        ...mapValues(richFields, (x) => pick(x, propsKeysToOmit)),
        form: this.makeForm(fields, this.props.validations)
      };
      this.props.onChange(fields, meta);
    }

    public updateValue = (fieldName: string) => (value: any) => {
      this.onChange(updateValue(this.props.fields)(fieldName)(value));
    }

    public setActive = (fieldName: string) => () => {
      this.onChange(setActive(this.props.fields)(fieldName));
    }

    public touch = (fieldName: string) => (): void => {
      this.onChange(touch(this.props.fields)(fieldName));
    }

    public unsetActive = (fieldName: string) => (): void => {
      this.onChange(unsetActive(this.props.fields)(fieldName));
    }

    public set = (fieldName: string) => (prop: string, value: any) => {
      this.onChange(innerSet(this.props.fields)(fieldName)(prop)(value));
    }

    public clearValue = (fieldName: string) => (): void => {
      this.onChange(clearValue(this.props.fields)(fieldName));
    }

    public clearValues = (): void => {
      this.onChange(clearValues(this.props.fields));
    }

    public touchAll = (): void => {
      this.onChange(touchAll(this.props.fields));
    }

    public fieldsWithSetters = (fields: FormoFields) =>
      mapValues(fields, (field: FormoField<any>, fieldName: string) => {
        const setters = {
          clear: this.clearValue(fieldName),
          set: this.set(fieldName),
          setActive: this.setActive(fieldName),
          touch: this.touch(fieldName),
          unsetActive: this.unsetActive(fieldName),
          update: this.updateValue(fieldName)
        };
        return { ...field, ...setters };
      })

    public isChanged = ({ value, initialValue }: FormoField<any>) => {
      const similarlyNil = ['', undefined, null];
      return (
        !isEqual(value, initialValue) &&
        !(includes(similarlyNil, value) && includes(similarlyNil, initialValue))
      );
    }

    public fieldsAreChanged = (fields: FormoFields) => {
      return mapValues(fields, (field: FormoField<any>) => ({ ...field, isChanged: this.isChanged(field) }));
    }

    public formIsChanged = (fields: FormoFields) => some(fields, this.isChanged);

    public formIsValid = (fields: FormoFields, validationErrors: ValidationsErrors) => {
      return every(fields, 'isValid') && (validationErrors.length === 0);
    }

    public enforceOnlyOneActive = (fields: FormoFields) => {
      const firstFieldActive = findKey(fields, 'active');
      return mapValues(fields, (field, fieldName) => ({
        ...field,
        active: fieldName === firstFieldActive
      }));
    }

    public fieldsAreTouched = (fields: FormoFields) => {
      return mapValues(fields, (field) => ({
        ...field,
        touched: !!field.touched
      }));
    }

    public makeForm = (fields: FormoFields, validations?: FormoValidations): MetaForm => {
      const parsedFields = flowRight(
        this.fieldsWithValidations,
        this.enforceOnlyOneActive,
        this.fieldsAreChanged,
        this.getFieldsValues
      )(fields);
      const formValidation = validations && validations.form || returnEmpty;
      const { validationErrors } = this.evalValidations(formValidation, mapValues(parsedFields, 'value'));
      return {
        allTouched: every(fields, 'touched'),
        isChanged: this.formIsChanged(fields),
        isValid: this.formIsValid(fields, validationErrors),
        touched: some(fields, 'touched'),
        validationErrors
      };
    }

    public formWithSetters = (form: MetaForm): Form => ({
      ...form,
      clearValues: this.clearValues,
      touchAll: this.touchAll
    })

    public getLocals(props: FormoProps): FormoWrapperProps {
      const otherProps = omit(props, ['onChange', 'fields', 'validations']);
      const fields = flowRight(
        this.fieldsAreTouched,
        this.fieldsWithSetters,
        this.fieldsWithValidations,
        this.enforceOnlyOneActive,
        this.fieldsAreChanged,
        this.getFieldsValues
      )(props.fields);
      const form: Form = flowRight(
        this.formWithSetters,
        this.makeForm
      )(props.fields, props.validations);
      return {
        ...otherProps,
        ...fields,
        form
      };
    }

    public render() {
      return <Component {...this.getLocals(this.props)} />;
    }

  }

  return formoStateHandler(Formo);
};

export default formo;
