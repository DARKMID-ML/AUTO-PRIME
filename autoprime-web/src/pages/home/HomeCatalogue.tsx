import { useMemo, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { useVehicules } from "@/hooks/useVehicules"
import { type Vehicule } from "@/types/vehicule"
import { useEngagements, useTemoignages } from "@/config/contenu"
import { telHref } from "@/config/site"
import { useEntreprise } from "@/config/entreprise"
import { useAdminServices } from "@/config/contenu"
import VehicleCard from "@/components/VehicleCard"
import VehicleModal from "@/components/VehicleModal"
import SectionChiffres from "@/components/SectionChiffres"

type ServiceFiltre = "Tous" | "Vente" | "Location"

/**
 * Composition « Catalogue » — inventaire de concession.
 *
 * Tout est orienté recherche : barre utilitaire, moteur de recherche dans le
 * hero, rayons en tuiles, grille dense avec rail de filtres collant. Angles
 * nets, titres condensés en capitales, chiffres tabulaires.
 */
export default function HomeCatalogue() {
  const entreprise = useEntreprise()
  const engagements = useEngagements()
  const temoignages = useTemoignages()
  const [service, setService] = useState<ServiceFiltre>("Tous")
  const [marque, setMarque] = useState("")
  const [terme, setTerme] = useState("")
  const [vehiculeActif, setVehiculeActif] = useState<Vehicule | null>(null)

  const { vehicules } = useVehicules()

  const servicesListe = useAdminServices()

  const marques = useMemo(
    () => Array.from(new Set(vehicules.map((v) => v.marque))).sort(),
    [vehicules]
  )

  const inventaire = useMemo(() => {
    const recherche = terme.trim().toLowerCase()
    return vehicules.filter((vehicule) => {
      if (service !== "Tous" && vehicule.service !== service) return false
      if (marque && vehicule.marque !== marque) return false
      if (
        recherche &&
        !`${vehicule.marque} ${vehicule.model} ${vehicule.type} ${vehicule.annee}`.toLowerCase().includes(recherche)
      ) {
        return false
      }
      return true
    })
  }, [vehicules, service, marque, terme])

  const descendreVersInventaire = () => {
    document.getElementById("inventaire")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const validerRecherche = (event: FormEvent) => {
    event.preventDefault()
    descendreVersInventaire()
  }

  const reinitialiser = () => {
    setService("Tous")
    setMarque("")
    setTerme("")
  }

  return (
    <>
      <main className="bg-white">
        {/* ────────── HERO : MOTEUR DE RECHERCHE ────────── */}
        <section className="site-nav-offset bg-brand-blue-dark text-white">
          <div className="max-w-[92rem] mx-auto px-5 py-12 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-gray-400">{entreprise.baseline}</p>
              <h1 className="mt-3 text-4xl leading-[1.02] md:text-5xl lg:text-6xl">
                Trouvez le véhicule qui vous correspond
              </h1>
              <p className="mt-4 max-w-xl text-gray-300">
                Filtrez l'inventaire par service, marque ou mot-clé. Chaque véhicule est inspecté et documenté avant sa mise en ligne.
              </p>

              <form onSubmit={validerRecherche} className="mt-8 grid gap-3 bg-white p-3 sm:grid-cols-[10rem_1fr_auto]" role="search">
                <label className="sr-only" htmlFor="hero-service">Service</label>
                <select
                  id="hero-service"
                  value={service}
                  onChange={(event) => setService(event.target.value as ServiceFiltre)}
                  className="border border-black/15 bg-brand-surface px-3 py-3 text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-red/40"
                >
                  <option value="Tous">Achat & location</option>
                  <option value="Vente">Achat</option>
                  <option value="Location">Location</option>
                </select>

                <label className="sr-only" htmlFor="hero-terme">Mot-clé</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-text-muted" aria-hidden="true">
                    search
                  </span>
                  <input
                    id="hero-terme"
                    value={terme}
                    onChange={(event) => setTerme(event.target.value)}
                    placeholder="Marque, modèle, année…"
                    className="w-full border border-black/15 py-3 pl-11 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-red/40"
                  />
                </div>

                <button type="submit" className="bg-brand-red px-8 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-red-dark transition-colors">
                  Rechercher
                </button>
              </form>

              <div className="mt-5 flex flex-wrap gap-x-7 gap-y-2 text-[13px] text-gray-300">
                <Link to="/location" className="hover:text-white transition-colors">Louer pour un week-end</Link>
                <Link to="/transit" className="hover:text-white transition-colors">Importer un véhicule</Link>
                <Link to="/mes-demandes" className="hover:text-white transition-colors">Suivre ma demande</Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px self-start bg-white/10">
              {entreprise.statistiques.map((stat) => (
                <div key={stat.id} className="bg-brand-blue-dark px-5 py-6 border-l-2 border-brand-red">
                  <p className="text-3xl font-bold tabular-nums text-white">{stat.chiffre}</p>
                  <p className="mt-1 text-[12px] font-semibold uppercase tracking-wide text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ────────── RAYONS ────────── */}
        <section className="border-b border-black/10">
          <div className="max-w-[92rem] mx-auto px-5 py-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-2xl">Nos rayons</h2>
              <Link to="/services" className="text-[13px] font-bold uppercase tracking-wide text-brand-red hover:text-brand-red-dark transition-colors">
                Tous nos services
              </Link>
            </div>

            <div className="mt-5 grid gap-px bg-black/10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {servicesListe.map((rayon) => (
                <Link
                  key={rayon.id}
                  to={rayon.hasLink && rayon.lien ? rayon.lien : "/services"}
                  className="group bg-white p-5 hover:bg-brand-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-3xl text-brand-red" aria-hidden="true">{rayon.icone}</span>
                  <h3 className="mt-3 text-[15px] leading-tight text-text-primary group-hover:text-brand-red transition-colors">{rayon.titre}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">{rayon.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ────────── INVENTAIRE ────────── */}
        <section id="inventaire" className="bg-brand-surface border-b border-black/10 py-12">
          <div className="max-w-[92rem] mx-auto px-5 grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
            <aside className="self-start border border-black/10 bg-white lg:sticky lg:top-[11.5rem]">
              <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
                <p className="text-[12px] font-bold uppercase tracking-wide text-text-primary">Filtres</p>
                <button onClick={reinitialiser} className="text-[12px] font-semibold text-brand-red hover:text-brand-red-dark transition-colors">
                  Effacer
                </button>
              </div>

              <div className="px-4 py-4 border-b border-black/10">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted mb-3">Service</p>
                <div className="flex flex-col gap-2">
                  {(["Tous", "Vente", "Location"] as ServiceFiltre[]).map((valeur) => (
                    <button
                      key={valeur}
                      onClick={() => setService(valeur)}
                      aria-pressed={service === valeur}
                      className={`text-left text-sm font-semibold transition-colors ${service === valeur ? "text-brand-red" : "text-text-secondary hover:text-text-primary"}`}
                    >
                      {valeur === "Tous" ? "Tous les véhicules" : valeur}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-4 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted mb-3">Marque</p>
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                  <button
                    onClick={() => setMarque("")}
                    aria-pressed={marque === ""}
                    className={`text-left text-sm font-semibold transition-colors ${marque === "" ? "text-brand-red" : "text-text-secondary hover:text-text-primary"}`}
                  >
                    Toutes les marques
                  </button>
                  {marques.map((valeur) => (
                    <button
                      key={valeur}
                      onClick={() => setMarque(valeur)}
                      aria-pressed={marque === valeur}
                      className={`text-left text-sm font-semibold transition-colors ${marque === valeur ? "text-brand-red" : "text-text-secondary hover:text-text-primary"}`}
                    >
                      {valeur}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <div>
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/10 pb-4">
                <div>
                  <h2 className="text-2xl">Inventaire disponible</h2>
                  <p className="mt-1 text-[13px] text-text-secondary">
                    {inventaire.length} véhicule{inventaire.length > 1 ? "s" : ""}
                    {service !== "Tous" && ` en ${service.toLowerCase()}`}
                    {marque && ` — ${marque}`}
                    {terme && ` — « ${terme} »`}
                  </p>
                </div>
                <Link to="/vente" className="text-[13px] font-bold uppercase tracking-wide text-brand-red hover:text-brand-red-dark transition-colors">
                  Catalogue complet
                </Link>
              </div>

              {inventaire.length === 0 ? (
                <div className="mt-8 border border-black/10 bg-white p-8 text-center">
                  <p className="text-lg font-bold text-text-primary">Aucun véhicule ne correspond à ces filtres.</p>
                  <p className="mt-2 text-sm text-text-secondary">Élargissez la recherche ou dites-nous ce que vous cherchez : nous le trouvons pour vous.</p>
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <button onClick={reinitialiser} className="border border-black/15 px-5 py-2.5 text-[13px] font-bold uppercase tracking-wide text-text-primary hover:border-brand-red hover:text-brand-red transition-colors">
                      Réinitialiser les filtres
                    </button>
                    <Link to="/contact" className="bg-brand-red px-5 py-2.5 text-[13px] font-bold uppercase tracking-wide text-white hover:bg-brand-red-dark transition-colors">
                      Demander une recherche
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {inventaire.map((vehicule) => (
                    <VehicleCard key={vehicule.id} vehicule={vehicule} onVoirDetails={setVehiculeActif} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ────────── CHIFFRES CLÉS ────────── */}
        <SectionChiffres />

        {/* ────────── GARANTIES ────────── */}
        <section className="py-12 border-b border-black/10">
          <div className="max-w-[92rem] mx-auto px-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {engagements.map((valeur) => (
              <div key={valeur.id} className="border-l-2 border-brand-red pl-5">
                <span className="material-symbols-outlined text-3xl text-brand-blue" aria-hidden="true">{valeur.icone}</span>
                <h3 className="mt-3 text-lg leading-tight text-text-primary">{valeur.titre}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{valeur.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ────────── AVIS ────────── */}
        <section className="py-12 bg-brand-surface">
          <div className="max-w-[92rem] mx-auto px-5">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/10 pb-4">
              <h2 className="text-2xl">Avis clients vérifiés</h2>
              <p className="text-[13px] font-semibold text-text-secondary">
                {entreprise.statistiques[2]?.chiffre ?? ""} de satisfaction sur {(entreprise.statistiques[1]?.chiffre ?? "").replace("+", "")} ventes
              </p>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {temoignages.map((avis) => (
                <figure key={avis.id} className="border border-black/10 bg-white p-5">
                  <div className="flex items-center gap-1 text-brand-red" aria-label="5 étoiles">
                    {[0, 1, 2, 3, 4].map((etoile) => (
                      <span key={etoile} className="material-symbols-outlined text-[18px]">star</span>
                    ))}
                  </div>
                  <blockquote className="mt-3 text-sm leading-relaxed text-text-secondary">« {avis.message} »</blockquote>
                  <figcaption className="mt-4 flex items-center gap-3 border-t border-black/5 pt-3">
                    <span className="flex h-9 w-9 items-center justify-center bg-brand-blue text-[12px] font-bold text-white">{avis.initiales}</span>
                    <span className="text-[13px] font-bold text-text-primary">{avis.nom}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ────────── CTA ────────── */}
        <section className="bg-brand-red text-white">
          <div className="max-w-[92rem] mx-auto px-5 py-8 flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <p className="text-xl leading-tight md:text-2xl">Un véhicule précis en tête ? Nous le cherchons pour vous.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/contact" className="bg-white px-6 py-3 text-[13px] font-bold uppercase tracking-wide text-brand-red hover:bg-gray-100 transition-colors">
                Demander une recherche
              </Link>
              <a href={telHref(entreprise.telephoneMobile)} className="border border-white/60 px-6 py-3 text-[13px] font-bold uppercase tracking-wide text-white hover:bg-white/10 transition-colors">
                {entreprise.telephoneMobile}
              </a>
            </div>
          </div>
        </section>
      </main>

      {vehiculeActif && <VehicleModal vehicule={vehiculeActif} onClose={() => setVehiculeActif(null)} />}
    </>
  )
}
