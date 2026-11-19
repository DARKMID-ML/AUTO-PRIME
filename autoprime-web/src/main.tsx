import { BrowserRouter } from 'react-router-dom'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { applyTheme, getThemeSettings, THEME_STORAGE_KEY } from './config/theme'
import { initialiserAnalytics } from './config/analytics'
import { chargerParametresSite } from './config/parametresSite'
import  App  from './App.tsx'

// Applique les réglages d'apparence (composition, palette, typographie) avant
// le premier rendu, puis à chaque changement : enregistrement depuis
// l'administration, ou modification dans un autre onglet.
applyTheme(getThemeSettings())

// PostHog : la mesure ne démarre que si le visiteur a déjà accepté le
// bandeau de consentement (voir src/config/analytics.ts).
initialiserAnalytics()

// Réglages du site principal : chargés depuis l'API et réinjectés dans le
// localStorage. Le thème est réappliqué par l'écouteur ci-dessous.
void chargerParametresSite()

window.addEventListener('autoprime:theme-updated', () => applyTheme())
window.addEventListener('storage', (event) => {
  if (!event.key || event.key === THEME_STORAGE_KEY) applyTheme()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
        <App />
    </BrowserRouter>
  </StrictMode>,
)
