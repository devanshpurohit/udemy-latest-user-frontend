import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./assets/css/style.css"
import "./assets/css/responsive.css"
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import { SettingsProvider } from './contexts/SettingsContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <SettingsProvider>
          <App />
        </SettingsProvider>
      </SocketProvider>
    </AuthProvider>
  </StrictMode>,
)
