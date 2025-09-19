// Contenido actualizado para frontend/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx'; // 1. Importamos el proveedor
import { CartProvider } from './context/CartContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Envolvemos App con AuthProvider */}
    <AuthProvider>
      <CartProvider>
      <App />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>,
)