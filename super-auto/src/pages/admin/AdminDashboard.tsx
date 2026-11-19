import { Link } from "react-router-dom"
import { useAdminVehicules } from "@/hooks/useAdminVehicules"
import { useMessages } from "@/hooks/useMessages"
import { useDevis } from "@/hooks/useDevis"
import { useDemandes } from "@/store/demandes"
import { SITE } from "@/config/site"
import { usePages } from "@/config/pages"
import { formatDate } from "@/utils/format"

type Kpi = {
  label: string
  valeur: number
  detail: string
  icone: string
  accent: string
  vers: string
}

type ATraiter = {
  label: string
  detail: string
  nombre: number
  icone: string
  vers: string
}

/** Carte KPI du bandeau supérieur. */
function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <Link
      to={kpi.vers}
      className="group flex flex-col rounded-xl border border-border-light bg-white p-5 transition-colors hover:border-brand-red/40"
    >
      <div className="flex items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg text-white ${kpi.accent}`} aria-hidden="true">
          <span className="material-symbols-outlined text-[20px]">{kpi.icone}</span>
        </span>
        <span className="material-symbols-outlined text-[18px] text-text-muted transition-colors group-hover:text-brand-red" aria-hidden="true">
          arrow_outward
        </span>
      </div>
      <p className="mt-4 font-heading text-3xl font-extrabold tabular-nums text-text-primary">{kpi.valeur}</p>
      <p className="text-sm font-semibold text-text-primary">{kpi.label}</p>
      <p className="mt-0.5 text-xs text-text-muted">{kpi.detail}</p>
    </Link>
  )
}

export default function AdminDashboard() {
  const { vehicules, enLigne } = useAdminVehicules()
  const { messages } = useMessages()
  const { devis } = useDevis()
  const { locations, essais } = useDemandes()
  const pages = usePages()

  const vehiculesActifs = pages.vente || pages.location
  const transitActif = pages.transit

  const messagesNouveaux = messages.filter((m) => m.statut === "new").length
  const devisNouveaux = devis.filter((d) => d.statut === "new").length
  const demandesEnAttente =
    locations.filter((d) => d.statut === "en_attente").length +
    essais.filter((d) => d.statut === "en_attente").length

  const kpis: Kpi[] = [
    ...(vehiculesActifs
      ? [{ label: "Véhicules", valeur: vehicules.length, detail: "au catalogue", icone: "directions_car", accent: "bg-brand-blue", vers: "/admin/vehicules" }]
      : []),
    ...(vehiculesActifs
      ? [{ label: "Demandes", valeur: demandesEnAttente, detail: "en attente de décision", icone: "fact_check", accent: "bg-amber-500", vers: "/admin/demandes" }]
      : []),
    { label: "Messages", valeur: messagesNouveaux, detail: "non lus", icone: "mail", accent: "bg-brand-red", vers: "/admin/messages" },
    ...(transitActif
      ? [{ label: "Devis transit", valeur: devisNouveaux, detail: "en attente", icone: "local_shipping", accent: "bg-brand-blue-dark", vers: "/admin/devis" }]
      : []),
  ]

  const aTraiter: ATraiter[] = [
    ...(vehiculesActifs
      ? [{ label: "Demandes de location ou d'essai", detail: "à valider ou refuser", nombre: demandesEnAttente, icone: "fact_check", vers: "/admin/demandes" }]
      : []),
    { label: "Messages de contact", detail: "à lire et traiter", nombre: messagesNouveaux, icone: "mail", vers: "/admin/messages" },
    ...(transitActif
      ? [{ label: "Demandes de devis transit", detail: "à rappeler", nombre: devisNouveaux, icone: "local_shipping", vers: "/admin/devis" }]
      : []),
  ]

  const totalATraiter = aTraiter.reduce((total, item) => total + item.nombre, 0)
  const derniersVehicules = vehicules.slice(0, 5)
  const derniersMessages = [...messages]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[13px] font-semibold text-brand-red">{SITE.nomLong}</p>
          <h1 className="mt-1 font-heading text-2xl font-extrabold text-text-primary md:text-3xl">
            Tableau de bord
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Le pouls du catalogue, des demandes et de la boîte de réception.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border-light bg-white px-3 py-1.5 text-xs font-semibold text-text-secondary">
            <span className={`h-2 w-2 rounded-full ${enLigne ? "bg-green-600" : "bg-brand-red"}`} aria-hidden="true" />
            {enLigne ? "API synchronisée" : "Mode local"}
          </span>
          {vehiculesActifs && (
            <Link
              to="/admin/vehicules"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-red px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">add</span>
              Ajouter un véhicule
            </Link>
          )}
        </div>
      </header>

      {/* Indicateurs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}
      </div>

      <div className={`grid grid-cols-1 gap-4 ${vehiculesActifs ? "lg:grid-cols-[1.35fr_1fr]" : ""}`}>
        {/* À traiter */}
        <section className="rounded-xl border border-border-light bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-border-light px-5 py-4">
            <div>
              <h2 className="font-heading text-lg font-bold text-text-primary">À traiter</h2>
              <p className="text-xs text-text-muted">
                {totalATraiter === 0 ? "Tout est à jour." : `${totalATraiter} élément${totalATraiter > 1 ? "s" : ""} en attente.`}
              </p>
            </div>
            <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-brand-red/10 px-2 text-sm font-bold text-brand-red tabular-nums">
              {totalATraiter}
            </span>
          </div>

          <div className="divide-y divide-border-light">
            {aTraiter.map((item) => (
              <Link
                key={item.label}
                to={item.vers}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-brand-light/60"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  item.nombre > 0 ? "bg-brand-red/10 text-brand-red" : "bg-brand-surface text-text-muted"
                }`} aria-hidden="true">
                  <span className="material-symbols-outlined text-[21px]">{item.icone}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-primary">{item.label}</p>
                  <p className="text-xs text-text-muted">{item.detail}</p>
                </div>
                <span className="font-heading text-xl font-bold tabular-nums text-text-primary">{item.nombre}</span>
                <span className="material-symbols-outlined text-[18px] text-text-muted" aria-hidden="true">chevron_right</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Derniers véhicules */}
        {vehiculesActifs && (
        <section className="rounded-xl border border-border-light bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-border-light px-5 py-4">
            <h2 className="font-heading text-lg font-bold text-text-primary">Derniers véhicules</h2>
            <Link to="/admin/vehicules" className="text-xs font-semibold text-brand-red hover:underline">
              Tout gérer
            </Link>
          </div>

          {derniersVehicules.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <span className="material-symbols-outlined text-3xl text-text-muted" aria-hidden="true">directions_car</span>
              <p className="mt-2 text-sm text-text-secondary">Le catalogue est vide.</p>
              <Link to="/admin/vehicules" className="mt-1 inline-block text-sm font-semibold text-brand-red hover:underline">
                Ajouter un véhicule
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border-light">
              {derniersVehicules.map((v) => (
                <li key={v.id}>
                  <Link to="/admin/vehicules" className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-brand-light/60">
                    <span className="flex h-10 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-brand-surface">
                      {v.image ? (
                        <img src={v.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <span className="material-symbols-outlined text-[18px] text-text-muted" aria-hidden="true">directions_car</span>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text-primary">{v.marque} {v.model}</p>
                      <p className="text-xs text-text-muted">{v.service} · {v.annee} · {v.prix}</p>
                    </div>
                    <span className="rounded-full bg-brand-surface px-2 py-1 text-[11px] font-semibold text-text-secondary">
                      {v.statut}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        )}
      </div>

      {/* Derniers messages */}
      <section className="rounded-xl border border-border-light bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-border-light px-5 py-4">
          <h2 className="font-heading text-lg font-bold text-text-primary">Derniers messages</h2>
          <Link to="/admin/messages" className="text-xs font-semibold text-brand-red hover:underline">
            Tout voir
          </Link>
        </div>

        {derniersMessages.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-text-secondary">Aucun message pour le moment.</p>
        ) : (
          <ul className="divide-y divide-border-light">
            {derniersMessages.map((m) => (
              <li key={m.id} className="flex items-center gap-4 px-5 py-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-blue text-[11px] font-bold text-white" aria-hidden="true">
                  {m.nom.split(" ").map((mot) => mot[0]).join("").slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate text-sm font-semibold text-text-primary">
                    {m.nom}
                    {m.statut === "new" && (
                      <span className="rounded-full bg-brand-red/10 px-2 py-0.5 text-[10px] font-bold text-brand-red">Nouveau</span>
                    )}
                  </p>
                  <p className="truncate text-xs text-text-secondary">{m.sujet || m.message}</p>
                </div>
                <span className="hidden text-xs text-text-muted sm:block">{formatDate(m.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
