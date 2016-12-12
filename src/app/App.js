import React from 'react';
import MyForm from './MyForm';

export default class App extends React.Component {
  state = {
    form: {
      email: { initialValue: 'mario@mario.mario' }
    }
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
