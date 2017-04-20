import * as React from 'react';
import formo from '../src/formo';
import * as renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import * as sinon from 'sinon';
import * as expect from 'expect';

const getProps = ({ fields, validations, onChange = () => {} } = {}) => {
  const C = formo(props => <div {...props} />);
  return renderer.create(<C fields={fields} validations={validations} onChange={onChange} />).toJSON().props;
};

const shallowRender = ({ fields = {}, validations, onChange = () => {} } = {}) => {
  const C = formo(props => <div {...props} />);
  return shallow(<C fields={fields} validations={validations} onChange={onChange} />);
};

let consoleWarn, consoleError;
const throwLog = (...args) => {
  throw new Error(args.join(','));
};

beforeEach(() => {
  consoleWarn = console.warn; //eslint-disable-line no-console
  consoleError = console.error; //eslint-disable-line no-console
  console.warn = throwLog; //eslint-disable-line no-console
  console.error = throwLog; //eslint-disable-line no-console
});

afterEach(() => {
  console.warn = consoleWarn; //eslint-disable-line no-console
  console.error = consoleError; //eslint-disable-line no-console
});

it('can be rendered', () => {
  getProps({ fields: {} });
});

it('always passes the form meta prop', () => {
  const props = getProps({ fields: {} });
  expect(props.form).toExist();
});

it('passes a prop for every given field', () => {
  const props = getProps({ fields: { email: {}, password: {} } });
  expect(props.email).toExist();
  expect(props.password).toExist();
});

describe('[field].value', () => {

  it('defaults to initialValue if no value is provided', () => {
    const { email } = getProps({ fields: { email: { initialValue: 'test' } } });
    expect(email.value).toBe('test');
  });

  it('defaults to initialValue if value is undefined', () => {
    const { email } = getProps({ fields: { email: { initialValue: 'test', value: undefined } } });
    expect(email.value).toBe('test');
  });

  it('does not default to initialValue if value is null', () => {
    const { email } = getProps({ fields: { email: { initialValue: 'test', value: null } } });
    expect(email.value).toBe(null);
  });

  it('defaults to undefined if no value or initialValue are provided', () => {
    const { email } = getProps({ fields: { email: { } } });
    expect(email.value).toBe(undefined);
  });

  it('set to \'\' if initialValue is provided and if value is \'\'', () => {
    const { email } = getProps({ fields: { email: { initialValue: 'test', value: '' } } });
    expect(email.value).toBe('');
  });

  it('can be updated', () => {
    const rendered = shallowRender({ fields: { email: { value: 'foo' } } });
    expect(rendered.dive().node.props.email.value).toBe('foo');
    rendered.dive().node.props.email.update('bar');
    expect(rendered.dive().node.props.email.value).toBe('bar');
  });

  it('can be set for the first time', () => {
    const rendered = shallowRender({ fields: { email: { } } });
    rendered.dive().node.props.email.update('bar');
    expect(rendered.dive().node.props.email.value).toBe('bar');
  });

  it('can be updated updating props', () => {
    const rendered = shallowRender({ fields: { email: { value: 'foo' } } });
    expect(rendered.dive().node.props.email.value).toBe('foo');
    rendered.setProps({ fields: { email: { value: 'bar' } } });
    expect(rendered.dive().node.props.email.value).toBe('bar');
  });

  it('can be set for the first time updating props', () => {
    const rendered = shallowRender({ fields: { email: { } } });
    rendered.setProps({ fields: { email: { value: 'bar' } } });
    expect(rendered.dive().node.props.email.value).toBe('bar');
  });

});

describe('[field].isValid', () => {

  it('is computed and true even if no validations are given', () => {
    const props = getProps({ fields: { email: { value: 'foo' } } });
    expect(props.email.isValid).toBe(true);
  });

  it('is computed at first render', () => {
    const props = getProps({
      fields: { email: { value: 'foo' } },
      validations: { email: { someAlywaisPassingValidation: () => true, someNeverPassingValidation: () => false } }
    });
    expect(props.email.isValid).toBe(false);
  });

  it('is recomputed changing value', () => {
    const rendered = shallowRender({
      fields: { email: { value: 'error' } },
      validations: { email: { isNotError: (value) => value !== 'error' } }
    });
    expect(rendered.dive().node.props.email.isValid).toBe(false);
    rendered.dive().node.props.email.update('foo');
    expect(rendered.dive().node.props.email.value).toBe('foo');
    expect(rendered.dive().node.props.email.isValid).toBe(true);
    rendered.dive().node.props.email.update('error');
    expect(rendered.dive().node.props.email.isValid).toBe(false);
  });

  it('is recomputed changing value via props', () => {
    const rendered = shallowRender({
      fields: { email: { value: 'error' } },
      validations: { email: { isNotError: v => v !== 'error' } }
    });
    expect(rendered.dive().node.props.email.isValid).toBe(false);
    rendered.setProps({ fields: { email: { value: 'foo' } } });
    expect(rendered.dive().node.props.email.isValid).toBe(true);
    rendered.setProps({ fields: { email: { value: 'error' } } });
    expect(rendered.dive().node.props.email.isValid).toBe(false);
  });

});

describe('[field].validationErrors', () => {

  it('are returned for each field only if validations[field] contains functions that return false', () => {
    const props = getProps({
      fields: { email: { value: 'test' }, password: { value: 'valid' } },
      validations: {
        email: { longerThan5: value => value.length >= 5 },
        password: { isValid: value => value === 'valid' }
      }
    });
    expect(props.email.validationErrors).toEqual(['longerThan5']);
    expect(props.password.validationErrors).toEqual([]);
  });

});

describe('[field].touched', () => {

  it('defaults to false for every field', () => {
    const rendered = shallowRender({ fields: { email: { touched: true }, password: { } } });
    expect(rendered.dive().node.props.email.touched).toBe(true);
    expect(rendered.dive().node.props.password.touched).toBe(false);
  });

  it('is true after an unsetActive()', () => {
    const rendered = shallowRender({ fields: { email: { } } });
    rendered.dive().node.props.email.unsetActive();
    expect(rendered.dive().node.props.email.touched).toBe(true);
  });

  it('can be updated via props', () => {
    const rendered = shallowRender({ fields: { email: { } } });
    rendered.setProps({ fields: { email: { touched: true } } });
    expect(rendered.dive().node.props.email.touched).toBe(true);
  });

});

describe('[field].active', () => {

  it('defaults to false for every field', () => {
    const rendered = shallowRender({ fields: { email: { }, password: { active: true } } });
    expect(rendered.dive().node.props.email.active).toBe(false);
    expect(rendered.dive().node.props.password.active).toBe(true);
  });

  it('is true after a setActive()', () => {
    const rendered = shallowRender({ fields: { email: { } } });
    rendered.dive().node.props.email.setActive();
    expect(rendered.dive().node.props.email.active).toBe(true);
  });

  it('can be updated via props', () => {
    const rendered = shallowRender({ fields: { email: { } } });
    rendered.setProps({ fields: { email: { active: true } } });
    expect(rendered.dive().node.props.email.active).toBe(true);
  });

  describe('is true for at most a single field simultaneously', () => {

    it('defaults to the first active field to be considered active', () => {
      const rendered = shallowRender({ fields: { email: { active: true }, password: { active: true } } });
      expect(rendered.dive().node.props.email.active).toBe(true);
      expect(rendered.dive().node.props.password.active).toBe(false);
    });

    it('is updated accordingly on all fields when activating a field', () => {
      const rendered = shallowRender({ fields: { email: { active: true }, password: { } } });
      rendered.dive().node.props.password.setActive();
      expect(rendered.dive().node.props.email.active).toBe(false);
      expect(rendered.dive().node.props.password.active).toBe(true);
    });

    it('defaults to the first active field to be considered active, when updated via props', () => {
      const rendered = shallowRender({ fields: { email: { }, password: { active: true } } });
      rendered.setProps({ fields: { email: { active: true }, password: { active: true } } });
      expect(rendered.dive().node.props.email.active).toBe(true);
      expect(rendered.dive().node.props.password.active).toBe(false);
    });

  });

});

describe('[field].isChanged', () => {

  it('should be false if value and initial value are the same', () => {
    expect(getProps({ fields: { email: { value: '', initialValue: '' } } }).email.isChanged).toBe(false);
  });

  it('should be false if value and initial value are the same, non falsy', () => {
    expect(getProps({ fields: { email: { value: 'a', initialValue: 'a' } } }).email.isChanged).toBe(false);
  });

  it('should be false if value and initial value are "adequately equal": \'\' and null', () => {
    expect(getProps({ fields: { email: { value: '', initialValue: null } } }).email.isChanged).toBe(false);
    expect(getProps({ fields: { email: { initialValue: '', value: null } } }).email.isChanged).toBe(false);
  });

  it('should be false if value and initial value are "adequately equal": \'\' and undefined', () => {
    expect(getProps({ fields: { email: { value: '', initialValue: undefined } } }).email.isChanged).toBe(false);
    expect(getProps({ fields: { email: { initialValue: '', value: undefined } } }).email.isChanged).toBe(false);
  });

  it('should be false if value and initial value are equal with respect to `lodash.isEqual`', () => {
    expect(getProps({ fields: { birthDay: { value: new Date('1987-07-14'), initialValue: new Date('1987-07-14') } } }).birthDay.isChanged).toBe(false);
    expect(getProps({ fields: { favouriteColors: { initialValue: ['red', 'blue'], value: ['red', 'blue'] } } }).favouriteColors.isChanged).toBe(false);
    expect(getProps({ fields: { something: { initialValue: { foo: 'bar' }, value: { foo: 'bar' } } } }).something.isChanged).toBe(false);
  });

});

describe('[field].clear()', () => {

  it('should reset a value to initialValue', () => {
    const rendered = shallowRender({ fields: { email: { initialValue: 'initial' } } });
    rendered.dive().node.props.email.update('new');
    expect(rendered.dive().node.props.email.value).toBe('new');
    rendered.dive().node.props.email.clear();
    expect(rendered.dive().node.props.email.value).toBe('initial');
  });

  it('should reset a value to undefined if no initialValue is provided', () => {
    const rendered = shallowRender({ fields: { email: { } } });
    rendered.dive().node.props.email.update('new');
    expect(rendered.dive().node.props.email.value).toBe('new');
    rendered.dive().node.props.email.clear();
    expect(rendered.dive().node.props.email.value).toBe(undefined);
  });

  it('should reset a value to initialValue even if a value is passed initially', () => {
    const rendered = shallowRender({ fields: { email: { initialValue: 'initial', value: 'initialValue' } } });
    expect(rendered.dive().node.props.email.value).toBe('initialValue');
    rendered.dive().node.props.email.clear();
    expect(rendered.dive().node.props.email.value).toBe('initial');
  });

});

describe('form.validationErrors', () => {

  it('are returned only if validations.form contains functions that return `false`', () => {
    const props = getProps({
      fields: { email: { value: 'test' }, password: { value: 'test' } },
      validations: {
        form: {
          different: ({ email, password }) => email !== password,
          neverFailing: () => true
        }
      }
    });
    expect(props.form.validationErrors).toEqual(['different']);
  });

});

describe('[field].touch()', () => {

  it('sets the field as touched', () => {
    const rendered = shallowRender({ fields: { email: { }, password: { } } });
    rendered.dive().node.props.email.touch();
    expect(rendered.dive().node.props.email.touched).toBe(true);
    expect(rendered.dive().node.props.password.touched).toBe(false);
  });
});

describe('form.touchAll()', () => {

  it('sets every field as touched', () => {
    const rendered = shallowRender({ fields: { email: { }, password: { } } });
    rendered.dive().node.props.form.touchAll();
    expect(rendered.dive().node.props.email.touched).toBe(true);
    expect(rendered.dive().node.props.password.touched).toBe(true);
  });

});

describe('form.clearValues()', () => {

  it('should reset values to initialValue', () => {
    const rendered = shallowRender({ fields: { email: { initialValue: 'initial' } } });
    rendered.dive().node.props.email.update('new');
    expect(rendered.dive().node.props.email.value).toBe('new');
    rendered.dive().node.props.form.clearValues();
    expect(rendered.dive().node.props.email.value).toBe('initial');
  });

  it('should reset values to undefined if no initialValue is provided', () => {
    const rendered = shallowRender({ fields: { email: { } } });
    rendered.dive().node.props.email.update('new');
    expect(rendered.dive().node.props.email.value).toBe('new');
    rendered.dive().node.props.form.clearValues();
    expect(rendered.dive().node.props.email.value).toBe(undefined);
  });

  it('should reset values to initialValue even if a value is passed initially', () => {
    const rendered = shallowRender({ fields: { email: { initialValue: 'initial', value: 'initialValue' } } });
    expect(rendered.dive().node.props.email.value).toBe('initialValue');
    rendered.dive().node.props.form.clearValues();
    expect(rendered.dive().node.props.email.value).toBe('initial');
  });

});

describe('form.isChanged', () => {

  it('should be false if value and initial value are the same', () => {
    expect(getProps({ fields: { email: { value: '', initialValue: '' } } }).form.isChanged).toBe(false);
  });

  it('should be false if value and initial value are the same, non falsy', () => {
    expect(getProps({ fields: { email: { value: 'a', initialValue: 'a' } } }).form.isChanged).toBe(false);
  });

  it('should be false if value and initial value are "adequately equal": \'\' and null', () => {
    expect(getProps({ fields: { email: { value: '', initialValue: null } } }).form.isChanged).toBe(false);
    expect(getProps({ fields: { email: { initialValue: '', value: null } } }).form.isChanged).toBe(false);
  });

  it('should be false if value and initial value are "adequately equal": \'\' and undefined', () => {
    expect(getProps({ fields: { email: { value: '', initialValue: undefined } } }).form.isChanged).toBe(false);
    expect(getProps({ fields: { email: { initialValue: '', value: undefined } } }).form.isChanged).toBe(false);
  });

});

describe('onChange', () => {

  it('should be called with the updated value (and a meta object as a second argument) after an update() call', () => {
    const onChange = sinon.spy();
    const rendered = shallowRender({ onChange, fields: { email: { value: 'foo' } } });
    rendered.dive().node.props.email.update('bar');
    expect(onChange.args.length).toBe(1);
    expect(onChange.args[0].length).toBe(2);
    expect(onChange.args[0][0].email.value).toBe('bar');
  });

  it('should be called with a second argument meta containing `isChanged`, `isValid` and `validationErrors` for each field', () => {
    const onChange = sinon.spy();
    const rendered = shallowRender({ onChange, fields: { email: { value: 'foo' } } });
    rendered.dive().node.props.email.update('bar');
    expect(onChange.args.length).toBe(1);
    expect(onChange.args[0].length).toBe(2);
    expect(onChange.args[0][1].email.isValid).toBe(true);
    expect(onChange.args[0][1].email.isChanged).toBe(true);
    expect(onChange.args[0][1].email.validationErrors).toEqual([]);
  });


  it('should be called with an updated isValid after an update() call', () => {
    const onChange = sinon.spy();
    const rendered = shallowRender({
      onChange,
      fields: { email: { value: 'foo' } },
      validations: { email: { error: v => v !== 'error' } }
    });
    rendered.dive().node.props.email.update('error');
    expect(onChange.args.length).toBe(1);
    expect(onChange.args[0].length).toBe(2);
    expect(onChange.args[0][1].email.isValid).toBe(false);
    expect(onChange.args[0][1].form.isValid).toBe(false);
    expect(onChange.args[0][1].email.validationErrors).toEqual(['error']);
    expect(onChange.args[0][1].form.validationErrors).toEqual([]);
  });

  it('should be called with each field value set correctly when passing only initial values', () => {
    const onChange = sinon.spy();
    const rendered = shallowRender({
      onChange,
      fields: { email: { initialValue: 'email@example.com' }, password: { initialValue: 's3curity' } }
    });
    rendered.dive().node.props.email.touch();
    expect(onChange.args[0][0].email.value).toBe('email@example.com');
    expect(onChange.args[0][0].password.value).toBe('s3curity');
  });

});
