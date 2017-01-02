import React from 'react';
import formo from '../src/app/formo';
import renderer from 'react-test-renderer';
import { shallow as _shallow } from 'enzyme';

const getProps = (form = {}, validations = undefined) => {
  const C = formo(props => <div {...props} />);
  return renderer.create(<C form={form} validations={validations} onChange={() => {}} />).toJSON().props;
};

const shallow = (form = {}, validations = undefined) => {
  const C = formo(props => <div {...props} />);
  return _shallow(<C form={form} validations={validations} onChange={() => {}} />);
};

it('can be rendered', () => {
  getProps();
});

it('always passes the form meta prop', () => {
  const props = getProps();
  expect(props.form).toBeDefined();
});

it('passes a prop for every given field', () => {
  const props = getProps({ email: {}, password: {} });
  expect(props.email).toBeDefined();
  expect(props.password).toBeDefined();
});

describe('[field].value', () => {

  it('defaults to initialValue if no value is provided', () => {
    const { email } = getProps({ email: { initialValue: 'test' } });
    expect(email.value).toBe('test');
  });

  it('defaults to initialValue if value is undefined', () => {
    const { email } = getProps({ email: { initialValue: 'test', value: undefined } });
    expect(email.value).toBe('test');
  });

  xit('defaults to initialValue if value is null', () => {
    const { email } = getProps({ email: { initialValue: 'test', value: null } });
    expect(email.value).toBe('test');
  });

  xit('defaults to initialValue if value is \'\'', () => {
    const { email } = getProps({ email: { initialValue: 'test', value: '' } });
    expect(email.value).toBe('test');
  });

  it('defaults to undefined if no value or initialValue are provided', () => {
    const { email } = getProps({ email: { } });
    expect(email.value).toBe(undefined);
  });

  it('can be updated', () => {
    const rendered = shallow({ email: { value: 'foo' } });
    expect(rendered.props().email.value).toBe('foo');
    rendered.props().email.update('bar');
    expect(rendered.props().email.value).toBe('bar');
  });

  it('can be set for the first time', () => {
    const rendered = shallow({ email: { } });
    rendered.props().email.update('bar');
    expect(rendered.props().email.value).toBe('bar');
  });

  it('can be updated updating props', () => {
    const rendered = shallow({ email: { value: 'foo' } });
    expect(rendered.props().email.value).toBe('foo');
    rendered.setProps({ form: { email: { value: 'bar' } } });
    expect(rendered.props().email.value).toBe('bar');
  });

  it('can be set for the first time updating props', () => {
    const rendered = shallow({ email: { } });
    rendered.setProps({ form: { email: { value: 'bar' } } });
    expect(rendered.props().email.value).toBe('bar');
  });

});

describe('[field].isValid', () => {

  it('is computed and true even if no validations are given', () => {
    const props = getProps({ email: { value: 'foo' } });
    expect(props.email.isValid).toBe(true);
  });

  it('is computed at first render', () => {
    const props = getProps(
      { email: { value: 'foo' } },
      { email: () => 'error' }
    );
    expect(props.email.isValid).toBe(false);
  });

  it('is recomputed changing value', () => {
    const rendered = shallow(
      { email: { value: 'error' } },
      { email: v => v === 'error' ? 'error' : null }
    );
    expect(rendered.props().email.isValid).toBe(false);
    rendered.props().email.update('foo');
    expect(rendered.props().email.isValid).toBe(true);
    rendered.props().email.update('error');
    expect(rendered.props().email.isValid).toBe(false);
  });

  it('is recomputed changing value via props', () => {
    const rendered = shallow(
      { email: { value: 'error' } },
      { email: v => v === 'error' ? 'error' : null }
    );
    expect(rendered.props().email.isValid).toBe(false);
    rendered.setProps({ form: { email: { value: 'foo' } } });
    expect(rendered.props().email.isValid).toBe(true);
    rendered.setProps({ form: { email: { value: 'error' } } });
    expect(rendered.props().email.isValid).toBe(false);
  });

  it('is ignored if passed via props', () => {
    const rendered = shallow(
      { email: { value: 'error', isValid: true } },
      { email: () => 'error' }
    );
    expect(rendered.props().email.isValid).toBe(false);
  });

  it('is ignored if updated via props', () => {
    const rendered = shallow(
      { email: { value: 'error' } },
      { email: () => 'error' }
    );
    expect(rendered.props().email.isValid).toBe(false);
    rendered.setProps({ form: { email: { value: 'error', isValid: true } } });
    expect(rendered.props().email.isValid).toBe(false);
  });

});

describe('form.clearValues', () => {

  it('should reset a value to initialValue', () => {
    const rendered = shallow({ email: { initialValue: 'initial' } });
    rendered.props().email.update('new');
    expect(rendered.props().email.value).toBe('new');
    rendered.props().form.clearValues();
    expect(rendered.props().email.value).toBe('initial');
  });

  it('should reset a value to undefined if no initialValue is provided', () => {
    const rendered = shallow({ email: { } });
    rendered.props().email.update('new');
    expect(rendered.props().email.value).toBe('new');
    rendered.props().form.clearValues();
    expect(rendered.props().email.value).toBe(undefined);
  });

  it('should reset a value to initialValue even if a value is passed initially', () => {
    const rendered = shallow({ email: { initialValue: 'initial', value: 'initialValue' } });
    expect(rendered.props().email.value).toBe('initialValue');
    rendered.props().form.clearValues();
    expect(rendered.props().email.value).toBe('initial');
  });

});

describe('form.isChanged', () => {

  it('should be false if value and initial value are the same', () => {
    expect(getProps({ email: { value: '', initialValue: '' } }).form.isChanged).toBe(false);
  });

  it('should be false if value and initial value are the same, non falsy', () => {
    expect(getProps({ email: { value: 'a', initialValue: 'a' } }).form.isChanged).toBe(false);
  });

  it('should be false if value and initial value are "adequately equal": \'\' and null', () => {
    expect(getProps({ email: { value: '', initialValue: null } }).form.isChanged).toBe(false);
    expect(getProps({ email: { initialValue: '', value: null } }).form.isChanged).toBe(false);
  });

  it('should be false if value and initial value are "adequately equal": \'\' and undefined', () => {
    expect(getProps({ email: { value: '', initialValue: undefined } }).form.isChanged).toBe(false);
    expect(getProps({ email: { initialValue: '', value: undefined } }).form.isChanged).toBe(false);
  });

});
