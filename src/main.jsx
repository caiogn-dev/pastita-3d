import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // O CSS global novo
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>  
      <App />
  </StrictMode>,
)
