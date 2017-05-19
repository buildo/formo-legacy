import * as React from 'react';
import { mapValues } from 'lodash';
import { noop } from 'lodash';
import { FormoFields, Meta, FormoStateHandlerState, FormoProps, FormoStateHandlerProps } from './types';

export default function formoStateHandler(Component: React.ComponentClass<FormoProps>): React.ComponentClass<FormoStateHandlerProps> {

  return class FormoStateHandler extends React.PureComponent<FormoStateHandlerProps, FormoStateHandlerState> {

    static displayName = `FormoStateHandler${(Component.displayName || '')}`

    state = {
      fields: this.props.fields
    };

    onChange = (fields: FormoFields, meta: Meta): void => {
      const { onChange = noop } = this.props; // apparently defaultProps doesn't work
      this.setState({
        fields
        // oldFields: this.state.fields // TODO should this be used in `cwrp` to avoid useless setState/(or to optimize componentShouldUpdate)?
      }, () => {
        onChange(fields, meta);
      });
    }

    mergeFields = (fieldsFromProps: FormoFields, fieldsFromState: FormoFields): FormoFields => {
      // the source of truths of which fields are in the form come from the props (they can be removed, or new ones added)
      return mapValues(fieldsFromProps, (_, fieldName: string) => ({
        // still, bits of form state can be managed just from formo component state
        ...fieldsFromState[fieldName],
        ...fieldsFromProps[fieldName] // it would be the first argument, but for symmetry...
      }));
    }

    componentWillReceiveProps({ fields } : FormoStateHandlerProps) {
      const mergedFields = this.mergeFields(fields, this.state.fields);

      this.setState({
        fields: mergedFields
      });
    }

    getLocals(props: FormoStateHandlerProps): FormoProps {
      const { onChange } = this;
      const { fields } = this.state;
      return {
        validations: {},
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


