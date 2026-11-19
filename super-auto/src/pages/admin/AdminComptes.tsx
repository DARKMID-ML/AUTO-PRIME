import { useState } from "react"
import { useComptes, type CompteUtilisateur, type RoleCompte } from "@/hooks/useComptes"

const carte = "rounded-xl border border-border-light bg-white"
const champ =
  "mt-1.5 w-full rounded-lg border border-border-standard bg-white px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-red/30"

const badgeRole = (role: RoleCompte) =>
  role === "admin"
    ? "bg-brand-blue/10 text-brand-blue"
    : "bg-green-600/10 text-green-700"

function initiales(nom: string): string {
  return nom.split(/\s+/).filter(Boolean).map((mot) => mot[0]).join("").slice(0, 2).toUpperCase()
}

/**
 * Gestion des comptes du site — écran réservé au compte technique `dev`.
 * Le mainteneur crée un compte par vendeur, réinitialise un mot de passe
 * oublié ou désactive un accès sans supprimer l'historique.
 */
export default function AdminComptes() {
  const {
    comptes, charge, enLigne, erreur,
    creer, supprimer, reinitialiser, basculerActif,
  } = useComptes()

  const [nom, setNom] = useState("")
  const [identifiant, setIdentifiant] = useState("")
  const [role, setRole] = useState<RoleCompte>("vendeur")
  const [envoi, setEnvoi] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [identifiants, setIdentifiants] = useState<{ identifiant: string; motDePasse: string } | null>(null)
  const [copie, setCopie] = useState(false)
  const [travail, setTravail] = useState<number | null>(null)

  const actifs = comptes.filter((compte) => compte.actif).length

  async function creerCompte(evenement: React.FormEvent) {
    evenement.preventDefault()
    setMessage(null)
    setIdentifiants(null)
    setCopie(false)
    setEnvoi(true)
    const cree = await creer(nom, identifiant, role)
    setEnvoi(false)

    if (!cree) {
      setMessage("Création impossible : identifiant déjà utilisé, invalide, ou API indisponible.")
      return
    }

    setIdentifiants({ identifiant: cree.compte.identifiant, motDePasse: cree.motDePasse })
    setNom("")
    setIdentifiant("")
    setRole("vendeur")
  }

  async function reinitialiserMotDePasse(compte: CompteUtilisateur) {
    if (!window.confirm(`Réinitialiser le mot de passe de ${compte.nom} ?`)) return
    setMessage(null)
    setCopie(false)
    setTravail(compte.id)
    const motDePasse = await reinitialiser(compte.id)
    setTravail(null)
    if (!motDePasse) {
      setMessage("Réinitialisation impossible : API indisponible.")
      return
    }
    setIdentifiants({ identifiant: compte.identifiant, motDePasse })
  }

  async function changerEtat(compte: CompteUtilisateur) {
    setMessage(null)
    setTravail(compte.id)
    const ok = await basculerActif(compte.id, !compte.actif)
    setTravail(null)
    if (!ok) {
      setMessage("Action impossible : le dernier administrateur ne peut pas être désactivé.")
    }
  }

  async function retirer(compte: CompteUtilisateur) {
    if (!window.confirm(`Supprimer définitivement le compte de ${compte.nom} ?`)) return
    setMessage(null)
    setTravail(compte.id)
    const ok = await supprimer(compte.id)
    setTravail(null)
    if (!ok) {
      setMessage("Suppression impossible : le dernier administrateur ne peut pas être supprimé.")
    }
  }

  async function copierMotDePasse() {
    if (!identifiants) return
    try {
      await navigator.clipboard.writeText(identifiants.motDePasse)
      setCopie(true)
    } catch {
      setMessage("Copie impossible : sélectionnez le mot de passe à la main.")
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[13px] font-semibold text-brand-red">Configuration</p>
        <h1 className="mt-1 font-heading text-2xl font-extrabold text-text-primary md:text-3xl">Comptes</h1>
        <p className="mt-1 max-w-2xl text-sm text-text-secondary">
          Un compte par vendeur. Les mots de passe sont générés par le serveur
          et ne sont affichés qu'une seule fois.
        </p>
      </header>

      {identifiants && (
        <section className="rounded-xl border border-green-600/30 bg-green-50 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-700 text-white" aria-hidden="true">
                <span className="material-symbols-outlined text-[20px]">check</span>
              </span>
              <div>
                <p className="font-bold text-green-900">Compte prêt — notez ces identifiants</p>
                <p className="mt-0.5 text-sm text-green-800">
                  Ce mot de passe ne sera plus affiché. En cas d'oubli, réinitialisez-le.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={copierMotDePasse}
              className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-bold text-white hover:opacity-90"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">content_copy</span>
              {copie ? "Copié" : "Copier"}
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-green-600/20 bg-white px-4 py-3">
              <p className="text-[11px] font-semibold text-text-muted">Identifiant</p>
              <p className="mt-1 font-mono text-sm font-semibold text-text-primary">{identifiants.identifiant}</p>
            </div>
            <div className="rounded-lg border border-green-600/20 bg-white px-4 py-3">
              <p className="text-[11px] font-semibold text-text-muted">Mot de passe</p>
              <p className="mt-1 font-mono text-sm font-semibold text-text-primary">{identifiants.motDePasse}</p>
            </div>
          </div>
        </section>
      )}

      {(message || erreur) && (
        <p role="alert" className="rounded-lg border border-brand-red/20 bg-brand-red/5 px-4 py-3 text-sm font-semibold text-brand-red">
          {message ?? erreur}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
        {/* Création */}
        <section className={`${carte} p-5 lg:sticky lg:top-8`}>
          <h2 className="font-heading text-lg font-bold text-text-primary">Nouveau compte</h2>
          <p className="mt-0.5 text-xs text-text-muted">Un identifiant court, sans espace.</p>

          <form onSubmit={creerCompte} className="mt-4 space-y-3.5">
            <label className="block text-sm font-medium text-text-primary">
              Nom affiché
              <input
                type="text"
                required
                maxLength={60}
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className={champ}
                placeholder="Awa Traoré"
              />
            </label>

            <label className="block text-sm font-medium text-text-primary">
              Identifiant de connexion
              <input
                type="text"
                required
                minLength={3}
                maxLength={40}
                pattern="[a-zA-Z0-9._\-]+"
                title="3 à 40 caractères : lettres, chiffres, point, tiret ou underscore"
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
                className={champ}
                placeholder="awa"
                autoComplete="off"
              />
            </label>

            <label className="block text-sm font-medium text-text-primary">
              Rôle
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as RoleCompte)}
                className={champ}
              >
                <option value="vendeur">Vendeur — catalogue et demandes</option>
                <option value="admin">Administrateur — accès complet au site</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={envoi || !enLigne}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-red px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">person_add</span>
              {envoi ? "Création…" : "Créer le compte"}
            </button>
          </form>

          <p className="mt-3 rounded-lg bg-brand-surface px-3 py-2 text-xs text-text-muted">
            Mot de passe généré : 12 caractères, affiché une seule fois.
          </p>
        </section>

        {/* Liste */}
        <section className={carte}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-light px-5 py-4">
            <div>
              <h2 className="font-heading text-lg font-bold text-text-primary">Comptes du site</h2>
              <p className="text-xs text-text-muted">
                {comptes.length} compte{comptes.length > 1 ? "s" : ""} · {actifs} actif{actifs > 1 ? "s" : ""}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
              <span className={`h-2 w-2 rounded-full ${enLigne ? "bg-green-600" : "bg-brand-red"}`} aria-hidden="true" />
              {enLigne ? "API connectée" : "API injoignable"}
            </span>
          </div>

          {charge ? (
            <p className="px-5 py-8 text-sm text-text-secondary">Chargement des comptes…</p>
          ) : comptes.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <span className="material-symbols-outlined text-3xl text-text-muted" aria-hidden="true">group</span>
              <p className="mt-2 text-sm text-text-secondary">Aucun compte pour le moment.</p>
              <p className="text-xs text-text-muted">Crée le premier vendeur avec le formulaire.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border-light">
              {comptes.map((compte) => (
                <li key={compte.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-[11px] font-bold text-brand-blue" aria-hidden="true">
                      {initiales(compte.nom)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-primary">{compte.nom}</p>
                      <p className="truncate font-mono text-xs text-text-muted">{compte.identifiant}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${badgeRole(compte.role)}`}>
                      {compte.role === "admin" ? "Administrateur" : "Vendeur"}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      compte.actif ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${compte.actif ? "bg-green-600" : "bg-gray-400"}`} aria-hidden="true" />
                      {compte.actif ? "Actif" : "Désactivé"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => reinitialiserMotDePasse(compte)}
                      disabled={travail === compte.id}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-standard text-text-secondary transition-colors hover:bg-brand-light hover:text-text-primary disabled:opacity-50"
                      title="Réinitialiser le mot de passe"
                      aria-label={`Réinitialiser le mot de passe de ${compte.nom}`}
                    >
                      <span className="material-symbols-outlined text-[19px]" aria-hidden="true">key</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => changerEtat(compte)}
                      disabled={travail === compte.id}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-standard text-text-secondary transition-colors hover:bg-brand-light hover:text-text-primary disabled:opacity-50"
                      title={compte.actif ? "Désactiver le compte" : "Réactiver le compte"}
                      aria-label={`${compte.actif ? "Désactiver" : "Réactiver"} le compte de ${compte.nom}`}
                    >
                      <span className="material-symbols-outlined text-[19px]" aria-hidden="true">
                        {compte.actif ? "block" : "check_circle"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => retirer(compte)}
                      disabled={travail === compte.id}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-red/25 text-brand-red transition-colors hover:bg-brand-red/5 disabled:opacity-50"
                      title="Supprimer le compte"
                      aria-label={`Supprimer le compte de ${compte.nom}`}
                    >
                      <span className="material-symbols-outlined text-[19px]" aria-hidden="true">delete</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p className="text-xs text-text-muted">
        Réservé au compte technique <span className="font-mono">dev</span>. Les vendeurs ne voient ni cette page,
        ni la configuration du site. Les mots de passe sont stockés hachés et ne peuvent pas être relus.
      </p>
    </div>
  )
}
