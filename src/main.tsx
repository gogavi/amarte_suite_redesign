import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { initGoogleTagManager } from './lib/analytics'
import './styles/index.css'

initGoogleTagManager()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
