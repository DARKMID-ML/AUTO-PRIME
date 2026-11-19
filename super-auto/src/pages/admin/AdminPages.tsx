import { Link } from "react-router-dom"
import { PAGES_SITE, resetPages, setPage, usePages, type ClePage } from "@/config/pages"
import { SITE } from "@/config/site"

const ICONES: Record<ClePage, string> = {
  vente: "directions_car",
  location: "car_rental",
  transit: "local_shipping",
  services: "handyman",
  "mes-demandes": "assignment",
}

/**
 * Pages du site — écran réservé au compte technique `dev`.
 *
 * Chaque client n'active que les activités qu'il propose. Les liens des pages
 * désactivées disparaissent de la navbar et du pied de page ; une URL directe
 * vers une page désactivée renvoie vers l'accueil.
 */
export default function AdminPages() {
  const pages = usePages()
  const actives = PAGES_SITE.filter((page) => pages[page.cle])
  const aucuneDesactivee = actives.length === PAGES_SITE.length

  function reactiverTout() {
    if (aucuneDesactivee) return
    if (window.confirm("Réactiver toutes les pages du site ?")) {
      resetPages()
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[13px] font-semibold text-brand-red">Configuration</p>
          <h1 className="mt-1 font-heading text-2xl font-extrabold text-text-primary md:text-3xl">
            Pages du site
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-text-secondary">
            Activez uniquement les activités proposées par ce client. La navbar,
            le pied de page et les accès directs s'adaptent immédiatement.
          </p>
        </div>
        <button
          type="button"
          onClick={reactiverTout}
          disabled={aucuneDesactivee}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-border-standard bg-white px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-brand-light disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[19px]" aria-hidden="true">restart_alt</span>
          Tout réactiver
        </button>
      </header>

      {/* Aperçu de la navbar */}
      <section className="rounded-xl border border-border-light bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-base font-bold text-text-primary">Aperçu du menu public</h2>
          <span className="text-xs text-text-muted">{actives.length + 2} pages visibles</span>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg bg-brand-blue-dark px-4 py-3 text-white sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-heading text-sm font-bold tracking-wide">{SITE.nom}</span>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-medium text-gray-300">
              <span className="text-white">Accueil</span>
              {actives.map((page) => (
                <span key={page.cle} className="text-white">{page.nom}</span>
              ))}
              <span className="text-white">Contact</span>
            </div>
            <span className="rounded-full bg-brand-red px-3 py-1 text-[11px] font-bold">
              Demander un devis
            </span>
          </div>
        </div>

        <p className="mt-2 text-xs text-text-muted">
          Les pages désactivées ne figurent plus dans ce menu. L'accueil et le contact restent toujours accessibles.
        </p>
      </section>

      {/* Pages configurables */}
      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-bold text-text-primary">Activités</h2>
            <p className="text-xs text-text-muted">Cochez ce que le client propose réellement.</p>
          </div>
          <span className="text-xs font-semibold text-text-secondary">
            {actives.length} / {PAGES_SITE.length} actives
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PAGES_SITE.map((page) => {
            const actif = pages[page.cle]
            return (
              <div
                key={page.cle}
                className={`flex flex-col rounded-xl border p-4 transition-colors ${
                  actif
                    ? "border-border-light bg-white"
                    : "border-border-light bg-brand-surface/70"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    actif ? "bg-brand-red/10 text-brand-red" : "bg-white text-text-muted"
                  }`} aria-hidden="true">
                    <span className="material-symbols-outlined text-[21px]">{ICONES[page.cle]}</span>
                  </span>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={actif}
                    aria-label={`${actif ? "Désactiver" : "Activer"} la page ${page.nom}`}
                    onClick={() => setPage(page.cle, !actif)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      actif ? "bg-green-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        actif ? "translate-x-[22px]" : "translate-x-0.5"
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </div>

                <div className="mt-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-text-primary">{page.nom}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      actif ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                    }`}>
                      {actif ? "Active" : "Désactivée"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-text-secondary">{page.description}</p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border-light pt-3">
                  <span className="font-mono text-[11px] text-text-muted">{page.to}</span>
                  {actif && (
                    <Link
                      to={page.to}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-red hover:underline"
                    >
                      Voir
                      <span className="material-symbols-outlined text-[14px]" aria-hidden="true">open_in_new</span>
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Pages verrouillées */}
      <section className="rounded-xl border border-dashed border-border-standard bg-white/60 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-text-primary">Toujours actives</h2>
            <p className="text-xs text-text-muted">Ces deux pages ne peuvent pas être désactivées.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { nom: "Accueil", to: "/", icone: "home" },
              { nom: "Contact", to: "/contact", icone: "mail" },
            ].map((page) => (
              <span
                key={page.nom}
                className="inline-flex items-center gap-1.5 rounded-full border border-border-light bg-white px-3 py-1.5 text-xs font-semibold text-text-secondary"
              >
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">{page.icone}</span>
                {page.nom}
                <span className="material-symbols-outlined text-[14px] text-text-muted" aria-hidden="true">lock</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <p className="text-xs text-text-muted">
        Le réglage s'enregistre automatiquement et s'applique à tous les visiteurs.
      </p>
    </div>
  )
}
