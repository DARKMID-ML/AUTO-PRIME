import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useVehicules } from "@/hooks/useVehicules"
import { type Vehicule } from "../types/vehicule"
import PageHeader from "@/components/PageHeader"
import VehicleCard from "../components/VehicleCard"
import VehicleModal from "../components/VehicleModal"

// Nombre de véhicules affichés par page
const PAR_PAGE = 6

export default function Vente() {
    // --- DONNÉES : uniquement les véhicules en vente (API + repli local) ---
    const { vehicules } = useVehicules()
    const vehiculesVente = useMemo(
        () => vehicules.filter((v) => v.service === "Vente"),
        [vehicules]
    )

    // --- VALEURS DES FILTRES (extraites automatiquement des données) ---
    const marques = useMemo(
        () => Array.from(new Set(vehiculesVente.map((v) => v.marque))).sort(),
        [vehiculesVente]
    )
    const annees = useMemo(
        () => Array.from(new Set(vehiculesVente.map((v) => v.annee))).sort((a, b) => b - a),
        [vehiculesVente]
    )
    const carburants = useMemo(
        () => Array.from(new Set(vehiculesVente.map((v) => v.carburant))).sort(),
        [vehiculesVente]
    )
    const localisations = useMemo(
        () => Array.from(new Set(vehiculesVente.map((v) => v.localisation))).sort(),
        [vehiculesVente]
    )

    // --- ÉTATS DES FILTRES ET DE L'AFFICHAGE ---
    const [marque, setMarque] = useState("")
    const [annee, setAnnee] = useState("")
    const [carburantsSel, setCarburantsSel] = useState<string[]>([])
    const [localisationsSel, setLocalisationsSel] = useState<string[]>([])
    const [tri, setTri] = useState("recents")
    const [vue, setVue] = useState<"grille" | "liste">("grille")
    const [page, setPage] = useState(1)
    const [vehiculeActif, setVehiculeActif] = useState<Vehicule | null>(null)

    // --- RECHERCHE LIBRE
    // Le mot-clé vit dans l'URL (`/vente?recherche=…`), ce qui permet à la barre
    // de navigation de la composition « Catalogue » d'envoyer directement une
    // recherche ici, et rend le lien partageable. L'URL est la seule source de
    // vérité : pas d'état local à resynchroniser.
    const [searchParams, setSearchParams] = useSearchParams()
    const terme = searchParams.get("recherche") ?? ""

    const changerTerme = (valeur: string) => {
        const suivants = new URLSearchParams(searchParams)
        if (valeur) suivants.set("recherche", valeur)
        else suivants.delete("recherche")
        setSearchParams(suivants, { replace: true })
        setPage(1)
    }

    // Ajouter / retirer une valeur d'une liste de cases à cocher
    const basculer = (valeur: string, liste: string[], setter: (l: string[]) => void) => {
        setter(liste.includes(valeur) ? liste.filter((v) => v !== valeur) : [...liste, valeur])
    }

    // Effacer tous les filtres
    const reinitialiser = () => {
        setMarque("")
        setAnnee("")
        setCarburantsSel([])
        setLocalisationsSel([])
        setPage(1)
        changerTerme("")
    }

    // --- FILTRAGE + TRI ---
    const resultats = useMemo(() => {
        const recherche = terme.trim().toLowerCase()
        const filtres = vehiculesVente.filter((v) => {
            if (marque && v.marque !== marque) return false
            if (annee && String(v.annee) !== annee) return false
            if (carburantsSel.length > 0 && !carburantsSel.includes(v.carburant)) return false
            if (localisationsSel.length > 0 && !localisationsSel.includes(v.localisation)) return false
            if (
                recherche &&
                !`${v.marque} ${v.model} ${v.type} ${v.annee} ${v.carburant} ${v.localisation}`.toLowerCase().includes(recherche)
            ) {
                return false
            }
            return true
        })

        const tries = [...filtres]
        if (tri === "marque") {
            tries.sort((a, b) => a.marque.localeCompare(b.marque, "fr"))
        } else if (tri === "annee") {
            tries.sort((a, b) => b.annee - a.annee)
        } else {
            // "Récents" : année la plus récente puis id décroissant
            tries.sort((a, b) => b.annee - a.annee || b.id - a.id)
        }
        return tries
    }, [vehiculesVente, marque, annee, carburantsSel, localisationsSel, terme, tri])

    // --- PAGINATION ---
    const totalPages = Math.max(Math.ceil(resultats.length / PAR_PAGE), 1)
    const pageActive = Math.min(page, totalPages)
    const visibles = resultats.slice((pageActive - 1) * PAR_PAGE, pageActive * PAR_PAGE)

    return (
        <>
            {/* ============================== */}
            {/* EN-TÊTE (commun aux compositions) */}
            {/* ============================== */}
            <PageHeader
                page="vente"
                meta={`${resultats.length} véhicule${resultats.length > 1 ? "s" : ""} disponible${resultats.length > 1 ? "s" : ""}`}
            />

            {/* ============================== */}
            {/* BARRE D'OUTILS : VUE + TRI      */}
            {/* ============================== */}
            <section className="bg-white border-b border-border-standard py-4 px-4">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Recherche libre (même champ que la barre de navigation) */}
                    <div className="relative flex-1 sm:max-w-md">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-text-muted" aria-hidden="true">search</span>
                        <label htmlFor="recherche-vehicule" className="sr-only">Rechercher un véhicule</label>
                        <input
                            id="recherche-vehicule"
                            type="search"
                            value={terme}
                            onChange={(e) => changerTerme(e.target.value)}
                            placeholder="Marque, modèle, carburant…"
                            className="w-full border border-border-standard rounded py-2 pl-11 pr-10 text-sm bg-white text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand-red focus:outline-none"
                        />
                        {terme && (
                            <button
                                onClick={() => changerTerme("")}
                                aria-label="Effacer la recherche"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-brand-red transition-colors"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        )}
                    </div>

                    {/* Boutons de changement d'affichage (visuels) */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setVue("grille")}
                            aria-label="Vue grille"
                            className={`p-2 rounded-lg border transition-colors ${vue === "grille"
                                ? "bg-brand-red text-white border-brand-red"
                                : "bg-white text-text-secondary border-border-standard hover:text-brand-red"
                                }`}
                        >
                            <span className="material-symbols-outlined text-xl">grid_view</span>
                        </button>
                        <button
                            onClick={() => setVue("liste")}
                            aria-label="Vue liste"
                            className={`p-2 rounded border transition-colors ${vue === "liste"
                                ? "bg-brand-red text-white border-brand-red"
                                : "bg-white text-text-secondary border-border-standard hover:text-brand-red"
                                }`}
                        >
                            <span className="material-symbols-outlined text-xl">view_list</span>
                        </button>
                    </div>

                    {/* Menu déroulant de tri */}
                    <div className="flex items-center gap-2">
                        <label htmlFor="tri" className="text-sm text-text-secondary">Trier par :</label>
                        <select
                            id="tri"
                            value={tri}
                            onChange={(e) => {
                                setTri(e.target.value)
                                setPage(1)
                            }}
                            className="border border-border-standard rounded p-2 text-sm bg-white text-text-primary focus:ring-2 focus:ring-brand-red focus:outline-none"
                        >
                            <option value="recents">Récents</option>
                            <option value="marque">Marque A-Z</option>
                            <option value="annee">Année</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* ============================== */}
            {/* CONTENU : FILTRES + GRILLE      */}
            {/* ============================== */}
            <section className="py-12 px-4 bg-brand-light relative overflow-hidden">
                {/* Orbes flottantes derrière le catalogue (animations permanentes) */}
                <div className="absolute top-10 -left-24 w-72 h-72 bg-brand-red/10 rounded-full blur-3xl animate-drift pointer-events-none" aria-hidden="true" />
                <div className="absolute bottom-10 -right-24 w-80 h-80 bg-brand-blue/10 rounded-full blur-3xl animate-float-slow pointer-events-none" aria-hidden="true" />
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 relative">

                    {/* ----------BARRE LATÉRALE DE FILTRES (sticky)----------- */}
                    <aside className="md:sticky md:top-24 md:self-start bg-white rounded-2xl shadow-card border border-border-light p-5 h-fit">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                <span className="material-symbols-outlined text-brand-red animate-bob">filter_alt</span>
                                Filtres
                            </h2>
                            <button
                                onClick={reinitialiser}
                                className="text-sm text-brand-red hover:text-brand-red-dark font-medium transition-colors"
                            >
                                Réinitialiser
                            </button>
                        </div>

                        {/* Filtre Marque */}
                        <div className="mb-5">
                            <label htmlFor="filtre-marque" className="block text-sm font-semibold text-text-primary mb-2">
                                Marque
                            </label>
                            <select
                                id="filtre-marque"
                                value={marque}
                                onChange={(e) => {
                                    setMarque(e.target.value)
                                    setPage(1)
                                }}
                                className="w-full border border-border-standard rounded p-2 text-sm bg-white text-text-primary focus:ring-2 focus:ring-brand-red focus:outline-none"
                            >
                                <option value="">Toutes les marques</option>
                                {marques.map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filtre Année */}
                        <div className="mb-5">
                            <label htmlFor="filtre-annee" className="block text-sm font-semibold text-text-primary mb-2">
                                Année
                            </label>
                            <select
                                id="filtre-annee"
                                value={annee}
                                onChange={(e) => {
                                    setAnnee(e.target.value)
                                    setPage(1)
                                }}
                                className="w-full border border-border-standard rounded p-2 text-sm bg-white text-text-primary focus:ring-2 focus:ring-brand-red focus:outline-none"
                            >
                                <option value="">Toutes les années</option>
                                {annees.map((a) => (
                                    <option key={a} value={String(a)}>{a}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filtre Carburant (cases à cocher) */}
                        <div className="mb-5">
                            <p className="text-sm font-semibold text-text-primary mb-2">Carburant</p>
                            {carburants.map((c) => (
                                <label key={c} className="flex items-center gap-2 text-sm text-text-secondary mb-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={carburantsSel.includes(c)}
                                        onChange={() => {
                                            basculer(c, carburantsSel, setCarburantsSel)
                                            setPage(1)
                                        }}
                                        className="accent-brand-red"
                                    />
                                    {c}
                                </label>
                            ))}
                        </div>

                        {/* Filtre Localisation (cases à cocher) */}
                        <div>
                            <p className="text-sm font-semibold text-text-primary mb-2">Localisation</p>
                            {localisations.map((l) => (
                                <label key={l} className="flex items-center gap-2 text-sm text-text-secondary mb-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={localisationsSel.includes(l)}
                                        onChange={() => {
                                            basculer(l, localisationsSel, setLocalisationsSel)
                                            setPage(1)
                                        }}
                                        className="accent-brand-red"
                                    />
                                    {l}
                                </label>
                            ))}
                        </div>
                    </aside>

                    {/* ----------GRILLE DE VÉHICULES----------- */}
                    <div>
                        {visibles.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {visibles.map((vehicule) => (
                                    <VehicleCard
                                        key={vehicule.id}
                                        vehicule={vehicule}
                                        onVoirDetails={setVehiculeActif}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-card border border-border-light p-12 text-center">
                                <span className="material-symbols-outlined text-text-muted" style={{ fontSize: "56px" }}>
                                    search_off
                                </span>
                                <p className="text-lg font-medium text-text-primary mt-4 mb-2">
                                    Aucun véhicule ne correspond à vos critères
                                </p>
                                <p className="text-text-secondary mb-6">
                                    Essayez de modifier ou de réinitialiser vos filtres.
                                </p>
                                <button
                                    onClick={reinitialiser}
                                    className="btn-premium text-white font-bold py-2 px-6 rounded-full"
                                >
                                    Réinitialiser les filtres
                                </button>
                            </div>
                        )}

                        {/* ----------PAGINATION----------- */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-10">
                                <button
                                    onClick={() => setPage(pageActive - 1)}
                                    disabled={pageActive === 1}
                                    className="px-3 py-2 rounded border border-border-standard bg-white text-text-secondary hover:border-brand-red hover:text-brand-red disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Précédent
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => setPage(num)}
                                        className={`w-10 h-10 rounded transition-colors ${num === pageActive
                                            ? "btn-premium text-white"
                                            : "bg-white border border-border-standard text-text-secondary hover:border-brand-red hover:text-brand-red"
                                            }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setPage(pageActive + 1)}
                                    disabled={pageActive === totalPages}
                                    className="px-3 py-2 rounded border border-border-standard bg-white text-text-secondary hover:border-brand-red hover:text-brand-red disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Suivant
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ----------MODALE DE DÉTAIL----------- */}
            {vehiculeActif && (
                <VehicleModal vehicule={vehiculeActif} onClose={() => setVehiculeActif(null)} />
            )}
        </>
    )
}




