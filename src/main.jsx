import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

import App from './App.jsx';
import AuthProvider from './components/auth-provider.jsx';
import ToastProvider from './components/toast-provider.jsx';
import theme from './theme.js';

import './index.css';

/* GitHub Pages 는 서버 라우팅이 없어서 HashRouter(#/feed) 를 사용한다 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={ theme }>
      <CssBaseline />
      <HashRouter>
        <ToastProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ToastProvider>
      </HashRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
