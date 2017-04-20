import * as React from 'react';
import * as t from 'tcomb';
import { dict, maybe, inter } from 'tcomb';
import { props } from 'tcomb-react';
import { skinnable, pure, contains } from 'revenge';
import { mapValues } from 'lodash';
import { noop } from 'lodash';

const FormoField = inter({
  value: t.Any,
  initialValue: t.Any,
  touched: maybe(t.Boolean),
  active: maybe(t.Boolean)
}, { strict: false, name: 'FormoField' });

const FormoFields = dict(t.String, FormoField, 'FormoFields');

const formoStateHandler = (Component) => {
  @pure
  @skinnable(contains(Component))
  @props({
    fields: FormoFields,
    onChange: maybe(t.Function)
  }, { strict: false })
  class FormoStateHandler extends React.Component {

    state = {
      fields: this.props.fields
    };

    static displayName = `FormoStateHandler${(Component.displayName || Component.name || '')}`

    onChange = (fields, meta) => {
      const { onChange = noop } = this.props; // apparently defaultProps doesn't work
      this.setState({
        fields
        // oldFields: this.state.fields // TODO should this be used in `cwrp` to avoid useless setState/(or to optimize componentShouldUpdate)?
      }, () => {
        onChange(fields, meta);
      });
    }

    mergeFields = (fieldsFromProps, fieldsFromState) => {
      // the source of truths of which fields are in the form come from the props (they can be removed, or new ones added)
      return mapValues(fieldsFromProps, (_, fieldName) => ({
        // still, bits of form state can be managed just from formo component state
        ...fieldsFromState[fieldName],
        ...fieldsFromProps[fieldName] // it would be the first argument, but for symmetry...
      }));
    }

    componentWillReceiveProps({ fields }) {
      const mergedFields = this.mergeFields(fields, this.state.fields);

      this.setState({
        fields: mergedFields
      });
    }

    getLocals(props) {
      const { onChange } = this;
      const { fields } = this.state;
      return {
        ...props,
        fields,
        onChange
      };
    }

  }

  return FormoStateHandler;
};

export default formoStateHandler;
