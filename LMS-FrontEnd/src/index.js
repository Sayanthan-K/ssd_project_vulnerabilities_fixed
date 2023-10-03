import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './Store/index';
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.render(
  <BrowserRouter>
    <Provider store={store}>
      <GoogleOAuthProvider clientId='584043774139-4l2qg934td1644ar0e6mj9019qcsnkvg.apps.googleusercontent.com'>
        <App />
      </GoogleOAuthProvider>
    </Provider>
  </BrowserRouter>,
  document.getElementById('root')
);

reportWebVitals();
