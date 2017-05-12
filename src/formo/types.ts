export interface FormoField<T> {
  value?: T,
  initialValue?: T,
  touched?: boolean,
  active?: boolean,
};

export interface MetaField {
  validationErrors: Array<string>,
  isValid: boolean,
  isChanged: boolean
}

export type MetaFields = {
  [key: string]: MetaField
}

export interface MetaForm extends MetaField {
  touched: boolean,
  allTouched: boolean
}

export interface Meta extends MetaFields {
  form: MetaForm
}

export type FormoFields = { [key: string]: FormoField<any> };

export type OnChange = (fields: FormoFields, meta: Meta) => void;

export interface Props {
  fields: FormoFields,
  [key: string]: any
}

export interface FormoStateHandlerProps extends Props {
  onChange?: OnChange
}

export interface FormoProps extends Props {
  onChange: OnChange
}

export type State = {
  fields: FormoFields
}

export interface FormoValidation<T> { [key: string]: (value: T) => boolean }
export interface FormoValidations<T> { [key: string]:  FormoValidation<T> }

export type ValidationsErrors = Array<string>;

export interface Field<T> {
  value: T,
  initialValue: T,
  touched: boolean,
  active: boolean,
  validationErrors: ValidationsErrors,
  isValid: boolean,
  isChanged: boolean,
  touch: () => void,
  setActive: () => void,
  unsetActive: () => void,
  update: (value: T) => void,
  clear: () => void,
  set: () => void
}

export interface Form {
  validationErrors: ValidationsErrors,
  isValid: boolean,
  isChanged: boolean,
  touched: boolean,
  allTouched: boolean,
  clearValues: () => void,
  touchAll: () => void
}
