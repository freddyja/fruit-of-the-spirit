import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/literata/latin-400.css'
import '@fontsource/literata/latin-400-italic.css'
import '@fontsource/literata/latin-600.css'
import '@fontsource/literata/latin-ext-400.css'
import '@fontsource/literata/latin-ext-400-italic.css'
import '@fontsource/literata/latin-ext-600.css'
import '@fontsource/source-sans-3/latin-400.css'
import '@fontsource/source-sans-3/latin-600.css'
import '@fontsource/source-sans-3/latin-ext-400.css'
import '@fontsource/source-sans-3/latin-ext-600.css'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './i18n/LanguageProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
)
