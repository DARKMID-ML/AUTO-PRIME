import { Link } from "react-router-dom"
import { type Vehicule } from "@/types/vehicule"
import { useSiteLayout } from "@/hooks/useSiteLayout"
import { repliImage } from "@/utils/image"

// Props du composant
interface VehicleCardProps {
  vehicule: Vehicule  // Le véhicule à afficher
  onVoirDetails: (vehicule: Vehicule) => void  // Fonction appelée au clic sur DÉTAILS
}

// Couleur du badge de statut (compositions Signature et Catalogue)
const couleurStatut = (statut: string) => {
  switch (statut) {
    case "Disponible":
      return "bg-green-500"
    case "Réservé":
      return "bg-orange-500"
    case "Vendu":
      return "bg-red-500"
    case "Nouveau":
      return "bg-brand-red"
    default:
      return "bg-gray-500"
  }
}

/**
 * Carte d'un véhicule.
 *
 * La composition choisie dans l'administration change aussi la carte :
 * une carte showroom arrondie (Signature), une fiche horizontale à filets
 * (Atelier) ou une fiche d'inventaire dense (Catalogue). Toutes les pages
 * qui affichent des véhicules en profitent automatiquement.
 */
export default function VehicleCard({ vehicule, onVoirDetails }: VehicleCardProps) {
  const layout = useSiteLayout()

  if (layout === "atelier") return <CarteAtelier vehicule={vehicule} onVoirDetails={onVoirDetails} />
  if (layout === "catalogue") return <CarteCatalogue vehicule={vehicule} onVoirDetails={onVoirDetails} />

  return (
    <div className="group bg-white rounded-2xl shadow-card hover:shadow-premium transition-all duration-300 overflow-hidden border border-border-light hover:-translate-y-1.5">
      <div className="relative overflow-hidden card-shine">
        <img
          src={vehicule.image}
          alt={`${vehicule.marque} ${vehicule.model}`}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={repliImage}
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" aria-hidden="true" />
        <span className={`absolute top-3 right-3 ${couleurStatut(vehicule.statut)} text-white text-xs font-semibold pl-2.5 pr-3 py-1 rounded-full shadow-md inline-flex items-center gap-1.5`}>
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot" aria-hidden="true" />
          {vehicule.statut}
        </span>
      </div>

      <div className="p-5">
        <p className="text-brand-blue text-xs font-bold uppercase tracking-widest mb-1">{vehicule.marque}</p>
        <h3 className="text-text-primary text-lg font-bold mb-2 group-hover:text-brand-red transition-colors">{vehicule.model}</h3>

        <div className="flex items-center text-text-muted text-sm mb-3">
          <span className="material-symbols-outlined text-sm mr-1">calendar_today</span>
          {vehicule.annee}
          <span className="mx-2">•</span>
          <span className="material-symbols-outlined text-sm mr-1">location_on</span>
          {vehicule.localisation}
        </div>

        {vehicule.service === "Location" ? (
          <div className="flex items-center text-text-muted text-sm mb-4">
            <span className="material-symbols-outlined text-sm mr-1">event_seat</span>
            {vehicule.places}
            <span className="mx-2">•</span>
            <span className="material-symbols-outlined text-sm mr-1">ac_unit</span>
            Clim. : {vehicule.climatisation}
          </div>
        ) : (
          <div className="flex items-center text-text-muted text-sm mb-4">
            <span className="material-symbols-outlined text-sm mr-1">speed</span>
            {vehicule.km}
            <span className="mx-2">•</span>
            <span className="material-symbols-outlined text-sm mr-1">local_gas_station</span>
            {vehicule.carburant}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-border-light pt-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              {vehicule.service === "Location" ? "Tarif journalier" : "Prix"}
            </p>
            <p className="text-brand-red font-extrabold text-lg leading-tight">{vehicule.prix}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onVoirDetails(vehicule)} className="btn-premium text-white text-sm font-bold py-2.5 px-5 rounded-full">
              DÉTAILS
            </button>
            <Link
              to={`/vehicule/${vehicule.id}`}
              aria-label="Fiche complète en page entière"
              className="w-9 h-9 rounded-full border border-border-standard flex items-center justify-center text-text-muted hover:text-white hover:bg-brand-red hover:border-brand-red transition-colors"
            >
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Composition « Atelier » — fiche horizontale : papier béton, filets d'acier, zéro ombre. */
function CarteAtelier({ vehicule, onVoirDetails }: VehicleCardProps) {
  const encre = "text-[color:var(--at-ink,#171a1c)]"
  const regle = "border-[color:var(--at-line,rgba(23,26,28,.2))]"

  const caracteristiques: [string, string][] =
    vehicule.service === "Location"
      ? [
          ["Places", vehicule.places],
          ["Climatisation", vehicule.climatisation],
          ["Transmission", vehicule.transmission],
          ["Ville", vehicule.localisation],
        ]
      : [
          ["Année", String(vehicule.annee)],
          ["Kilométrage", vehicule.km],
          ["Carburant", vehicule.carburant],
          ["Ville", vehicule.localisation],
        ]

  return (
    <article className={`bg-[color:var(--at-paper,#ece7dd)] border-t-2 border-[color:var(--at-ink,#171a1c)] pt-3 ${encre}`}>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]">
        <div className="min-w-0">
          <p className="text-[11px] tracking-[0.2em] uppercase text-brand-red">
            {vehicule.marque} · {vehicule.type}
          </p>
          <h3 className="mt-1 font-heading text-2xl leading-tight tracking-[-0.01em]">
            {vehicule.marque} {vehicule.model}
          </h3>
          <p className={`mt-2 text-sm leading-relaxed ${encre}/75`}>{vehicule.description}</p>

          <dl className={`mt-3 grid grid-cols-2 gap-x-5 gap-y-1 border-t ${regle} pt-3 text-[13px]`}>
            {caracteristiques.map(([libelle, valeur]) => (
              <div key={libelle} className="flex justify-between gap-2">
                <dt className={`${encre}/55`}>{libelle}</dt>
                <dd className="font-medium">{valeur}</dd>
              </div>
            ))}
          </dl>

          <div className={`mt-3 flex items-baseline justify-between border-t ${regle} pt-3`}>
            <p className="font-heading text-xl">
              {vehicule.prix}
              {vehicule.service === "Location" && <span className={`ml-1.5 text-[13px] ${encre}/60`}>/ jour</span>}
            </p>
            <button
              onClick={() => onVoirDetails(vehicule)}
              className="font-heading text-sm underline underline-offset-4 hover:text-brand-red transition-colors"
            >
              Lire la fiche
            </button>
          </div>
        </div>

        <figure className="order-first sm:order-none">
          <Link to={`/vehicule/${vehicule.id}`} aria-label={`Ouvrir la fiche complète du ${vehicule.marque} ${vehicule.model}`}>
            <img
              src={vehicule.image}
              alt={`${vehicule.marque} ${vehicule.model}`}
              className={`h-40 w-full object-cover border ${regle} sm:h-full hover:opacity-90 transition-opacity`}
              loading="lazy"
              onError={repliImage}
            />
          </Link>
          <figcaption className={`mt-1.5 text-[11px] tracking-[0.12em] uppercase ${encre}/55`}>
            <Link to={`/vehicule/${vehicule.id}`} className="hover:text-brand-red">
              {vehicule.statut} — {vehicule.localisation} · fiche complète ↗
            </Link>
          </figcaption>
        </figure>
      </div>
    </article>
  )
}

/** Composition « Catalogue » — fiche d'inventaire dense, chiffres alignés. */
function CarteCatalogue({ vehicule, onVoirDetails }: VehicleCardProps) {
  const lignes: [string, string][] =
    vehicule.service === "Location"
      ? [
          ["Places", vehicule.places],
          ["Climatisation", vehicule.climatisation],
          ["Boîte", vehicule.transmission],
          ["Agence", vehicule.localisation],
        ]
      : [
          ["Année", String(vehicule.annee)],
          ["Kilométrage", vehicule.km],
          ["Carburant", vehicule.carburant],
          ["Agence", vehicule.localisation],
        ]

  return (
    <article className="group flex flex-col border border-black/10 bg-white transition-colors hover:border-brand-red/50">
      <div className="relative">
        <img
          src={vehicule.image}
          alt={`${vehicule.marque} ${vehicule.model}`}
          className="h-44 w-full object-cover"
          loading="lazy"
          onError={repliImage}
        />
        <span className={`absolute left-0 top-0 ${couleurStatut(vehicule.statut)} px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white`}>
          {vehicule.statut}
        </span>
        <span className="absolute right-0 top-0 bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-text-primary">
          {vehicule.service}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-red">{vehicule.marque}</p>
        <h3 className="mt-1 text-xl font-bold leading-tight text-text-primary">{vehicule.model}</h3>

        <dl className="mt-3 divide-y divide-black/5 border-y border-black/10 text-[13px]">
          {lignes.map(([libelle, valeur]) => (
            <div key={libelle} className="flex items-center justify-between py-1.5">
              <dt className="text-text-muted">{libelle}</dt>
              <dd className="font-semibold tabular-nums text-text-primary">{valeur}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
              {vehicule.service === "Location" ? "Tarif / jour" : "Prix TTC"}
            </p>
            <p className="text-2xl font-bold tabular-nums text-text-primary">{vehicule.prix}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onVoirDetails(vehicule)}
              aria-label="Aperçu rapide"
              title="Aperçu rapide"
              className="border border-black/15 px-2.5 py-2.5 text-text-muted hover:text-brand-red hover:border-brand-red/60 transition-colors"
            >
              <span className="material-symbols-outlined text-lg align-middle">visibility</span>
            </button>
            <Link
              to={`/vehicule/${vehicule.id}`}
              className="bg-brand-red px-4 py-2.5 text-[12px] font-bold uppercase tracking-wide text-white hover:bg-brand-red-dark transition-colors inline-block"
            >
              Voir la fiche
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
