import { useEffect, type ReactNode } from 'react'
import { Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BandeauConsentement from './components/BandeauConsentement'
import { suivrePage } from './config/analytics'
import Accueil from "./pages/Accueil"
import Contact from './pages/Contact'
import Services from './pages/Services.tsx'
import Vente from './pages/Vente'
import Location from './pages/Location'
import Transit from './pages/Transit'
import MesDemandes from './pages/MesDemandes'
import VehiculeDetails from './pages/VehiculeDetails'
import AdminLayout from './pages/admin/AdminLayout'
import AdminConnexion from './pages/admin/AdminConnexion'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminVehicules from './pages/admin/AdminVehicules'
import AdminLocation from './pages/admin/AdminLocation'
import AdminDemandes from './pages/admin/AdminDemandes'
import AdminMessages from './pages/admin/AdminMessages'
import AdminDevis from './pages/admin/AdminDevis'
import AdminServices from './pages/admin/AdminServices'
import AdminAppearance from './pages/admin/AdminAppearance'
import AdminEntreprise from './pages/admin/AdminEntreprise'
import AdminContenu from './pages/admin/AdminContenu'
import AdminParametres from './pages/admin/AdminParametres'
import AdminComptes from './pages/admin/AdminComptes'
import AdminPages from './pages/admin/AdminPages'
import { estDev, useSession, verifierSession } from './config/auth'
import { usePages, type ClePage } from './config/pages'

// Layout du site public : Navbar + page + Footer
function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  )
}

// Pages vues PostHog : une par changement de route (le site est une SPA).
function SuiviNavigation() {
  const { pathname } = useLocation()
  useEffect(() => {
    suivrePage(pathname)
  }, [pathname])
  return null
}

// Le bandeau de consentement ne s'affiche que sur le site public.
function BandeauSite() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/admin')) return null
  return <BandeauConsentement />
}

// Écrans de configuration du site : réservés au compte technique `dev`.
function RouteDev({ children }: { children: ReactNode }) {
  const session = useSession()
  if (!session) return <Navigate to="/admin/connexion" replace />
  if (!estDev(session)) return <Navigate to="/admin" replace />
  return <>{children}</>
}

// Écrans de gestion : interdits au rôle vendeur.
function RouteAdmin({ children }: { children: ReactNode }) {
  const session = useSession()
  if (!session) return <Navigate to="/admin/connexion" replace />
  if (session.role === "vendeur") return <Navigate to="/admin" replace />
  return <>{children}</>
}

// Une page désactivée pour le client n'est pas accessible par URL directe.
function PageActive({ page, children }: { page: ClePage; children: ReactNode }) {
  const pages = usePages()
  if (!pages[page]) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  // Au démarrage : invalide une session dont le jeton n'est plus reconnu
  // (API redémarrée, jeton expiré). Serveur éteint → session conservée.
  useEffect(() => {
    void verifierSession()
  }, [])

  return (
    <>
      <SuiviNavigation />
      <BandeauSite />
      <Routes>
        {/* ===== Site public ===== */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Accueil />} />
          <Route path="/vente" element={<PageActive page="vente"><Vente /></PageActive>} />
          <Route path="/location" element={<PageActive page="location"><Location /></PageActive>} />
          <Route path="/transit" element={<PageActive page="transit"><Transit /></PageActive>} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services" element={<PageActive page="services"><Services /></PageActive>} />
          <Route path="/mes-demandes" element={<PageActive page="mes-demandes"><MesDemandes /></PageActive>} />
          <Route path="/vehicule/:id" element={<VehiculeDetails />} />
        </Route>

        {/* ===== Connexion admin (hors layout protégé) ===== */}
        <Route path="/admin/connexion" element={<AdminConnexion />} />

        {/* ===== Espace d'administration du site ===== */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="vehicules" element={<AdminVehicules />} />
          <Route path="location" element={<RouteAdmin><AdminLocation /></RouteAdmin>} />
          <Route path="demandes" element={<AdminDemandes />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="devis" element={<AdminDevis />} />
          <Route path="parametres" element={<AdminParametres />} />
          <Route path="comptes" element={<RouteDev><AdminComptes /></RouteDev>} />
          {/* Configuration du site : compte technique `dev` uniquement. */}
          <Route path="apparence" element={<RouteDev><AdminAppearance /></RouteDev>} />
          <Route path="entreprise" element={<RouteDev><AdminEntreprise /></RouteDev>} />
          <Route path="contenu" element={<RouteDev><AdminContenu /></RouteDev>} />
          <Route path="pages" element={<RouteDev><AdminPages /></RouteDev>} />
          <Route path="services" element={<RouteDev><AdminServices /></RouteDev>} />
        </Route>
      </Routes>
    </>
  )
}
