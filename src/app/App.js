import React from 'react';
import MyOtherForm from './MyOtherForm';

export default class App extends React.Component {
  state = {
    form: null
  };

  render() {
    return (
      <MyOtherForm
        value={this.state.form}
        onChange={value => { this.setState({ form: value }); }}
      />
    );
  }
}
