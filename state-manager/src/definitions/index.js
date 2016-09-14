import t, { dict, struct, refinement, maybe } from 'tcomb';

export const typeCheckOriginalValue = ({ type, originalValue }) => {
  return type.is(originalValue);
};

export const Fieldo = refinement(struct({
  type: t.Type,
  originalValue: t.Any,
  value: t.Any,
  touched: t.Boolean, // is the field being touched by the user (focused, or focused then blurred); can't be set back to false
  active: t.Boolean, // focused, current
  validating: t.Boolean, // ongoing async validation
  isValid: maybe(t.Function)
}, { strict: true }), typeCheckOriginalValue, 'Fieldo');

export const Formo = dict(t.String, Fieldo, 'Formo');
