import * as t from 'tcomb';

const ValidationsErrors = t.list(t.String, 'ValidationErrors');

export const Field = t.interface({
  active: t.Boolean,
  initialValue: t.Any,
  isChanged: t.Boolean,
  isValid: t.Boolean,
  set: t.Function,
  setActive: t.Function,
  touch: t.Function,
  touched: t.Boolean,
  unsetActive: t.Function,
  update: t.Function,
  validationErrors: ValidationsErrors,
  value: t.Any
}, { name: 'Field', strict: false });

export const Form = t.interface({
  allTouched: t.Boolean,
  clearValues: t.Function,
  isChanged: t.Boolean,
  isValid: t.Boolean,
  touchAll: t.Function,
  touched: t.Boolean,
  validationErrors: ValidationsErrors
});
