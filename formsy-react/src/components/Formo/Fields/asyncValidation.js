import React, { PropTypes } from 'react';
import debounce from 'lodash/debounce';
import { Decorator as FormsyElement } from 'formsy-react';

const asyncValidationFieldDecorator = (Component) => {

  const wrapPromise = (promise, validatorName) => {
    return new Promise((resolve, reject) => {
      return promise
        .then((payload) => {
          resolve(payload);
        },
        (err) => {
          reject({ validatorName, error: err });
        });
    });
  };

  return (
    @FormsyElement()
    class AsyncValidatedField extends React.Component {
      static contextTypes = {
        formsyWrapper: PropTypes.object
      };

      state = {
        isValidating: false,
        responseError: null,
        isAsyncValid: !this.props.asyncValidations
      }

      handleAsyncValidations = (value) => {
        const { asyncValidations } = this.props;
        const { formsyWrapper } = this.context;
        const asyncValidationRules = formsyWrapper.getAsyncValidationRules();
        const asyncValidationPromise = [];

        this.setState({ responseError: null, hasAsyncError: false, isValidating: true });

        if (typeof asyncValidations === 'string') {
          asyncValidations.split(',').forEach((validatorName) => {
            const validationMethod = asyncValidationRules[validatorName];
            if (validationMethod) {
              const p = wrapPromise(validationMethod(value), validatorName);
              asyncValidationPromise.push(p);
            }
          });
        } else if (typeof asyncValidations === 'object') {
          Object.keys(asyncValidations).forEach((validatorName) => {
            const validationMethod = asyncValidationRules[validatorName];
            if (validationMethod) {
              const p = wrapPromise(validationMethod(value, asyncValidations[validatorName]), validatorName);
              asyncValidationPromise.push(p);
            }
          });
        }
        return Promise.all(asyncValidationPromise)
          .then(() => {
            formsyWrapper.setAsyncValidationState(true);
            return this.setState({ isValidating: false, hasAsyncError: false, isAsyncValid: true });
          })
          .catch(err => {
            const msg = this.getAsyncErrorMessage(err.validatorName);

            formsyWrapper.setAsyncValidationState(false);

            return this.setState({ isValidating: false, responseError: msg, hasAsyncError: true, isAsyncValid: false });
          });
      }

      debouncedHandleAsyncValidations = debounce(this.handleAsyncValidations, 300);

      // if at least one async validator is present, the entire form validation state
      // is false till all the async validators have been verified
      componentDidMount() {
        if (this.props.asyncValidations) {
          this.context.formsyWrapper.setAsyncValidationState(false);
        }
      }

      // this overwrites the `formsy-react` setValue method to include async validation
      setValue = (value) => {
        const { asyncValidations, setValue: _setValue } = this.props;

        this.setState({ isAsyncValid: !asyncValidations });

        // only start asynchronous validations when synchronous validations success
        if (asyncValidations && this.props.isValidValue(value)) {
          this.debouncedHandleAsyncValidations(value);
        }

        _setValue(value);
      }

      getAsyncErrorMessage(validatorName) {
        const { asyncValidationErrors } = this.props;
        if (asyncValidationErrors && asyncValidationErrors[validatorName]) {
          return asyncValidationErrors[validatorName];
        }
        return null;
      }

      // this overwrites `formsy-react` isValid method to include also async validation
      // (field is valid if every sync and async validator has been successfully verified)
      isValid = () => {
        return this.props.isValid() && this.state.isAsyncValid;
      }

      render() {
        return (
          <Component
            {...this.props}
            isValidating={this.state.isValidating}
            isValid={this.isValid}
            setValue={this.setValue}
          />
        );
      }
    }
  );
};

export default asyncValidationFieldDecorator;