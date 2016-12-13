import React from 'react';
import MyOtherForm from './MyOtherForm';
import MyForm from './MyForm';
import View from 'react-flexview';

import 'react-flexview/src/flexView.scss';

export default class App extends React.Component {

  state = { example: 'MyForm' }

  render() {
    return (
      <View column>
        <View style={{ backgroundColor: '#ddd' }} marginBottom={100}>
          {'MyForm MyOtherForm'.split(' ').map(x => (
            <View marginRight={30} key={x} style={{ cursor: 'pointer', fontWeight: this.state.example === x && 'bold' }} onClick={() => this.setState({ example: x })}>{x}</View>
          ))}
        </View>
        {this.state.example === 'MyForm' && (
          <MyForm
            sexOptions={'male female'.split(' ').map(x => ({ value: x, label: x }))}
            value={this.state.form1}
            onChange={value => { this.setState({ form1: value }); }}
          />
        )}
        {this.state.example === 'MyOtherForm' && (
          <MyOtherForm
            value={this.state.form2}
            onChange={value => { this.setState({ form2: value }); }}
          />
        )}
      </View>
    );
  }
}
