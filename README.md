[![Build Status](https://drone.our.buildo.io/api/badges/buildo/formo/status.svg)](https://drone.our.buildo.io/buildo/formo)

# formo

Form state management

## Usage (basic example)

```jsx
import formo from 'formo'

const MyFormoComponent = formo(
  class MyFC extends React.Component {
    render() {
      const {
        email, password,
        form: { isValid, isChanged }
      } = this.props
      const submitEnabled = isChanged && isValid

      return (
        <div>
          <input
            type='email'
            value={email.value || ''}
            onChange={e => email.update(e.target.value)}
          />
          {email.touched && email.validationErrors.map(error => (
            <div className='error'>{error}</div>
          )}
          <input
            type='password'
            value={password.value || ''}
            onChange={e => password.update(e.target.value)}
          />
          <input type='submit' value='submit' disabled={!submitEnabled} />
        </div>
      )
    }
  }
)

const fields = {
  email: {},
  password: {}
}

const validations = {
  email: {
    invalidEmail: v => validEmailRegex.test(v)
  }
}

export default class MyComponent {
  render() {
    return <MyFormoComponent fields={fields} validations={validations} />
  }
}

```

## Motivation and guiding principles

- avoid repeating common tasks among different form, such as validation logic, computing "dirtiness" state, enabling submit button, showing errors only if X, etc.
- it should be independent from rendering (not tied to a specific set of UI components)
- it should be independent from the state management framework (not tied to redux, mobx, etc.)
- it should be easy to use as-is, as a stateful component, and easy to integrate with any state management framework

## API

### Create a "formo component"

```js
import formo from 'formo'

class MyComponent extends React.Component {
  // ...
}

export default formo(MyComponent)
```

From this component, you'll have access to the complete form state via props.
This includes current values, validity, and other useful meta info such as "touched", "changed", etc.
See a comprehensive list in the tables below.

### configure a "formo component"

A "formo component" can be configured through props with a set of fields and validations to apply.

```jsx
import MyFormoComponent from './MyFormoComponent'

  // ...

  render() {
    // `validations` and `onChange` are optional
    return (
      <MyFormoComponent
        fields={fields}
        validations={validations}
        onChange={onChange}
      />
    )
  }

  // ...
```

#### `props` API

name | required | type | description
---|---|---|---
fields | required | `dict(FieldName, Field)` | Configure form fields
validations | | `dict(FieldNameOrForm, dict(validationName, Validations))` | Optionally configure form-level and field-level validations
onChange | | `function<Value>` | Optionally provide an `onChange` callback, will be called with the new values after every change

`FieldName`: a string representing a field, e.g. "email".

`Field`: an object in the form:

```js
{
  value: any,
  initialValue: any,
  active: ?boolean,
  touched: ?boolean
}

```

`FieldNameOrForm = FieldName | 'form'`: form-level validations are specified using the special string "form".

`Validations`: a `dict(string, function)` with each function, returning a Boolean.

Each function is called with two arguments (field `value` and all form `values`) if applied to a field, with a single value (all form `values`) if it is applied at form-level.

In other words, a validation function should be treated like a test that the field or the form should pass.

`formo` will list the failed `validation` function names in the `validationErrors` array.

Validity for single fields and for the global form is computed based on presence (absence) of these errors.

#### `fields` example

```js
fields = {
  email: {
    value: cookie.email
  },
  password: {},
  repeatPassword: {},
  foo: {
    initialValue: true
  },
  bar: {
    initialValue: false
  }
}
```

#### `validations` example

```js
validations = {
  password: {
    minLength: value => value.length > 8,
    numeric: value => value.test(/\d/)
  },
  repeatPassword: {
    passwordMatch: (repeatPassword, { password }) => repeatPassword === password
  },
  form: {
    atLestOneFooOrBar: values => !value.foo && !value.bar
  }
}
```

### Use form values from a "formo component"

#### Formo component props api

A formo component receives via props:
- form-level values and derived properties, via the `form` prop
- for each field, field-level value and derived properties, via the `[field]` prop.

#### Form-level props

type | name/usage | description
---|---|---
`function` | `form.clearValues()` | Sets every field value in the form to `field.initialValue || undefined`. The input below should be aware and handle `undefined` as controlled anyway.
`function` | `form.touchAll()` | Sets every field as "touched". Useful if we have a validation UI rendering logic similar to `touched && errors && renderErrors()` and we want to force errors rendering after a certain event (e.g. user clicks on "submit")
`boolean` | `form.isChanged` | Is any field changed?
`boolean` | `form.isValid` | Is the form as a whole "valid" (no validation errors)?
`list(string)` | `form.validationErrors` | validations failing

#### Form-level prop usage example

```jsx
// ...
render() {
  const submitEnabled = this.props.form.isValid && this.props.form.isChanged;
  const errors = map(this.props.form.validations, err => <Error>{err}</Error>)
  return (
    // ...
    {errors}
    <input type='submit' value='Submit' disabled={!submitEnabled} />
    // ...
  )
}
// ...
```

#### Field-level props

type | name/usage | description
---|---|---
`any` | `[field].value` | Always `== value || initialValue || undefined`. The input below should be aware and handle `undefined` as controlled anyway
`any` | `[field].initialValue` | `initialValue` provided in form config for the field, if any
`function(any)` | `[field].update(newValue)` | Updates a field value. Typically passed to an input `onChange`
`boolean` | `[field].active` | Whether the field is currently "active". It is guaranteed to be exclusive (a single field is active at any time. If multiple fields are marked as "active" in config, only the first one is considered active)
`function` | `[field].setActive()` | Set the field as "active"
`function` | `[field].unsetActive()` | Set the field as "non active". Also updates `touched` accordingly
`boolean` | `[field].touched` | `true` if input has been `unsetActive()` in the past (typically after a blur, or, as always, if the field is configured as `touched=true` in config)
`function` | `[field].clear()` | Set field `value` to `initialValue || undefined`
`boolean` | `[field].isChanged` | `true` if input `value` is the same as `initialValue` (or "adequately equal")
`list(string)` | `form.validationErrors` | validations failing
`any` | `[field].[<any other key>]` | Any other field key provided in form config is just passed down
`function(string, any)` | `[field].set('prop', value)` | Any other field key can be changed using `.set`

#### Field-level prop usage example

```jsx
// ...
render() {
  const email = this.props.email;
  const className = cx({
    active: email.active,
    error: email.touched && !email.isValid
  })
  return (
    <input
      type='email'
      value={email.value || ''}
      className={className}
      onFocus={email.setActive}
      onBlur={email.unsetActive}
      onChange={e => email.update(e.target.value)}
    />
  )
}
// ...
```
