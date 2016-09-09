import t, { dict, struct } from 'tcomb';
import mapValues from 'lodash/mapValues';

const Fieldo = struct({
  type: t.Type, // maybe
  originalValue: t.Any, // this.type ?,
  value: t.Any, // this.type ?
  touched: t.Boolean, // is the field being touched by the user (focused, or focused then blurred); can't be set back to false
  active: t.Boolean, // focused, current
  validating: t.Boolean // ongoing async validation
}, { strict: true }, 'Fieldo');

const Formo = dict(t.String, Fieldo, 'Formo');

const update = (form) => (fieldName) => (value) => {
  return Formo({
    ...form,
    [fieldName]: Fieldo({
      ...form[fieldName],
      value
    })
  });
};

const touch = (form) => (fieldName) => {
  return Formo({
    ...form,
    [fieldName]: Fieldo({
      ...form[fieldName],
      touched: true
    })
  });
};

const toggleAsyncValidation = (form) => (fieldName) => {
  return Formo({
    ...form,
    [fieldName]: Fieldo({
      ...form[fieldName],
      validating: !form[fieldName].validating
    })
  });
};

const activate = (form) => (fieldName) => {
  return Formo({
    ...mapValues(form, otherField => Fieldo({
      ...otherField,
      active: false
    })),
    [fieldName]: Fieldo({
      ...form[fieldName],
      active: true
    })
  });
};

const isValid = function({ touched, type, value, validating }) {
  return !touched || type.is(value) && !validating;
};

const isChanged = function({ value, originalValue }) {
  return value !== originalValue;
};

Formo.update = update;
Formo.touch = touch;
Formo.toggleAsyncValidation = toggleAsyncValidation;
Formo.activate = activate;

Fieldo.isValid = isValid;
Fieldo.isChanged = isChanged;

export { Fieldo, Formo };
export default Formo;
