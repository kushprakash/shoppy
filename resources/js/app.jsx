import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './route.jsx';
import { ErpProvider } from './context/ErpContext';
import { installStoreFetchInterceptor, syncAxiosStoreHeaders } from './utils/storeAuth';
import '../css/app.css';

if (typeof window !== 'undefined') {
  window.axios = axios;
}
installStoreFetchInterceptor();
syncAxiosStoreHeaders(axios);

const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <BrowserRouter>
      <ErpProvider>
        <AppRoutes />
      </ErpProvider>
    </BrowserRouter>
  );
}
