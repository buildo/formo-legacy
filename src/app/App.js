import React from 'react';
import MyForm from './MyForm';

export default class App extends React.Component {
  state = {
    form: null
  };

  render() {
    return (
      <MyForm
        sexOptions={['male', 'female'].map(value => ({ value, label: value }))}
        value={this.state.form}
        onChange={value => { this.setState({ form: value }); }}
      />
    );
  }
}
