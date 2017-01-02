import React from 'react';
import formo from '../src/app/formo';
import renderer from 'react-test-renderer';
import { shallow as _shallow } from 'enzyme';

const getProps = (form = {}) => {
  const C = formo(props => <div {...props} />);
  return renderer.create(<C form={form} onChange={() => {}} />).toJSON().props;
};

const shallow = (form = {}) => {
  const C = formo(props => <div {...props} />);
  return _shallow(<C form={form} onChange={() => {}} />);
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

describe('field value', () => {

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
    rendered.setProps({ email: { value: 'bar' } });
    expect(rendered.props().email.value).toBe('bar');
  });

  it('can be set for the first time updating props', () => {
    const rendered = shallow({ email: { } });
    rendered.setProps({ email: { value: 'bar' } });
    expect(rendered.props().email.value).toBe('bar');
  });

});
