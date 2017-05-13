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

export interface FormoValidation { [key: string]: (value: any, otherValue: any) => boolean }
export interface FormoValidations { [key: string]:  FormoValidation }

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

export type Form = {
  validationErrors: ValidationsErrors,
  isValid: boolean,
  isChanged: boolean,
  touched: boolean,
  allTouched: boolean,
  clearValues: () => void,
  touchAll: () => void
}

export interface Fields {
  [key: string]: Field<any>
}

// type FormKey = 'form' | 'other-form';
// export type ComponentProps = Fields & { [k in FormKey]: Form };

export interface ComponentProps {
  [key: string]: Field<any> | Form,
  form: Form
}

type OnChange = (fields: FormoFields, meta: Meta) => void;

export type Props = { [key: string]: FormoField<any> } & {
  onChange?: OnChange
}

interface FormoBaseProps {
  fields: FormoFields
  validations: FormoValidations,
}

export interface FormoProps extends FormoBaseProps {
  onChange: OnChange
}

export interface FormoStateHandlerProps extends FormoBaseProps {
  onChange?: OnChange
}

export type FormoStateHandlerState = {
  fields: FormoFields
}
