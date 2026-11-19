import { type Vehicule } from "@/types/vehicule"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import DemandeModal from "./DemandeModal"
import { telHref } from "@/config/site"
import { useEntreprise } from "@/config/entreprise"
import { repliImage } from "@/utils/image"
import { useModalLayout } from "@/hooks/useSiteLayout"

// Props du composant
interface VehicleModalProps {
  vehicule: Vehicule   // Le véhicule à afficher dans la modale
  onClose: () => void  // Fonction appelée pour fermer la modale
  /** Aperçu intégré (admin) : la modale reste dans son conteneur. */
  integre?: boolean
}

/** Props communes aux trois compositions de modale. */
interface ModaleProps {
  vehicule: Vehicule
  onClose: () => void
  integre: boolean
  estVendu: boolean
  estLocation: boolean
  equipements: string[]
  demandeOuverte: boolean
  onOuvrirDemande: () => void
  onFermerDemande: () => void
}

// Couleur du badge selon le statut (même logique que VehicleCard)
const getCouleurStatut = (statut: string) => {
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
 * Modale de détail d'un véhicule.
 *
 * La modale suit la composition du site par défaut, mais son style se règle
 * séparément dans l'administration (Admin → Apparence → Modale de détail) :
 * showroom arrondi plein format (Signature), annonce de journal à filets
 * (Éditorial) ou fiche d'inventaire dense (Catalogue) — même découpage que
 * VehicleCard et VehiculeDetails.
 */
export default function VehicleModal({ vehicule, onClose, integre = false }: VehicleModalProps) {
  // Ouverture du formulaire de demande (location ou essai)
  const [demandeOuverte, setDemandeOuverte] = useState(false)
  // Fermer la modale avec la touche Échap
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose])

  // Équipements (atouts) sous forme de tags
  const equipements = vehicule.atouts.split(",").map((a) => a.trim()).filter(Boolean)

  // Le véhicule n'est plus achetable s'il est vendu
  const estVendu = vehicule.statut === "Vendu"

  // Vrai si le véhicule est en location (la modale s'adapte)
  const estLocation = vehicule.service === "Location"

  // Style de la modale : réglage dédié (Admin → Apparence → Modale de détail), sinon composition du site
  const layout = useModalLayout()

  const commun: ModaleProps = {
    vehicule,
    onClose,
    integre,
    estVendu,
    estLocation,
    equipements,
    demandeOuverte,
    onOuvrirDemande: () => setDemandeOuverte(true),
    onFermerDemande: () => setDemandeOuverte(false),
  }

  if (layout === "atelier") return <ModaleAtelier {...commun} />
  if (layout === "catalogue") return <ModaleCatalogue {...commun} />

  return <ModaleSignature {...commun} />
}

/** Composition « Signature » — plein format showroom : hero image, cartes arrondies, ombres. */
function ModaleSignature({
  vehicule,
  onClose,
  integre,
  estVendu,
  estLocation,
  equipements,
  demandeOuverte,
  onOuvrirDemande,
  onFermerDemande,
}: ModaleProps) {
  const entreprise = useEntreprise()

  // Le fragment permet de monter le formulaire de demande par-dessus la fiche
  return (
    <>
      {/* Overlay semi-transparent : fermeture au clic à l'extérieur */}
      <div
      className={`${integre ? "absolute" : "fixed"} inset-0 z-[60] bg-black/60 flex items-center justify-center p-4`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${vehicule.marque} ${vehicule.model}`}
    >
      {/* Contenu de la modale : clic à l'intérieur = ne pas fermer */}
      <div
        className={`bg-white rounded-2xl shadow-modal w-full max-w-4xl ${integre ? "max-h-full" : "max-h-[90vh]"} overflow-y-auto relative animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-text-primary hover:bg-brand-red hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Image principale + galerie miniatures */}
        <div className="relative">
          <img
            src={vehicule.image}
            alt={`${vehicule.marque} ${vehicule.model}`}
            className="w-full h-64 md:h-80 object-cover"
            onError={repliImage}
          />
          <span
            className={`absolute top-3 left-3 ${getCouleurStatut(vehicule.statut)} text-white text-sm pl-2.5 pr-3 py-1 rounded-full shadow-md inline-flex items-center gap-1.5`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot" aria-hidden="true" />
            {vehicule.statut}
          </span>
        </div>
        <div className="flex gap-2 p-3 bg-brand-surface">
          {[0, 1, 2, 3].map((i) => (
            <img
              key={i}
              src={vehicule.image}
              alt={`Vue ${i + 1} du ${vehicule.model}`}
              className="w-16 h-12 object-cover rounded border border-border-light"
              onError={repliImage}
            />
          ))}
        </div>

        <div className="p-6">
          {/* Titre : Marque + Modèle */}
          <p className="text-brand-blue text-sm font-semibold uppercase mb-1">
            {vehicule.marque}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
            {vehicule.model}
          </h2>
          <Link
            to={`/vehicule/${vehicule.id}`}
            className="text-brand-blue text-sm font-bold inline-flex items-center gap-1 hover:text-brand-red transition-colors mb-4"
          >
            Ouvrir la fiche complète
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>

          {/* Caractéristiques rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {estLocation ? (
              <div className="bg-brand-surface rounded p-3 text-center">
                <span className="material-symbols-outlined text-brand-red">event_seat</span>
                <p className="text-sm text-text-secondary">{vehicule.places}</p>
              </div>
            ) : (
              <div className="bg-brand-surface rounded p-3 text-center">
                <span className="material-symbols-outlined text-brand-red">speed</span>
                <p className="text-sm text-text-secondary">{vehicule.km}</p>
              </div>
            )}
            <div className="bg-brand-surface rounded p-3 text-center">
              <span className="material-symbols-outlined text-brand-red">{estLocation ? "ac_unit" : "local_gas_station"}</span>
              <p className="text-sm text-text-secondary">
                {estLocation ? `Clim : ${vehicule.climatisation}` : vehicule.carburant}
              </p>
            </div>
            <div className="bg-brand-surface rounded p-3 text-center">
              <span className="material-symbols-outlined text-brand-red">settings</span>
              <p className="text-sm text-text-secondary">{vehicule.transmission}</p>
            </div>
            <div className="bg-brand-surface rounded p-3 text-center">
              <span className="material-symbols-outlined text-brand-red">calendar_today</span>
              <p className="text-sm text-text-secondary">{vehicule.annee}</p>
            </div>
          </div>

          {/* Prix (tarif journalier pour la location) */}
          <div className="mb-6">
            {estLocation && (
              <p className="text-xs font-semibold uppercase text-text-muted mb-1">Tarif journalier</p>
            )}
            <p className="text-xl font-bold text-brand-red">{vehicule.prix}</p>
          </div>

          {/* Boutons d'action (masqués si le véhicule est vendu) */}
          {!estVendu && (
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                type="button"
                onClick={onOuvrirDemande}
                className="btn-premium text-white font-bold py-3 px-6 rounded-full text-center"
              >
                {estLocation ? "DEMANDER UNE LOCATION" : "DEMANDER UN ESSAI"}
              </button>
              <a
                href={telHref(entreprise.telephoneFixe)}
                className="border border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white font-bold py-3 px-6 rounded transition-colors text-center"
              >
                Appeler
              </a>
              <a
                href={`https://wa.me/${entreprise.whatsapp}?text=${encodeURIComponent(
                  `Bonjour, je suis intéressé par le ${vehicule.marque} ${vehicule.model} (${vehicule.annee}). Pouvez-vous me donner plus d'informations ?`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-bold py-3 px-6 rounded transition-colors text-center"
              >
                WhatsApp
              </a>
            </div>
          )}

          {/* Description */}
          <h3 className="text-lg font-bold text-text-primary mb-2">Description</h3>
          <p className="text-text-secondary leading-relaxed mb-6">
            {vehicule.description}
          </p>

          {/* Tableau des caractéristiques */}
          <h3 className="text-lg font-bold text-text-primary mb-2">Caractéristiques</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 mb-6">
            {[
              { label: "Année", valeur: String(vehicule.annee) },
              { label: "Kilométrage", valeur: vehicule.km },
              { label: "Carburant", valeur: vehicule.carburant },
              { label: "Transmission", valeur: vehicule.transmission },
              { label: "Climatisation", valeur: vehicule.climatisation },
              { label: "Couleur extérieure", valeur: vehicule.peinture },
              { label: "Intérieur", valeur: vehicule.interieur },
              { label: "Places", valeur: vehicule.places },
              { label: "Localisation", valeur: vehicule.localisation },
            ].map((ligne) => (
              <div
                key={ligne.label}
                className="flex justify-between border-b border-border-light py-2 text-sm"
              >
                <span className="text-text-muted">{ligne.label}</span>
                <span className="font-medium text-text-primary">{ligne.valeur}</span>
              </div>
            ))}
          </div>

          {/* Équipements sous forme de tags */}
          <h3 className="text-lg font-bold text-text-primary mb-3">Équipements</h3>
          <div className="flex flex-wrap gap-2">
            {equipements.map((equipement) => (
              <span
                key={equipement}
                className="bg-brand-surface border border-border-standard text-text-secondary text-sm px-3 py-1 rounded-full"
              >
                {equipement}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Formulaire de demande (location ou essai) : monté par-dessus la fiche */}
    {demandeOuverte && !integre && (
      <DemandeModal
        vehicule={vehicule}
        mode={estLocation ? "location" : "essai"}
        onClose={onFermerDemande}
      />
    )}
    </>
  )
}

/** Composition « Atelier » — fiche technique : papier béton, filets d'acier, zéro ombre. */
function ModaleAtelier({
  vehicule,
  onClose,
  integre,
  estLocation,
  equipements,
  demandeOuverte,
  onOuvrirDemande,
  onFermerDemande,
}: ModaleProps) {
  const entreprise = useEntreprise()
  const encre = "text-[color:var(--at-ink,#171a1c)]"
  const regle = "border-[color:var(--at-line,rgba(23,26,28,.2))]"

  const rapide: [string, string][] = estLocation
    ? [
        ["Places", vehicule.places],
        ["Climatisation", vehicule.climatisation],
        ["Transmission", vehicule.transmission],
        ["Ville", vehicule.localisation],
      ]
    : [
        ["Kilométrage", vehicule.km],
        ["Carburant", vehicule.carburant],
        ["Transmission", vehicule.transmission],
        ["Ville", vehicule.localisation],
      ]

  return (
    <>
      {/* Overlay : fermeture au clic à l'extérieur */}
      <div
        className={`${integre ? "absolute" : "fixed"} inset-0 z-[60] bg-black/70 flex items-center justify-center p-4`}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={`${vehicule.marque} ${vehicule.model}`}
      >
        {/* Fiche sur papier béton : clic à l'intérieur = ne pas fermer */}
        <div
          className={`relative w-full max-w-3xl ${integre ? "max-h-full" : "max-h-[90vh]"} overflow-y-auto animate-scale-in bg-[color:var(--at-paper,#ece7dd)] border-t-2 border-[color:var(--at-ink,#171a1c)] ${encre}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Fermeture : croix d'atelier, angles vifs */}
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="absolute top-3 right-3 z-10 w-9 h-9 border border-[color:var(--at-ink,#171a1c)] flex items-center justify-center transition-colors hover:bg-[color:var(--at-ink,#171a1c)] hover:text-[color:var(--at-paper,#ece7dd)]"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>

          {/* Manchette de la fiche */}
          <header className="px-6 pt-5 md:px-10">
            <p className="text-[11px] uppercase tracking-[0.24em] text-brand-red">
              {vehicule.marque} · {vehicule.type} · {vehicule.localisation}
            </p>
            <h2 className="mt-1.5 pr-10 font-heading text-3xl md:text-4xl leading-[1.05] tracking-[-0.01em]">
              {vehicule.marque} {vehicule.model}
            </h2>
            <p className={`mt-2 text-[12px] uppercase tracking-[0.18em] ${encre}/60`}>
              {vehicule.statut} — {vehicule.annee} · {vehicule.service}
            </p>
          </header>
          <div className="mx-6 mt-4 border-t-2 border-[color:var(--at-ink,#171a1c)] md:mx-10" />

          <div className="px-6 py-5 md:px-10">
            {/* Photo légendée façon planche technique */}
            <figure>
              <img
                src={vehicule.image}
                alt={`${vehicule.marque} ${vehicule.model}`}
                className="w-full h-52 md:h-64 object-cover border border-[color:var(--at-line,rgba(23,26,28,.2))]"
                onError={repliImage}
              />
              <figcaption className={`mt-1.5 text-[11px] uppercase tracking-[0.12em] ${encre}/55`}>
                {vehicule.peinture} · {vehicule.localisation} — {vehicule.statut}
              </figcaption>
            </figure>

            {/* Chapeau + caractéristiques */}
            <p className={`mt-4 font-heading text-[17px] leading-7 ${encre}/85`}>
              {vehicule.description}
            </p>

            <dl className={`mt-4 grid grid-cols-2 gap-x-8 gap-y-1 border-t ${regle} pt-3 text-[13px]`}>
              {rapide.map(([libelle, valeur]) => (
                <div key={libelle} className={`flex justify-between gap-2 border-b ${regle} py-1`}>
                  <dt className={`${encre}/55`}>{libelle}</dt>
                  <dd className="font-medium">{valeur}</dd>
                </div>
              ))}
            </dl>

            {/* Prix + actions, filet fort au-dessus */}
            <div className={`mt-5 flex flex-wrap items-baseline justify-between gap-4 border-t-2 border-[color:var(--at-ink,#171a1c)] pt-4`}>
              <p className="font-heading text-2xl">
                {estLocation && <span className={`mr-2 text-[13px] uppercase tracking-[0.16em] ${encre}/60`}>Tarif journalier</span>}
                {vehicule.prix}
              </p>
              <Link
                to={`/vehicule/${vehicule.id}`}
                className="font-heading text-sm underline underline-offset-4 hover:text-brand-red transition-colors"
              >
                Lire la fiche complète ↗
              </Link>
            </div>

            {/* Boutons d'action (masqués si le véhicule est vendu) */}
            {vehicule.statut !== "Vendu" && (
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onOuvrirDemande}
                  className="border-2 border-[color:var(--at-ink,#171a1c)] bg-[color:var(--at-ink,#171a1c)] text-[color:var(--at-paper,#ece7dd)] px-6 py-2.5 text-[12px] font-bold uppercase tracking-[0.18em] transition-colors hover:bg-transparent hover:text-[color:var(--at-ink,#171a1c)]"
                >
                  {estLocation ? "Demander une location" : "Demander un essai"}
                </button>
                <a
                  href={telHref(entreprise.telephoneFixe)}
                  className="border border-[color:var(--at-ink,rgba(23,26,28,.85))] px-6 py-2.5 text-[12px] font-bold uppercase tracking-[0.18em] transition-colors hover:bg-[color:var(--at-ink,#171a1c)] hover:text-[color:var(--at-paper,#ece7dd)]"
                >
                  Appeler
                </a>
                <a
                  href={`https://wa.me/${entreprise.whatsapp}?text=${encodeURIComponent(
                    `Bonjour, je suis intéressé par le ${vehicule.marque} ${vehicule.model} (${vehicule.annee}). Pouvez-vous me donner plus d'informations ?`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-[color:var(--at-ink,rgba(23,26,28,.85))] px-6 py-2.5 text-[12px] font-bold uppercase tracking-[0.18em] transition-colors hover:bg-[color:var(--at-ink,#171a1c)] hover:text-[color:var(--at-paper,#ece7dd)]"
                >
                  WhatsApp
                </a>
              </div>
            )}

            {/* Fiche technique */}
            <h3 className={`mt-6 text-[12px] font-bold uppercase tracking-[0.2em] ${encre}/70`}>
              Fiche technique
            </h3>
            <dl className={`mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 text-[13px] divide-y divide-[color:var(--at-line-soft,rgba(23,26,28,.13))]`}>
              {[
                ["Année", String(vehicule.annee)],
                ["Kilométrage", vehicule.km],
                ["Carburant", vehicule.carburant],
                ["Transmission", vehicule.transmission],
                ["Climatisation", vehicule.climatisation],
                ["Couleur extérieure", vehicule.peinture],
                ["Intérieur", vehicule.interieur],
                ["Places", vehicule.places],
              ].map(([libelle, valeur]) => (
                <div key={libelle} className="flex justify-between gap-3 py-1.5">
                  <dt className={`${encre}/55`}>{libelle}</dt>
                  <dd className="font-medium">{valeur}</dd>
                </div>
              ))}
            </dl>

            {/* Équipements : pastilles carrées, zéro arrondi */}
            <h3 className={`mt-5 text-[12px] font-bold uppercase tracking-[0.2em] ${encre}/70`}>
              Équipements
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {equipements.map((equipement) => (
                <span
                  key={equipement}
                  className={`border ${regle} px-2.5 py-1 text-[12px] uppercase tracking-[0.08em]`}
                >
                  {equipement}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire de demande : monté par-dessus la fiche */}
      {demandeOuverte && !integre && (
        <DemandeModal
          vehicule={vehicule}
          mode={estLocation ? "location" : "essai"}
          onClose={onFermerDemande}
        />
      )}
    </>
  )
}

/** Composition « Catalogue » — fiche d'inventaire dense : angles nets, chiffres alignés, barre utilitaire. */
function ModaleCatalogue({
  vehicule,
  onClose,
  integre,
  estVendu,
  estLocation,
  equipements,
  demandeOuverte,
  onOuvrirDemande,
  onFermerDemande,
}: ModaleProps) {
  const entreprise = useEntreprise()

  const rapide: [string, string][] = estLocation
    ? [
        ["Places", vehicule.places],
        ["Clim", vehicule.climatisation],
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
    <>
      {/* Overlay : fermeture au clic à l'extérieur */}
      <div
        className={`${integre ? "absolute" : "fixed"} inset-0 z-[60] bg-black/70 flex items-center justify-center p-4`}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={`${vehicule.marque} ${vehicule.model}`}
      >
        {/* Fiche d'inventaire : clic à l'intérieur = ne pas fermer */}
        <div
          className={`relative w-full max-w-5xl ${integre ? "max-h-full" : "max-h-[90vh]"} overflow-y-auto bg-white border border-black/15 animate-scale-in`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Barre utilitaire : référence + fermeture */}
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-black/10 bg-white/95 px-5 py-2.5 backdrop-blur">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
              Réf. {vehicule.id} · {vehicule.service} · {vehicule.type}
            </p>
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="border border-black/15 px-2.5 py-2 text-text-muted transition-colors hover:border-brand-red/60 hover:text-brand-red"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <div className="grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            {/* Colonne photo, badge de statut à l'angle */}
            <div className="relative border-b border-black/10 md:border-b-0 md:border-r">
              <img
                src={vehicule.image}
                alt={`${vehicule.marque} ${vehicule.model}`}
                className="h-56 w-full object-cover md:h-full md:min-h-[20rem]"
                onError={repliImage}
              />
              <span
                className={`absolute left-0 top-0 ${getCouleurStatut(vehicule.statut)} px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white`}
              >
                {vehicule.statut}
              </span>
            </div>

            {/* Colonne fiche */}
            <div className="p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-red">
                {vehicule.marque}
              </p>
              <h2 className="mt-1 font-heading text-2xl font-bold uppercase leading-tight text-text-primary">
                {vehicule.model}
              </h2>

              <dl className="mt-3 divide-y divide-black/5 border-y border-black/10 text-[13px]">
                {rapide.map(([libelle, valeur]) => (
                  <div key={libelle} className="flex items-center justify-between py-1.5">
                    <dt className="text-text-muted">{libelle}</dt>
                    <dd className="font-semibold tabular-nums text-text-primary">{valeur}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
                  {estLocation ? "Tarif / jour" : "Prix TTC"}
                </p>
                <p className="text-3xl font-bold tabular-nums text-text-primary">{vehicule.prix}</p>
              </div>

              {/* Actions : boutons carrés, barre utilitaire */}
              {!estVendu && (
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={onOuvrirDemande}
                    className="bg-brand-red px-4 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-brand-red-dark"
                  >
                    {estLocation ? "Demander une location" : "Demander un essai"}
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={telHref(entreprise.telephoneFixe)}
                      className="border border-black/15 px-4 py-3 text-center text-[12px] font-bold uppercase tracking-[0.14em] text-text-primary transition-colors hover:border-brand-red/60 hover:text-brand-red"
                    >
                      Appeler
                    </a>
                    <a
                      href={`https://wa.me/${entreprise.whatsapp}?text=${encodeURIComponent(
                        `Bonjour, je suis intéressé par le ${vehicule.marque} ${vehicule.model} (${vehicule.annee}). Pouvez-vous me donner plus d'informations ?`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-black/15 px-4 py-3 text-center text-[12px] font-bold uppercase tracking-[0.14em] text-text-primary transition-colors hover:border-brand-red/60 hover:text-brand-red"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              )}

              <Link
                to={`/vehicule/${vehicule.id}`}
                className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold uppercase tracking-[0.12em] text-brand-blue transition-colors hover:text-brand-red"
              >
                Fiche complète
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Bandeau inférieur dense : description + caractéristiques + équipements */}
          <div className="border-t border-black/10 p-5">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted">
                  Description
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                  {vehicule.description}
                </p>
              </div>
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted">
                  Caractéristiques
                </h3>
                <dl className="mt-1.5 divide-y divide-black/5 border-y border-black/10 text-[13px]">
                  {[
                    ["Année", String(vehicule.annee)],
                    ["Kilométrage", vehicule.km],
                    ["Carburant", vehicule.carburant],
                    ["Transmission", vehicule.transmission],
                    ["Climatisation", vehicule.climatisation],
                    ["Couleur", vehicule.peinture],
                    ["Intérieur", vehicule.interieur],
                    ["Places", vehicule.places],
                  ].map(([libelle, valeur]) => (
                    <div key={libelle} className="flex items-center justify-between py-1.5">
                      <dt className="text-text-muted">{libelle}</dt>
                      <dd className="font-semibold tabular-nums text-text-primary">{valeur}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <h3 className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted">
              Équipements
            </h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {equipements.map((equipement) => (
                <span
                  key={equipement}
                  className="border border-black/15 px-2.5 py-1 text-[12px] font-semibold text-text-secondary"
                >
                  {equipement}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire de demande : monté par-dessus la fiche */}
      {demandeOuverte && !integre && (
        <DemandeModal
          vehicule={vehicule}
          mode={estLocation ? "location" : "essai"}
          onClose={onFermerDemande}
        />
      )}
    </>
  )
}