import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

// Register PWA Service Worker
if ('serviceWorker' in navigator && !window.location.hostname.includes('localhost.disabled')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[MediTwin PWA] Service Worker registered:', reg.scope);
      })
      .catch((err) => {
        console.warn('[MediTwin PWA] Service Worker registration failed:', err);
      });
  });
}