import { patchField, setExclusively  } from '../helpers';

export const update = (form) => (fieldName) => (value) => {
  return patchField(form)(fieldName)({ value });
};

export const touch = (form) => (fieldName) => {
  return patchField(form)(fieldName)({ touched: true });
};

export const setAsyncValidating = (form) => (fieldName) => {
  return patchField(form)(fieldName)({ validating: true });
};

export const unsetAsyncValidating = (form) => (fieldName) => {
  return patchField(form)(fieldName)({ validating: false });
};

export const activate = (form) => (fieldName) => {
  return setExclusively(form)(fieldName)('active');
};

export const deactivate = (form) => (fieldName) => {
  return patchField(form)(fieldName)({ active: false });
};
