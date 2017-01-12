import React from 'react';
import formo from '../src/app/formo';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

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
  consoleWarn = console.warn;
  consoleError = console.error;
  console.warn = throwLog;
  console.error = throwLog;
});

afterEach(() => {
  console.warn = consoleWarn;
  console.error = consoleError;
});

it('can be rendered', () => {
  getProps({ fields: {} });
});

it('always passes the form meta prop', () => {
  const props = getProps({ fields: {} });
  expect(props.form).toBeDefined();
});

it('passes a prop for every given field', () => {
  const props = getProps({ fields: { email: {}, password: {} } });
  expect(props.email).toBeDefined();
  expect(props.password).toBeDefined();
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

  it('defaults to initialValue if value is null', () => {
    const { email } = getProps({ fields: { email: { initialValue: 'test', value: null } } });
    expect(email.value).toBe('test');
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
    expect(rendered.props().email.value).toBe('foo');
    rendered.props().email.update('bar');
    expect(rendered.props().email.value).toBe('bar');
  });

  it('can be set for the first time', () => {
    const rendered = shallowRender({ fields: { email: { } } });
    rendered.props().email.update('bar');
    expect(rendered.props().email.value).toBe('bar');
  });

  it('can be updated updating props', () => {
    const rendered = shallowRender({ fields: { email: { value: 'foo' } } });
    expect(rendered.props().email.value).toBe('foo');
    rendered.setProps({ fields: { email: { value: 'bar' } } });
    expect(rendered.props().email.value).toBe('bar');
  });

  it('can be set for the first time updating props', () => {
    const rendered = shallowRender({ fields: { email: { } } });
    rendered.setProps({ fields: { email: { value: 'bar' } } });
    expect(rendered.props().email.value).toBe('bar');
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
      validations: { email: () => 'error' }
    });
    expect(props.email.isValid).toBe(false);
  });

  it('is recomputed changing value', () => {
    const rendered = shallowRender({
      fields: { email: { value: 'error' } },
      validations: { email: v => v === 'error' ? 'error' : null }
    });
    expect(rendered.props().email.isValid).toBe(false);
    rendered.props().email.update('foo');
    expect(rendered.props().email.isValid).toBe(true);
    rendered.props().email.update('error');
    expect(rendered.props().email.isValid).toBe(false);
  });

  it('is recomputed changing value via props', () => {
    const rendered = shallowRender({
      fields: { email: { value: 'error' } },
      validations: { email: v => v === 'error' ? 'error' : null }
    });
    expect(rendered.props().email.isValid).toBe(false);
    rendered.setProps({ fields: { email: { value: 'foo' } } });
    expect(rendered.props().email.isValid).toBe(true);
    rendered.setProps({ fields: { email: { value: 'error' } } });
    expect(rendered.props().email.isValid).toBe(false);
  });

  it('is ignored if passed via props', () => {
    const rendered = shallowRender({
      fields: { email: { value: 'error', isValid: true } },
      validations: { email: () => 'error' }
    });
    expect(rendered.props().email.isValid).toBe(false);
  });

  it('is ignored if updated via props', () => {
    const rendered = shallowRender({
      fields: { email: { value: 'error' } },
      validations: { email: () => 'error' }
    });
    expect(rendered.props().email.isValid).toBe(false);
    rendered.setProps({ fields: { email: { value: 'error', isValid: true } } });
    expect(rendered.props().email.isValid).toBe(false);
  });

});

describe('[field].validations', () => {

  it('are returned for each field only if !== null', () => {
    const props = getProps({
      fields: { email: { value: 'test' }, password: { value: 'valid' } },
      validations: {
        email: value => ({
          longerThan5: value.length >= 5 ? null : 'longer than 5'
        }),
        password: value => ({
          valid: value !== 'valid' ? 'invalid' : null
        })
      }
    });
    expect(props.email.validations).toEqual({ longerThan5: 'longer than 5' });
    expect(props.password.validations).toEqual({});
  });

});


describe('[field].touched', () => {

  it('defaults to false for every field', () => {
    const rendered = shallowRender({ fields: { email: { touched: true }, password: { } } });
    expect(rendered.props().email.touched).toBe(true);
    expect(rendered.props().password.touched).toBe(false);
  });

  it('is true after an unsetActive()', () => {
    const rendered = shallowRender({ fields: { email: { } } });
    rendered.props().email.unsetActive();
    expect(rendered.props().email.touched).toBe(true);
  });

  it('can be updated via props', () => {
    const rendered = shallowRender({ fields: { email: { } } });
    rendered.setProps({ fields: { email: { touched: true } } });
    expect(rendered.props().email.touched).toBe(true);
  });

});

describe('[field].active', () => {

  it('defaults to false for every field', () => {
    const rendered = shallowRender({ fields: { email: { }, password: { active: true } } });
    expect(rendered.props().email.active).toBe(false);
    expect(rendered.props().password.active).toBe(true);
  });

  it('is true after a setActive()', () => {
    const rendered = shallowRender({ fields: { email: { } } });
    rendered.props().email.setActive();
    expect(rendered.props().email.active).toBe(true);
  });

  it('can be updated via props', () => {
    const rendered = shallowRender({ fields: { email: { } } });
    rendered.setProps({ fields: { email: { active: true } } });
    expect(rendered.props().email.active).toBe(true);
  });

  describe('is true for at most a single field simultaneously', () => {

    it('defaults to the first active field to be considered active', () => {
      const rendered = shallowRender({ fields: { email: { active: true }, password: { active: true } } });
      expect(rendered.props().email.active).toBe(true);
      expect(rendered.props().password.active).toBe(false);
    });

    it('is updated accordingly on all fields when activating a field', () => {
      const rendered = shallowRender({ fields: { email: { active: true }, password: { } } });
      rendered.props().password.setActive();
      expect(rendered.props().email.active).toBe(false);
      expect(rendered.props().password.active).toBe(true);
    });

    it('defaults to the first active field to be considered active, when updated via props', () => {
      const rendered = shallowRender({ fields: { email: { }, password: { active: true } } });
      rendered.setProps({ fields: { email: { active: true }, password: { active: true } } });
      expect(rendered.props().email.active).toBe(true);
      expect(rendered.props().password.active).toBe(false);
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
    rendered.props().email.update('new');
    expect(rendered.props().email.value).toBe('new');
    rendered.props().email.clear();
    expect(rendered.props().email.value).toBe('initial');
  });

  it('should reset a value to undefined if no initialValue is provided', () => {
    const rendered = shallowRender({ fields: { email: { } } });
    rendered.props().email.update('new');
    expect(rendered.props().email.value).toBe('new');
    rendered.props().email.clear();
    expect(rendered.props().email.value).toBe(undefined);
  });

  it('should reset a value to initialValue even if a value is passed initially', () => {
    const rendered = shallowRender({ fields: { email: { initialValue: 'initial', value: 'initialValue' } } });
    expect(rendered.props().email.value).toBe('initialValue');
    rendered.props().email.clear();
    expect(rendered.props().email.value).toBe('initial');
  });

});

describe('form.validations', () => {

  it('are returned only if !== null', () => {
    const props = getProps({
      fields: { email: { value: 'test' }, password: { value: 'valid' } },
      validations: {
        form: values => ({
          different: values.email !== values.password ? 'different' : null,
          neverFailing: null
        })
      }
    });
    expect(props.form.validations).toEqual({ different: 'different' });
  });

});

describe('form.touchAll()', () => {

  it('sets every field as touched', () => {
    const rendered = shallowRender({ fields: { email: { }, password: { } } });
    rendered.props().form.touchAll();
    expect(rendered.props().email.touched).toBe(true);
    expect(rendered.props().password.touched).toBe(true);
  });

});

describe('form.clearValues()', () => {

  it('should reset values to initialValue', () => {
    const rendered = shallowRender({ fields: { email: { initialValue: 'initial' } } });
    rendered.props().email.update('new');
    expect(rendered.props().email.value).toBe('new');
    rendered.props().form.clearValues();
    expect(rendered.props().email.value).toBe('initial');
  });

  it('should reset values to undefined if no initialValue is provided', () => {
    const rendered = shallowRender({ fields: { email: { } } });
    rendered.props().email.update('new');
    expect(rendered.props().email.value).toBe('new');
    rendered.props().form.clearValues();
    expect(rendered.props().email.value).toBe(undefined);
  });

  it('should reset values to initialValue even if a value is passed initially', () => {
    const rendered = shallowRender({ fields: { email: { initialValue: 'initial', value: 'initialValue' } } });
    expect(rendered.props().email.value).toBe('initialValue');
    rendered.props().form.clearValues();
    expect(rendered.props().email.value).toBe('initial');
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
    const onChange = jest.fn();
    const rendered = shallowRender({ onChange, fields: { email: { value: 'foo' } } });
    rendered.props().email.update('bar');
    expect(onChange.mock.calls.length).toBe(1);
    expect(onChange.mock.calls[0].length).toBe(2);
    expect(onChange.mock.calls[0][0].email.value).toBe('bar');
  });

  it('should be called with a second argument meta containing `isChanged`, `isValid` and `validations` for each field', () => {
    const onChange = jest.fn();
    const rendered = shallowRender({ onChange, fields: { email: { value: 'foo' } } });
    rendered.props().email.update('bar');
    expect(onChange.mock.calls.length).toBe(1);
    expect(onChange.mock.calls[0].length).toBe(2);
    expect(onChange.mock.calls[0][1].email.isValid).toBe(true);
    expect(onChange.mock.calls[0][1].email.isChanged).toBe(true);
    expect(onChange.mock.calls[0][1].email.validations).toEqual({});
  });


  it('should be called with an updated isValid after an update() call', () => {
    const onChange = jest.fn();
    const rendered = shallowRender({
      onChange,
      fields: { email: { value: 'foo' } },
      validations: { email: v => ({ error: v === 'error' ? 'error' : null }) }
    });
    rendered.props().email.update('error');
    expect(onChange.mock.calls.length).toBe(1);
    expect(onChange.mock.calls[0].length).toBe(2);
    expect(onChange.mock.calls[0][1].email.isValid).toBe(false);
    expect(onChange.mock.calls[0][1].form.isValid).toBe(false);
  });

});