import * as React from 'react';
import { mapValues } from 'lodash';
import { noop } from 'lodash';

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

export interface P {
  fields: FormoFields,
  [key: string]: any
}

export interface WP extends P {
  onChange?: OnChange
}

export interface OP extends P {
  onChange: OnChange
}

export type State = {
  fields: FormoFields
}

export default function formoStateHandler(Component: React.ComponentClass<WP>): React.ComponentClass<OP> {

  return class FormoStateHandler extends React.PureComponent<OP, State> {

    static displayName = `FormoStateHandler${(Component.displayName || '')}`

    state = {
      fields: this.props.fields
    };

    onChange = (fields: FormoFields, meta: Meta) => {
      const { onChange = noop } = this.props; // apparently defaultProps doesn't work
      this.setState({
        fields
        // oldFields: this.state.fields // TODO should this be used in `cwrp` to avoid useless setState/(or to optimize componentShouldUpdate)?
      }, () => {
        onChange(fields, meta);
      });
    }

    mergeFields = (fieldsFromProps: FormoFields, fieldsFromState: FormoFields) => {
      // the source of truths of which fields are in the form come from the props (they can be removed, or new ones added)
      return mapValues(fieldsFromProps, (_, fieldName: string) => ({
        // still, bits of form state can be managed just from formo component state
        ...fieldsFromState[fieldName],
        ...fieldsFromProps[fieldName] // it would be the first argument, but for symmetry...
      }));
    }

    componentWillReceiveProps({ fields } : WP) {
      const mergedFields = this.mergeFields(fields, this.state.fields);

      this.setState({
        fields: mergedFields
      });
    }

    getLocals(props: WP) {
      const { onChange } = this;
      const { fields } = this.state;
      return {
        ...props,
        fields,
        onChange
      };
    }

    render() {
      return <Component {...this.getLocals(this.props)} />
    }

  }
}


