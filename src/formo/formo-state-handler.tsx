import { mapValues, noop } from 'lodash';
import * as React from 'react';
import { FormoFields, FormoProps, FormoStateHandlerProps, FormoStateHandlerState, Meta } from './types';

// tslint:disable-next-line ter-max-len
export default function formoStateHandler(Component: React.ComponentClass<FormoProps>): React.ComponentClass<FormoStateHandlerProps> {

  return class FormoStateHandler extends React.PureComponent<FormoStateHandlerProps, FormoStateHandlerState> {

    static displayName = `FormoStateHandler${(Component.displayName || '')}`;

    state = {
      fields: this.props.fields
    };

    onChange = (fields: FormoFields, meta: Meta): void => {
      const { onChange = noop } = this.props; // apparently defaultProps doesn't work
      this.setState({
        fields
        // TODO should this be used in `cwrp` to avoid useless setState/(or to optimize componentShouldUpdate)?
        // oldFields: this.state.fields
      }, () => {
        onChange(fields, meta);
      });
    }

    mergeFields = (fieldsFromProps: FormoFields, fieldsFromState: FormoFields): FormoFields => {
      // the source of truths of which fields are in the form
      // come from the props (they can be removed, or new ones added)
      return mapValues(fieldsFromProps, (_, fieldName: string) => ({
        // still, bits of form state can be managed just from formo component state
        ...fieldsFromState[fieldName],
        ...fieldsFromProps[fieldName] // it would be the first argument, but for symmetry...
      }));
    }

    componentWillReceiveProps({ fields }: FormoStateHandlerProps) {
      const mergedFields = this.mergeFields(fields, this.state.fields);

      this.setState({
        fields: mergedFields
      });
    }

    getLocals(props: FormoStateHandlerProps): FormoProps {
      const { onChange, state: { fields } } = this;
      return {
        validations: {},
        ...props,
        fields,
        onChange
      };
    }

    render() {
      return <Component {...this.getLocals(this.props)} />;
    }

  };
}
