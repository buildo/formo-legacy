import { Formo, Fieldo } from '../definitions';
import mapValues from 'lodash/mapValues';

export const patchField = (form) => (fieldName) => (patch) => {
  return Formo({
    ...form,
    [fieldName]: Fieldo({
      ...form[fieldName],
      ...patch
    })
  });
};

export const setExclusively = (form) => (fieldName) => (propName) => {
  return Formo({
    ...mapValues(form, otherField => Fieldo({
      ...otherField,
      [propName]: false
    })),
    [fieldName]: Fieldo({
      ...form[fieldName],
      [propName]: true
    })
  });
};
