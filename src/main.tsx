import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import App from './App';
import { activerLocale, defaultLocale } from './i18n';
import './features/litto-bingo/styles/tokens.css';

activerLocale(defaultLocale).then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <I18nProvider i18n={i18n}>
        <App />
      </I18nProvider>
    </React.StrictMode>
  );
});