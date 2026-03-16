import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

document.documentElement.setAttribute('data-theme', 'light');

const storedLocale = localStorage.getItem('secom_locale');
if (storedLocale) document.documentElement.lang = storedLocale;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
