import React from 'react';
import t, { dict, maybe, inter } from 'tcomb';
import { props } from 'tcomb-react';
import { skinnable, pure, contains } from 'revenge';
import mapValues from 'lodash/mapValues';
import mapValuesF from 'lodash/fp/mapValues';
import constant from 'lodash/constant';
import forEach from 'lodash/forEach';
import _isEqual from 'lodash/isEqual';
import pickBy from 'lodash/pickBy';
import includes from 'lodash/includes';

const getValues = mapValuesF('value');

const isEqual = (a, b) => {
  const similarlyNil = ['', undefined, null];
  return _isEqual(a, b) || (includes(similarlyNil, a) && includes(similarlyNil, b));
};

const FormoField = inter({
  value: t.Any,
  initialValue: t.Any,
  touched: maybe(t.Boolean),
  active: maybe(t.Boolean)
}, { strict: false, name: 'FormoField' });

const FormoFields = dict(t.String, FormoField, 'FormoFields');

const FormoValidations = dict(t.String, dict(t.String, t.Function), 'FormoValidations');

const formoStateHandler = (Component) => {
  @pure
  @skinnable(contains(Component))
  @props({
    validations: maybe(FormoValidations),
    fields: FormoFields,
    onChange: maybe(t.Function)
  }, { strict: false })
  class FormoStateHandler extends React.Component {

    static defaultProps = {
      validations: {},
      onChange: () => {}
    }

    state = {
      validations: this.props.validations,
      fields: this.props.fields
    };

    static displayName = `FormoStateHandler${(Component.displayName || Component.name || '')}`

    resolveValidating = (fieldName, validating) => {
      forEach(validating, (promise, validationName) => {
        promise.then(resolvedValue => {
          this.setState({
            validations: {
              ...this.state.validations,
              [fieldName]: {
                ...this.state.validations[fieldName],
                [validationName]: constant(resolvedValue)
              }
            }
          });
        });
      });
    };

    onChange = (fields, meta) => {
      const newValues = getValues(fields);
      const oldValues = getValues(this.state.fields);
      const valuesDidntChange = isEqual(oldValues, newValues);
      const maybeMergedValidations = valuesDidntChange ? undefined : this.mergeValidations(this.props.validations, this.state.validations);

      this.setState({
        ...pickBy({ validations: maybeMergedValidations }),
        fields
        // oldFields: this.state.fields // TODO should this be used in `cwrp` to avoid useless setState?
      }, () => {
        this.props.onChange(fields, meta);
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

    mergeValidations = (validationsFromProps, validationsFromState) => {
      return mapValues(validationsFromProps, (_, fieldNameOrForm) => ({
        ...validationsFromState[fieldNameOrForm],
        ...validationsFromProps[fieldNameOrForm]// it would be the first argument of mapValues callback, but for symmetry...
      }));
    }

    componentWillReceiveProps({ fields, validations }) {
      const mergedFields = this.mergeFields(fields, this.state.fields);
      const newValues = getValues(mergedFields);
      const oldValues = getValues(this.state.fields);
      const valuesDidntChange = isEqual(newValues, oldValues);
      const maybeMergedValidations = valuesDidntChange ? undefined : this.mergeValidations(validations, this.state.validations);

      this.setState({
        // if values didn't change, do not merge the validations
        ...pickBy({ validations: maybeMergedValidations }),
        fields: mergedFields // TODO move out from class
      });
    }

    getLocals(props) {
      const { onChange, resolveValidating } = this;
      const { fields = props.fields, validations = props.validations } = this.state;
      return {
        ...props,
        fields,
        validations,
        resolveValidating,
        onChange
      };
    }

  }

  return FormoStateHandler;
};

export default formoStateHandler;
