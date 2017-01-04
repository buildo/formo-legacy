import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import ReduxForm from './redux-form';

const reducer = combineReducers({
  form: formReducer
});
const store = createStore(reducer);


ReactDOM.render(
  <Provider store={store}>
    <ReduxForm />
  </Provider>,
  document.getElementById('redux-form-example')
);
