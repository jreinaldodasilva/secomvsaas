import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

document.documentElement.setAttribute('data-theme', 'light');
document.documentElement.lang = 'pt-BR';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
