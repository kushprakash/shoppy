import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './route.jsx';
import { ErpProvider } from './context/ErpContext';
import '../css/app.css';

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
