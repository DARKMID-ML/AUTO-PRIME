import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useSiteLayout } from "@/hooks/useSiteLayout"
import { useVehicules } from "@/hooks/useVehicules"
import { capturer } from "@/config/analytics"
import { adresseComplete, useEntreprise } from "@/config/entreprise"
import { telHref } from "@/config/site"
import { repliImage } from "@/utils/image"
import DemandeModal from "@/components/DemandeModal"
import { type Vehicule } from "@/types/vehicule"

/**
 * ════════════════════════════════════════════════════════════════════════
 *  FICHE VÉHICULE EN PAGE ENTIÈRE — route /vehicule/:id
 * ════════════════════════════════════════════════════════════════════════
 *
 * La composition choisie dans Admin → Apparence du site pilote aussi cette
 * page, exactement comme la page d'accueil et les cartes :
 *
 *   - Signature  : showroom nocturne — grand visuel plein écran, voile bleu,
 *                  prix mis en scène, actions premium.
 *   - Éditorial  : article de journal — filets d'encre, manchette, légende
 *                  de photo, caractéristiques en colonnes réglées.
 *   - Catalogue  : fiche produit d'inventaire — visuel + colonne d'achat,
 *                  chiffres alignés en tableau.
 *
 * Le véhicule est chargé depuis l'API (repli local automatique). Les bou-
 * tons d'action réutilisent le formulaire de demande commun (essai /
 * location) ainsi que l'appel WhatsApp pré-rempli.
 */

// Couleur du badge de statut — même logique que VehicleCard
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

/** Liste des lignes de caractéristiques de la fiche. */
const lignesCarac = (v: Vehicule): [string, string][] => [
  ["Année", String(v.annee)],
  ["Kilométrage", v.km],
  ["Carburant", v.carburant],
  ["Transmission", v.transmission],
  ["Climatisation", v.climatisation],
  ["Places", v.places],
  ["Couleur extérieure", v.peinture],
  ["Intérieur", v.interieur],
  ["Catégorie", v.category],
  ["Consommation", v.consomation],
  ["Localisation", v.localisation],
  ["Statut", v.statut],
]

// ══════════════════════════════════════════════════════════════════════ //
//  Galerie partagée — photos réelles du véhicule, sinon recadrages       //
// ══════════════════════════════════════════════════════════════════════ //

interface Vue {
  src: string
  /** Position d'objet CSS ("50% 50%") — permet des vues différentes d'une même photo. */
  focus: string
}

/** Recadrages utilisés quand le véhicule n'a qu'une seule photo. */
const FOCUS_UNE_PHOTO = ["50% 50%", "22% 42%", "78% 42%", "50% 88%"]

/**
 * Construit la galerie du véhicule :
 *  - plusieurs photos réelles (admin → « Galerie de photos ») → une vue par photo ;
 *  - une seule photo → 4 recadrages (avant, profil gauche/droite, détail bas),
 *    ce qui donne déjà des « vues » exploitables tant que le client n'a pas
 *    fourni ses propres photos.
 */
function useGalerie(vehicule: Vehicule) {
  const vues = useMemo<Vue[]>(() => {
    const uniques = Array.from(
      new Set([vehicule.image, ...(vehicule.photos ?? [])].filter(Boolean)),
    ).slice(0, 6)
    if (uniques.length > 1) {
      return uniques.map((src) => ({ src, focus: "50% 50%" }))
    }
    return FOCUS_UNE_PHOTO.map((focus) => ({ src: vehicule.image, focus }))
  }, [vehicule.image, vehicule.photos])

  const [vue, setVue] = useState(0)
  // Nouveau véhicule → on repart de la vue principale (ajustement pendant
  // le rendu, pas dans un effet : évite un rendu en cascade).
  const [idVehicule, setIdVehicule] = useState(vehicule.id)
  if (idVehicule !== vehicule.id) {
    setIdVehicule(vehicule.id)
    setVue(0)
  }

  const courante = vues[Math.min(vue, vues.length - 1)] ?? { src: vehicule.image, focus: "50% 50%" }
  return { vues, vue, setVue, courante }
}

export default function VehiculeDetails() {
  const { id } = useParams()
  const { vehicules, charge } = useVehicules()
  const layout = useSiteLayout()

  const vehicule = useMemo(
    () => vehicules.find((v) => String(v.id) === id) ?? null,
    [vehicules, id],
  )

  // Étape du parcours : fiche véhicule consultée. Aucune donnée personnelle
  // dans les propriétés, seulement le véhicule et son service.
  useEffect(() => {
    if (!vehicule) return
    capturer("vehicule_vu", {
      vehicule: `${vehicule.marque} ${vehicule.model}`,
      service: vehicule.service,
      statut: vehicule.statut,
      prix: vehicule.prix,
    })
  }, [vehicule])

  // Remonter en haut de page à chaque changement de véhicule
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [id])

  if (charge) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-brand-red">progress_activity</span>
      </div>
    )
  }

  if (!vehicule) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
        <span className="material-symbols-outlined text-5xl text-brand-blue">directions_car</span>
        <p className="text-lg font-bold text-text-primary">Véhicule introuvable</p>
        <p className="text-text-muted max-w-md">
          Ce véhicule n'existe plus ou l'adresse est incorrecte.
        </p>
        <Link to="/vente" className="btn-premium text-white font-bold py-3 px-6 rounded-full">
          Voir le catalogue
        </Link>
      </div>
    )
  }

  if (layout === "atelier") return <FicheAtelier vehicule={vehicule} />
  if (layout === "catalogue") return <FicheCatalogue vehicule={vehicule} />
  return <FicheSignature vehicule={vehicule} />
}

// ══════════════════════════════════════════════════════════════════════ //
//  Atouts partagés (tags équipements) pour les trois compositions        //
// ══════════════════════════════════════════════════════════════════════ //

function Atouts({ vehicule, variante }: { vehicule: Vehicule; variante: "pills" | "liste" | "numerotee" }) {
  const equipements = vehicule.atouts.split(",").map((a) => a.trim()).filter(Boolean)

  if (variante === "liste") {
    return (
      <ul className="divide-y divide-[color:var(--at-line-soft,rgba(23,26,28,.13))] border-y border-[color:var(--at-line,rgba(23,26,28,.2))] text-[15px]">
        {equipements.map((equipement) => (
          <li key={equipement} className="py-2">
            {equipement}
          </li>
        ))}
      </ul>
    )
  }

  if (variante === "numerotee") {
    return (
      <ol className="space-y-1 text-sm text-text-secondary">
        {equipements.map((equipement, i) => (
          <li key={equipement} className="flex gap-2">
            <span className="font-bold tabular-nums text-brand-red">{String(i + 1).padStart(2, "0")}</span>
            {equipement}
          </li>
        ))}
      </ol>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {equipements.map((equipement) => (
        <span
          key={equipement}
          className="bg-white/10 border border-white/25 text-white/90 text-sm px-3 py-1.5 rounded-full backdrop-blur-sm"
        >
          {equipement}
        </span>
      ))}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════ //
//  Composition « Signature » — showroom nocturne                          //
// ══════════════════════════════════════════════════════════════════════ //

function FicheSignature({ vehicule }: { vehicule: Vehicule }) {
  const entreprise = useEntreprise()
  const [demandeOuverte, setDemandeOuverte] = useState(false)
  const { vues, vue, setVue, courante } = useGalerie(vehicule)
  const estLocation = vehicule.service === "Location"
  const estVendu = vehicule.statut === "Vendu"

  return (
    <main>
      {/* --- Hero plein écran avec le véhicule --- */}
      <section className="relative min-h-[70svh] flex items-end overflow-hidden">
        <img
          src={vehicule.image}
          alt={`${vehicule.marque} ${vehicule.model}`}
          className="absolute inset-0 w-full h-full object-cover animate-ken-burns"
          onError={repliImage}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-blue-dark via-brand-blue/40 to-brand-blue-dark/30" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(196,30,58,0.30),transparent_50%)]" aria-hidden="true" />

        {/* Badge statut */}
        <span className={`absolute top-24 left-6 md:left-12 ${couleurStatut(vehicule.statut)} text-white text-sm font-semibold pl-2.5 pr-3 py-1.5 rounded-full shadow-md inline-flex items-center gap-2`}>
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot" aria-hidden="true" />
          {vehicule.statut} · {vehicule.service}
        </span>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12 pb-12 pt-40">
          <p className="text-white/70 text-xs font-bold uppercase tracking-[0.28em] mb-3">
            {vehicule.marque} · {vehicule.type} · {vehicule.localisation}
          </p>
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-white leading-[1.05] max-w-2xl">
            {vehicule.marque} <span className="text-brand-red">{vehicule.model}</span>
          </h1>

          {/* Barre vitrée : prix + faits rapides */}
          <div className="mt-8 flex flex-wrap items-center gap-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 px-6 py-5 w-fit">
            <div>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">
                {estLocation ? "Tarif journalier" : "Prix"}
              </p>
              <p className="text-white font-extrabold text-2xl md:text-3xl leading-tight">{vehicule.prix}</p>
            </div>
            <div className="hidden md:block w-px h-12 bg-white/20" aria-hidden="true" />
            {[
              estLocation ? vehicule.places : vehicule.km,
              estLocation ? vehicule.climatisation : vehicule.carburant,
              vehicule.transmission,
              String(vehicule.annee),
            ].map((fait) => (
              <p key={fait} className="hidden md:block text-white/85 text-sm font-medium">
                {fait}
              </p>
            ))}
          </div>

          {/* Actions */}
          {!estVendu && (
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setDemandeOuverte(true)}
                className="btn-premium text-white font-bold py-3.5 px-8 rounded-full"
              >
                {estLocation ? "DEMANDER UNE LOCATION" : "DEMANDER UN ESSAI"}
              </button>
              <a
                href={telHref(entreprise.telephoneFixe)}
                className="border border-white/40 text-white hover:bg-white hover:text-brand-blue font-bold py-3.5 px-8 rounded-full transition-colors text-center"
              >
                Appeler
              </a>
              <a
                href={`https://wa.me/${entreprise.whatsapp}?text=${encodeURIComponent(
                  `Bonjour, je suis intéressé par le ${vehicule.marque} ${vehicule.model} (${vehicule.annee}).`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-green-400/70 text-green-300 hover:bg-green-500 hover:text-white font-bold py-3.5 px-8 rounded-full transition-colors text-center"
              >
                WhatsApp
              </a>
            </div>
          )}
        </div>
      </section>

      {/* --- Feuille descriptive claire --- */}
      <section className="bg-white py-14 px-6">
        <div className="max-w-4xl mx-auto grid gap-10 md:grid-cols-[1fr_16rem]">
          <div>
            <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-red">description</span>
              Présentation
            </h2>
            {/* Galerie interactive : la vue sélectionnée s'affiche en grand */}
            <figure className="mb-4">
              <img
                key={`${courante.src}-${courante.focus}`}
                src={courante.src}
                alt={`${vehicule.marque} ${vehicule.model} — vue ${vue + 1}`}
                style={{ objectPosition: courante.focus }}
                className="w-full h-72 md:h-96 object-cover rounded-2xl shadow-card border border-border-light animate-fade-in"
                onError={repliImage}
              />
              <figcaption className="mt-2 text-sm text-text-muted">
                Vue {vue + 1} / {vues.length} — {vehicule.marque} {vehicule.model} {vehicule.annee}, {vehicule.peinture}, {vehicule.interieur}
              </figcaption>
            </figure>

            {/* Vignettes cliquables (recadrées) */}
            <div className="grid grid-cols-4 gap-2 mb-8" role="group" aria-label="Vues du véhicule">
              {vues.map((uneVue, index) => (
                <button
                  key={`${uneVue.src}-${uneVue.focus}`}
                  type="button"
                  onClick={() => setVue(index)}
                  aria-label={`Voir la vue ${index + 1}`}
                  aria-pressed={index === vue}
                  className={`overflow-hidden rounded-lg border-2 transition-all cursor-zoom-in ${
                    index === vue
                      ? "border-brand-red shadow-card"
                      : "border-transparent hover:border-brand-red/40"
                  }`}
                >
                  <img
                    src={uneVue.src}
                    alt=""
                    style={{ objectPosition: uneVue.focus }}
                    className="h-16 md:h-20 w-full object-cover"
                    loading="lazy"
                    onError={repliImage}
                  />
                </button>
              ))}
            </div>

            <p className="text-text-secondary leading-relaxed mb-10">{vehicule.description}</p>

            <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-red">list_check</span>
              Équipements
            </h2>
            <Atouts vehicule={vehicule} variante="pills" />
          </div>

          {/* Colonne : caractéristiques */}
          <aside className="bg-brand-surface rounded-2xl p-5 h-fit border border-border-light">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-3">Caractéristiques</h3>
            <dl className="divide-y divide-border-light text-sm">
              {lignesCarac(vehicule).map(([libelle, valeur]) => (
                <div key={libelle} className="flex justify-between gap-3 py-2">
                  <dt className="text-text-muted">{libelle}</dt>
                  <dd className="font-semibold text-text-primary text-right">{valeur}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        {/* Retour catalogue */}
        <div className="max-w-4xl mx-auto mt-12 pt-6 border-t border-border-light flex items-center justify-between">
          <Link
            to={estLocation ? "/location" : "/vente"}
            className="inline-flex items-center gap-2 text-brand-blue font-bold text-sm hover:text-brand-red transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Retour au catalogue
          </Link>
          <p className="text-text-muted text-xs">Fiche {vehicule.marque} {vehicule.model} — {entreprise.nom}</p>
        </div>
      </section>

      {demandeOuverte && (
        <DemandeModal
          vehicule={vehicule}
          mode={estLocation ? "location" : "essai"}
          onClose={() => setDemandeOuverte(false)}
        />
      )}
    </main>
  )
}

// ══════════════════════════════════════════════════════════════════════ //
//  Composition « Atelier » — fiche technique de concession                 //
// ══════════════════════════════════════════════════════════════════════ //

function FicheAtelier({ vehicule }: { vehicule: Vehicule }) {
  const entreprise = useEntreprise()
  const [demandeOuverte, setDemandeOuverte] = useState(false)
  const { vues, vue, setVue, courante } = useGalerie(vehicule)
  const estLocation = vehicule.service === "Location"
  const estVendu = vehicule.statut === "Vendu"

  const encre = "text-[color:var(--at-ink,#171a1c)]"
  const regle = "border-[color:var(--at-line,rgba(23,26,28,.2))]"

  return (
    <main className={`bg-[color:var(--at-paper,#ece7dd)] ${encre}`}>
      <article className="max-w-3xl mx-auto px-5 py-12 md:py-16">
        {/* Manchette */}
        <nav className={`text-[11px] tracking-[0.18em] uppercase border-b ${regle} pb-2 mb-8 flex justify-between`}>
          <span>
            <Link to="/" className="hover:text-brand-red">Accueil</Link>
            {" / "}
            <Link to={estLocation ? "/location" : "/vente"} className="hover:text-brand-red">
              {estLocation ? "Location" : "Vente"}
            </Link>
            {" / "}
            {vehicule.marque}
          </span>
          <span className={`${encre}/55`}>Fiche n° {vehicule.id}</span>
        </nav>

        <p className="text-[12px] tracking-[0.22em] uppercase text-brand-red font-bold">
          {vehicule.service} — {vehicule.type} · {vehicule.localisation}
        </p>
        <h1 className="mt-2 font-heading text-4xl md:text-5xl font-bold leading-[1.08] tracking-[-0.01em]">
          {vehicule.marque} {vehicule.model}, {vehicule.annee}
        </h1>

        {/* Ligne de prix façon accroche */}
        <div className={`mt-4 flex flex-wrap items-baseline justify-between gap-4 border-b-2 border-[color:var(--at-ink,#171a1c)] pb-4`}>
          <p className="font-heading text-2xl">
            {vehicule.prix}
            {estLocation && <span className={`ml-1.5 text-sm ${encre}/60`}>/ jour</span>}
          </p>
          <span className={`text-[11px] uppercase tracking-[0.14em] ${encre}/60`}>
            Annonce · {vehicule.statut}
          </span>
        </div>

        {/* Figure pleine largeur + légende + pellicule de vues */}
        <figure className="my-8">
          <img
            key={`${courante.src}-${courante.focus}`}
            src={courante.src}
            alt={`${vehicule.marque} ${vehicule.model} — vue ${vue + 1}`}
            style={{ objectPosition: courante.focus }}
            className={`w-full max-h-[460px] object-cover border ${regle} animate-fade-in`}
            onError={repliImage}
          />
          <figcaption className={`mt-2 text-[12px] tracking-[0.06em] ${encre}/60 flex justify-between`}>
            <span>{vehicule.description} — visible à {vehicule.localisation}.</span>
            <span>Photo {vue + 1}/{vues.length}</span>
          </figcaption>
        </figure>

        {/* Pellicule : vignettes bordées façon diapositives */}
        <div className={`grid grid-cols-4 gap-2 mb-8 border-y ${regle} py-2`} role="group" aria-label="Vues du véhicule">
          {vues.map((uneVue, index) => (
            <button
              key={`${uneVue.src}-${uneVue.focus}`}
              type="button"
              onClick={() => setVue(index)}
              aria-label={`Voir la vue ${index + 1}`}
              aria-pressed={index === vue}
              className={`overflow-hidden transition-all cursor-zoom-in ${
                index === vue ? "outline outline-2 outline-brand-red -outline-offset-[3px]" : "opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={uneVue.src}
                alt=""
                style={{ objectPosition: uneVue.focus }}
                className="h-16 w-full object-cover"
                loading="lazy"
                onError={repliImage}
              />
            </button>
          ))}
        </div>

        {/* Article : description façon colonne presse */}
        <div className={`grid gap-8 md:grid-cols-[1.4fr_1fr] border-t ${regle} pt-8`}>
          <div>
            <p className={`text-lg leading-relaxed first-letter:font-heading first-letter:text-5xl first-letter:float-left first-letter:mr-3 first-letter:leading-none`}>
              {vehicule.description}
            </p>

            <h2 className={`mt-10 font-heading text-xl border-b ${regle} pb-2`}>Caractéristiques</h2>
            <dl className={`mt-3 text-sm divide-y divide-[color:var(--at-line-soft,rgba(23,26,28,.13))]`}>
              {lignesCarac(vehicule).map(([libelle, valeur]) => (
                <div key={libelle} className="flex justify-between gap-3 py-2">
                  <dt className={`${encre}/55`}>{libelle}</dt>
                  <dd className="font-medium">{valeur}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Colonne latérale : encadré actions */}
          <aside className={`border-2 border-[color:var(--at-ink,#171a1c)] p-5 h-fit md:sticky md:top-24`}>
            <p className="text-[11px] tracking-[0.2em] uppercase text-brand-red mb-3">Répondre à l'annonce</p>
            <p className="text-sm leading-relaxed mb-4">
              Contactez {entreprise.nom} au{" "}
              <a href={telHref(entreprise.telephoneFixe)} className="font-bold underline underline-offset-2 hover:text-brand-red">
                {entreprise.telephoneFixe}
              </a>{" "}
              ou par WhatsApp pour convenir d'un rendez-vous.
            </p>

            {!estVendu && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setDemandeOuverte(true)}
                  className={`w-full bg-brand-red text-white font-heading font-bold py-3 px-4 text-sm hover:bg-brand-red-dark transition-colors`}
                >
                  {estLocation ? "Demander une location" : "Demander un essai"}
                </button>
                <a
                  href={`https://wa.me/${entreprise.whatsapp}?text=${encodeURIComponent(
                    `Bonjour, je suis intéressé par le ${vehicule.marque} ${vehicule.model} (${vehicule.annee}).`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-center border ${regle} font-heading font-bold py-3 px-4 text-sm hover:text-brand-red transition-colors`}
                >
                  WhatsApp
                </a>
              </div>
            )}

            <div className={`mt-5 pt-4 border-t ${regle}`}>
              <h3 className="font-heading font-bold mb-2">Équipements de série</h3>
              <Atouts vehicule={vehicule} variante="liste" />
            </div>
          </aside>
        </div>

        {/* Colophon */}
        <footer className={`mt-12 border-t-2 border-[color:var(--at-ink,#171a1c)] pt-4 flex justify-between text-[12px] ${encre}/60`}>
          <Link to={estLocation ? "/location" : "/vente"} className="hover:text-brand-red underline underline-offset-2">
            ← Toutes les annonces
          </Link>
          <span>{entreprise.nom} — {adresseComplete(entreprise)}</span>
        </footer>
      </article>

      {demandeOuverte && (
        <DemandeModal
          vehicule={vehicule}
          mode={estLocation ? "location" : "essai"}
          onClose={() => setDemandeOuverte(false)}
        />
      )}
    </main>
  )
}

// ══════════════════════════════════════════════════════════════════════ //
//  Composition « Catalogue » — fiche produit d'inventaire                  //
// ══════════════════════════════════════════════════════════════════════ //

function FicheCatalogue({ vehicule }: { vehicule: Vehicule }) {
  const entreprise = useEntreprise()
  const [demandeOuverte, setDemandeOuverte] = useState(false)
  const { vues, vue, setVue, courante } = useGalerie(vehicule)
  const estLocation = vehicule.service === "Location"
  const estVendu = vehicule.statut === "Vendu"

  return (
    <main className="bg-white">
      {/* Fil d'ariane */}
      <nav className="border-b border-black/10 bg-brand-surface/60">
        <p className="max-w-6xl mx-auto px-4 py-3 text-[12px] uppercase tracking-[0.12em] text-text-muted flex gap-2 items-center">
          <Link to="/" className="hover:text-brand-red">Accueil</Link>
          <span aria-hidden="true">/</span>
          <Link to={estLocation ? "/location" : "/vente"} className="hover:text-brand-red">
            {estLocation ? "Location" : "Vente"}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-text-primary font-bold">{vehicule.marque} {vehicule.model}</span>
        </p>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-10 lg:grid-cols-[1.25fr_1fr]">
        {/* Visuel + pellicule de vues + résumé visuel */}
        <section>
          <div className="relative border border-black/10">
            <img
              key={`${courante.src}-${courante.focus}`}
              src={courante.src}
              alt={`${vehicule.marque} ${vehicule.model} — vue ${vue + 1}`}
              style={{ objectPosition: courante.focus }}
              className="w-full max-h-[430px] object-cover animate-fade-in"
              onError={repliImage}
            />
            <span className={`absolute left-0 top-0 ${couleurStatut(vehicule.statut)} px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white`}>
              {vehicule.statut}
            </span>
            <span className="absolute right-0 top-0 bg-white/90 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-text-primary">
              Réf. {String(vehicule.id).padStart(4, "0")}
            </span>
          </div>

          {/* Pellicule de vues */}
          <div
            className="grid grid-cols-4 gap-2 mt-2"
            role="group"
            aria-label="Vues du véhicule"
          >
            {vues.map((uneVue, index) => (
              <button
                key={`${uneVue.src}-${uneVue.focus}`}
                type="button"
                onClick={() => setVue(index)}
                aria-label={`Voir la vue ${index + 1}`}
                aria-pressed={index === vue}
                className={`overflow-hidden border transition-all cursor-zoom-in ${
                  index === vue ? "border-brand-red" : "border-black/10 hover:border-brand-red/50"
                }`}
              >
                <img
                  src={uneVue.src}
                  alt=""
                  style={{ objectPosition: uneVue.focus }}
                  className="h-16 w-full object-cover"
                  loading="lazy"
                  onError={repliImage}
                />
              </button>
            ))}
          </div>

          {/* Bandeau de faits sous le visuel */}
          <dl className="mt-0 grid grid-cols-2 sm:grid-cols-4 border border-t-0 border-black/10 divide-x divide-x-reverse divide-black/10 text-center">
            {[
              ["Année", String(vehicule.annee)],
              ["Km", vehicule.km],
              [estLocation ? "Places" : "Carburant", estLocation ? vehicule.places : vehicule.carburant],
              ["Boîte", vehicule.transmission],
            ].map(([libelle, valeur]) => (
              <div key={libelle} className="py-3">
                <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">{libelle}</dt>
                <dd className="text-base font-bold tabular-nums text-text-primary mt-0.5">{valeur}</dd>
              </div>
            ))}
          </dl>

          {/* Fiche technique dense */}
          <h2 className="mt-10 text-sm font-bold uppercase tracking-[0.16em] text-text-primary border-b-2 border-brand-red pb-2">
            Fiche technique
          </h2>
          <dl className="mt-3 divide-y divide-black/5 border-b border-black/10 text-sm">
            {lignesCarac(vehicule).map(([libelle, valeur]) => (
              <div key={libelle} className="flex items-center justify-between py-2">
                <dt className="text-text-muted">{libelle}</dt>
                <dd className="font-semibold tabular-nums text-text-primary text-right">{valeur}</dd>
              </div>
            ))}
          </dl>

          {/* Équipements numérotés */}
          <h2 className="mt-10 text-sm font-bold uppercase tracking-[0.16em] text-text-primary border-b-2 border-brand-red pb-2">
            Équipements inclus
          </h2>
          <div className="mt-3">
            <Atouts vehicule={vehicule} variante="numerotee" />
          </div>
        </section>

        {/* Colonne d'achat collante */}
        <aside className="lg:sticky lg:top-24 h-fit border border-black/10 bg-white">
          <div className="p-6 border-b border-black/10">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-red">{vehicule.marque}</p>
            <h1 className="mt-1 text-2xl font-bold leading-tight text-text-primary">
              {vehicule.model} {vehicule.annee}
            </h1>
            <p className="mt-2 text-sm text-text-secondary">{vehicule.description}</p>

            <div className="mt-5 flex items-end gap-2">
              <p className="text-3xl font-bold tabular-nums text-text-primary">{vehicule.prix}</p>
              {estLocation && <p className="pb-1 text-sm text-text-muted">par jour</p>}
            </div>
            <p className="mt-1 text-[12px] text-text-muted">
              {estLocation ? "Tarif de base — contacter l'agence pour les conditions." : "Prix affiché TTC — contacter l'agence pour une offre."}
            </p>
          </div>

          {!estVendu ? (
            <div className="p-6 space-y-3">
              <button
                type="button"
                onClick={() => setDemandeOuverte(true)}
                className="w-full bg-brand-red text-white font-bold py-3.5 px-5 text-sm uppercase tracking-wide hover:bg-brand-red-dark transition-colors"
              >
                {estLocation ? "Réserver ce véhicule" : "Demander un essai"}
              </button>
              <a
                href={telHref(entreprise.telephoneFixe)}
                className="block w-full border border-brand-blue text-brand-blue text-center font-bold py-3 px-5 text-sm hover:bg-brand-blue hover:text-white transition-colors"
              >
                Appeler l'agence
              </a>
              <a
                href={`https://wa.me/${entreprise.whatsapp}?text=${encodeURIComponent(
                  `Bonjour, je suis intéressé par le ${vehicule.marque} ${vehicule.model} (${vehicule.annee}), réf. ${vehicule.id}.`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full border border-green-600 text-green-700 text-center font-bold py-3 px-5 text-sm hover:bg-green-600 hover:text-white transition-colors"
              >
                WhatsApp
              </a>
            </div>
          ) : (
            <p className="p-6 text-sm text-text-muted">
              Ce véhicule est vendu. Voir nos disponibilités dans le{" "}
              <Link to="/vente" className="text-brand-blue font-bold hover:text-brand-red">catalogue vente</Link>.
            </p>
          )}

          <div className="bg-brand-surface/60 border-t border-black/10 p-6 text-sm space-y-2">
            <p className="flex items-center gap-2 text-text-secondary">
              <span className="material-symbols-outlined text-brand-red">location_on</span>
              Agence de {vehicule.localisation}
            </p>
            <p className="flex items-center gap-2 text-text-secondary">
              <span className="material-symbols-outlined text-brand-red">schedule</span>
              {entreprise.horaires?.[0]
                ? `${entreprise.horaires[0].jour} : ${entreprise.horaires[0].heures}`
                : "Horaires en agence"}
            </p>
            <p className="flex items-center gap-2 text-text-secondary">
              <span className="material-symbols-outlined text-brand-red">verified_user</span>
              Véhicules inspectés avant livraison
            </p>
          </div>
        </aside>
      </div>

      {demandeOuverte && (
        <DemandeModal
          vehicule={vehicule}
          mode={estLocation ? "location" : "essai"}
          onClose={() => setDemandeOuverte(false)}
        />
      )}
    </main>
  )
}
