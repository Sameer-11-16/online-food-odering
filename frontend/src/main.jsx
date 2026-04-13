import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import axios from 'axios'
import API_BASE_URL from './apiConfig'

axios.defaults.baseURL = API_BASE_URL;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
        <AuthProvider>
            <CartProvider>
              <App />
            </CartProvider>
        </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
