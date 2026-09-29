import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { initGoogleTagManager } from './lib/analytics'
import { rememberGoogleClickIdsFromBrowser } from './lib/googleClickIds'
import { installMartinaAnalyticsBridge } from './services/amarteChatbot'
import { installWhatsappRedirectTracking } from './lib/whatsappTracking'
import './styles/index.css'

installMartinaAnalyticsBridge()
installWhatsappRedirectTracking()
rememberGoogleClickIdsFromBrowser()
initGoogleTagManager()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
