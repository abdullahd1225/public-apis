import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import trTR from 'antd/locale/tr_TR';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { theme } from './theme.js';
import './styles.css';

dayjs.locale('tr');

ReactDOM.createRoot(document.getElementById('root')).render(
  <ConfigProvider locale={trTR} theme={theme}>
    <AntApp>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </AntApp>
  </ConfigProvider>
);
