import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { apiSend } from "@/config/api"
import { estDev, seDeconnecter, useSession } from "@/config/auth"
import { SITE } from "@/config/site"

const carte = "rounded-xl border border-border-light bg-white"
const champ =
  "mt-1.5 w-full rounded-lg border border-border-standard bg-white px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-red/30"

function initiales(nom: string): string {
  return nom.split(/\s+/).filter(Boolean).map((mot) => mot[0]).join("").slice(0, 2).toUpperCase()
}

function InfoLigne({ libelle, valeur, mono = false }: { libelle: string; valeur: string; mono?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-light py-2.5 last:border-0">
      <span className="text-xs text-text-muted">{libelle}</span>
      <span className={`text-sm font-semibold text-text-primary ${mono ? "font-mono" : ""}`}>{valeur}</span>
    </div>
  )
}

/**
 * Paramètres du compte connecté : identité, identifiant et mot de passe.
 * Le changement ferme toutes les sessions : reconnexion obligatoire.
 */
export default function AdminParametres() {
  const session = useSession()
  const navigate = useNavigate()
  const dev = estDev(session)
  const roleLabel = dev ? "Développeur" : session?.role === "vendeur" ? "Vendeur" : "Administrateur"

  const [ancien, setAncien] = useState("")
  const [nouveau, setNouveau] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [erreur, setErreur] = useState<string | null>(null)
  const [envoi, setEnvoi] = useState(false)

  async function soumettre(evenement: React.FormEvent) {
    evenement.preventDefault()
    setErreur(null)

    if (nouveau.length < 6) {
      setErreur("Le nouveau mot de passe doit contenir au moins 6 caractères.")
      return
    }
    if (nouveau !== confirmation) {
      setErreur("Les deux saisies du nouveau mot de passe ne correspondent pas.")
      return
    }

    setEnvoi(true)
    const reponse = await apiSend<{ message: string }>(
      "/api/auth/mot-de-passe",
      "POST",
      { ancienMotDePasse: ancien, nouveauMotDePasse: nouveau },
    )
    setEnvoi(false)

    if (!reponse) {
      setErreur("Mot de passe actuel incorrect, ou serveur indisponible.")
      return
    }

    await seDeconnecter()
    navigate("/admin/connexion", { replace: true })
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[13px] font-semibold text-brand-red">Compte</p>
        <h1 className="mt-1 font-heading text-2xl font-extrabold text-text-primary md:text-3xl">Paramètres</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Votre accès, votre mot de passe et les informations du site.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start">
        {/* Compte */}
        <section className={carte}>
          <div className="flex items-center gap-3 border-b border-border-light p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-red/10 text-sm font-bold text-brand-red" aria-hidden="true">
              {initiales(session?.nom ?? "?")}
            </span>
            <div className="min-w-0">
              <p className="truncate font-heading text-lg font-bold text-text-primary">{session?.nom ?? "—"}</p>
              <span className="mt-0.5 inline-block rounded-full bg-brand-blue/10 px-2 py-0.5 text-[11px] font-semibold text-brand-blue">
                {roleLabel}
              </span>
            </div>
          </div>

          <div className="px-5 py-3">
            <InfoLigne libelle="Identifiant" valeur={session?.identifiant ?? "—"} mono />
            <InfoLigne libelle="Site" valeur={SITE.nomLong} />
            <InfoLigne libelle="Ville" valeur={SITE.adresse.ville} />
            <InfoLigne libelle="Rôle" valeur={roleLabel} />
          </div>

          {dev && (
            <p className="border-t border-border-light px-5 py-3 text-xs text-text-muted">
              L'identifiant du compte technique se définit dans la configuration de l'API
              (<span className="font-mono">DEV_IDENTIFIANT</span>).
            </p>
          )}
        </section>

        {/* Sécurité */}
        {dev ? (
          <section className={carte}>
            <div className="border-b border-border-light p-5">
              <h2 className="font-heading text-lg font-bold text-text-primary">Compte technique</h2>
              <p className="mt-0.5 text-xs text-text-muted">Réservé au mainteneur du site.</p>
            </div>

            <div className="space-y-4 p-5">
              <p className="text-sm text-text-secondary">
                Le compte <span className="font-mono font-semibold text-text-primary">dev</span> n'est pas stocké en base :
                son mot de passe se définit dans le fichier d'environnement de l'API.
              </p>

              <div className="rounded-lg bg-brand-surface px-4 py-3 font-mono text-xs text-text-secondary">
                <p>DEV_IDENTIFIANT=...</p>
                <p className="mt-1">DEV_MOT_DE_PASSE=...</p>
              </div>

              <p className="text-xs text-text-muted">
                Après modification, redémarre l'API. Toutes les sessions seront fermées.
              </p>

              <Link
                to="/admin/comptes"
                className="inline-flex items-center gap-2 rounded-lg border border-border-standard px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-brand-light"
              >
                <span className="material-symbols-outlined text-[19px]" aria-hidden="true">manage_accounts</span>
                Gérer les comptes
              </Link>
            </div>
          </section>
        ) : (
          <section className={carte}>
            <div className="border-b border-border-light p-5">
              <h2 className="font-heading text-lg font-bold text-text-primary">Changer mon mot de passe</h2>
              <p className="mt-0.5 text-xs text-text-muted">
                Toutes les sessions ouvertes seront fermées.
              </p>
            </div>

            <form onSubmit={soumettre} className="space-y-3.5 p-5">
              <label className="block text-sm font-medium text-text-primary">
                Mot de passe actuel
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={ancien}
                  onChange={(e) => setAncien(e.target.value)}
                  className={champ}
                />
              </label>

              <label className="block text-sm font-medium text-text-primary">
                Nouveau mot de passe
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={nouveau}
                  onChange={(e) => setNouveau(e.target.value)}
                  className={champ}
                />
              </label>

              <label className="block text-sm font-medium text-text-primary">
                Confirmer le nouveau mot de passe
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  className={champ}
                />
              </label>

              {erreur && (
                <p role="alert" className="rounded-lg border border-brand-red/20 bg-brand-red/5 px-3 py-2 text-sm font-semibold text-brand-red">
                  {erreur}
                </p>
              )}

              <button
                type="submit"
                disabled={envoi}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-red px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[19px]" aria-hidden="true">key</span>
                {envoi ? "Modification…" : "Modifier mon mot de passe"}
              </button>
            </form>
          </section>
        )}
      </div>
    </div>
  )
}
