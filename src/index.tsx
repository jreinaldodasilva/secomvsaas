import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Apply stored theme before first render to prevent flash of unstyled content
const stored = localStorage.getItem('secom_theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const theme = stored === 'light' || stored === 'dark' ? stored : prefersDark ? 'dark' : 'light';
document.documentElement.setAttribute('data-theme', theme);

// Apply stored locale to <html lang>
const storedLocale = localStorage.getItem('secom_locale');
if (storedLocale) document.documentElement.lang = storedLocale;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
