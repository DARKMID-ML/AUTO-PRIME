import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { seConnecter, useSession } from "@/config/auth"
import { capturer, identifierUtilisateur } from "@/config/analytics"
import { useLogos } from "@/config/logo"
import { SITE } from "@/config/site"

/** Écran de connexion de l'espace admin (public).
 * Le compte admin du site (défini à l'installation) ou le compte
 * technique `dev` (configuration) se connectent avec leurs identifiants.
 */
export default function AdminConnexion() {
  const session = useSession()
  const navigate = useNavigate()
  const logos = useLogos()

  const [identifiant, setIdentifiant] = useState("")
  const [motDePasse, setMotDePasse] = useState("")
  const [erreur, setErreur] = useState<string | null>(null)
  const [enCours, setEnCours] = useState(false)

  // Déjà connecté : on file au tableau de bord.
  if (session) {
    return <Navigate to="/admin" replace />
  }

  async function soumettre(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault()
    setErreur(null)
    setEnCours(true)
    const refus = await seConnecter(identifiant, motDePasse)
    setEnCours(false)
    if (refus) {
      setErreur(refus)
      return
    }
    // Parcours admin : identifie la session puis marque l'étape « connecté ».
    identifierUtilisateur(identifiant)
    capturer("connexion_admin")
    navigate("/admin", { replace: true })
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-brand-light">
      {/* ===== Panneau marque (desktop) ===== */}
      <aside className="hidden md:flex flex-col justify-between bg-brand-blue-dark text-white p-10">
        <Link to="/" className="inline-flex w-fit">
          <img src={logos.invert} alt={SITE.logoAlt} className="h-12 w-auto object-contain" />
        </Link>

        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-3">Espace réservé</p>
          <h1 className="text-3xl font-extrabold leading-tight">
            Administration<br />{SITE.nom}
          </h1>
          <p className="mt-4 text-gray-300 max-w-sm">
            Gérez votre catalogue, vos demandes et vos messages.
            Ce site dispose de son propre espace d'administration.
          </p>
        </div>

        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} {SITE.nom}
        </p>
      </aside>

      {/* ===== Formulaire ===== */}
      <main className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-8 text-center">
            <img src={logos.normal} alt={SITE.logoAlt} className="h-12 w-auto mx-auto object-contain" />
          </div>

          <h2 className="text-2xl font-extrabold text-text-primary">Connexion</h2>
          <p className="text-sm text-text-secondary mt-1 mb-6">
            Identifiez-vous pour accéder à l'administration.
          </p>

          <form onSubmit={soumettre} className="space-y-4">
            <div>
              <label htmlFor="identifiant" className="block text-sm font-medium text-text-primary mb-1.5">
                Identifiant
              </label>
              <input
                id="identifiant"
                name="identifiant"
                type="text"
                autoComplete="username"
                required
                autoFocus
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
                className="w-full border border-border-standard rounded-lg p-3 bg-white focus:ring-2 focus:ring-brand-red focus:outline-none text-text-primary"
                placeholder="Votre identifiant"
              />
            </div>

            <div>
              <label htmlFor="mot-de-passe" className="block text-sm font-medium text-text-primary mb-1.5">
                Mot de passe
              </label>
              <input
                id="mot-de-passe"
                name="motDePasse"
                type="password"
                autoComplete="current-password"
                required
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                className="w-full border border-border-standard rounded-lg p-3 bg-white focus:ring-2 focus:ring-brand-red focus:outline-none text-text-primary"
                placeholder="Votre mot de passe"
              />
            </div>

            {erreur && (
              <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                {erreur}
              </p>
            )}

            <button
              type="submit"
              disabled={enCours}
              className="btn-premium w-full text-white font-bold py-3 rounded-full inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">lock</span>
              {enCours ? "CONNEXION..." : "SE CONNECTER"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link to="/" className="text-text-secondary hover:text-brand-red underline underline-offset-2">
              ← Retour au site
            </Link>
            <span className="text-xs text-text-secondary/70">Accès sécurisé</span>
          </div>
        </div>
      </main>
    </div>
  )
}