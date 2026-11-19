import { useMemo, useState } from "react"
import { useVehicules } from "@/hooks/useVehicules"
import { type Vehicule } from "../types/vehicule"
import PageHeader from "@/components/PageHeader"
import VehicleCard from "../components/VehicleCard"
import VehicleModal from "../components/VehicleModal"

// Nombre de véhicules affichés par page
const PAR_PAGE = 6

// Libellés des types de véhicules (avec la valeur correspondante dans les données)
const TYPES_VEHICULES: { valeur: string; libelle: string }[] = [
    { valeur: "Berline", libelle: "Berline" },
    { valeur: "SUV", libelle: "SUV / 4x4" },
    { valeur: "Pick-up", libelle: "Pick-up" },
    { valeur: "Minibus", libelle: "Minibus" },
]

// Tranches de places
const TRANCHES_PLACES = [
    { valeur: "2-3", libelle: "2-3 places" },
    { valeur: "4-5", libelle: "4-5 places" },
    { valeur: "7+", libelle: "7+ places" },
]

// Options disponibles
const OPTIONS = [
    { valeur: "clim", libelle: "Climatisation garantie" },
    { valeur: "auto", libelle: "Boîte Automatique" },
]

// État des filtres de location
interface FiltresLocation {
    types: string[]
    places: string
    options: string[]
}

const FILTRES_VIDES: FiltresLocation = { types: [], places: "", options: [] }

// Vrai si le nombre de places du véhicule correspond à la tranche choisie
const correspondPlaces = (places: string, tranche: string) => {
    if (!tranche) return true
    const nb = parseInt(places, 10)
    if (tranche === "2-3") return nb >= 2 && nb <= 3
    if (tranche === "4-5") return nb >= 4 && nb <= 5
    return nb >= 7
}

export default function Location() {
    // --- DONNÉES : uniquement les véhicules en location (API + repli local) ---
    const { vehicules } = useVehicules()
    const vehiculesLocation = useMemo(
        () => vehicules.filter((v) => v.service === "Location"),
        [vehicules]
    )

    // --- ÉTATS : brouillon (modifié par les cases) + filtres appliqués ---
    const [filtres, setFiltres] = useState<FiltresLocation>(FILTRES_VIDES)
    const [brouillon, setBrouillon] = useState<FiltresLocation>(FILTRES_VIDES)
    const [tri, setTri] = useState("pertinence")
    const [page, setPage] = useState(1)
    const [vehiculeActif, setVehiculeActif] = useState<Vehicule | null>(null)

    // Compteur par type de véhicule
    const compteType = (type: string) =>
        vehiculesLocation.filter((v) => v.type === type).length

    // Ajouter / retirer une valeur d'une liste (brouillon)
    const basculerBrouillon = (cle: "types" | "options", valeur: string) => {
        const liste = brouillon[cle]
        const nouvelle = liste.includes(valeur)
            ? liste.filter((v) => v !== valeur)
            : [...liste, valeur]
        setBrouillon({ ...brouillon, [cle]: nouvelle })
    }

    // Appliquer les filtres du brouillon
    const appliquer = () => {
        setFiltres(brouillon)
        setPage(1)
    }

    // Réinitialiser brouillon + filtres appliqués
    const reinitialiser = () => {
        setBrouillon(FILTRES_VIDES)
        setFiltres(FILTRES_VIDES)
        setPage(1)
    }

    // --- FILTRAGE + TRI ---
    const resultats = useMemo(() => {
        const filtresData = vehiculesLocation.filter((v) => {
            if (filtres.types.length > 0 && !filtres.types.includes(v.type)) return false
            if (!correspondPlaces(v.places, filtres.places)) return false
            if (filtres.options.includes("clim") && v.climatisation !== "Oui") return false
            if (filtres.options.includes("auto") && v.transmission !== "Automatique") return false
            return true
        })

        const tries = [...filtresData]
        if (tri === "marque") {
            tries.sort((a, b) => a.marque.localeCompare(b.marque, "fr"))
        } else if (tri === "prix") {
            tries.sort(
                (a, b) =>
                    parseFloat(a.prix.replace(",", ".")) - parseFloat(b.prix.replace(",", "."))
            )
        }
        return tries
    }, [vehiculesLocation, filtres, tri])

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
                page="location"
                meta={`${resultats.length} véhicule${resultats.length > 1 ? "s" : ""} en location`}
            />

            {/* ============================== */}
            {/* BARRE D'OUTILS : TRI            */}
            {/* ============================== */}
            <section className="bg-white border-b border-border-standard py-4 px-4">
                <div className="max-w-7xl mx-auto flex items-center justify-end gap-2">
                    <label htmlFor="tri-location" className="text-sm text-text-secondary">Trier par :</label>
                    <select
                        id="tri-location"
                        value={tri}
                        onChange={(e) => {
                            setTri(e.target.value)
                            setPage(1)
                        }}
                        className="border border-border-standard rounded p-2 text-sm bg-white text-text-primary focus:ring-2 focus:ring-brand-red focus:outline-none"
                    >
                        <option value="pertinence">Pertinence</option>
                        <option value="marque">Marque A-Z</option>
                        <option value="prix">Prix croissant</option>
                    </select>
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
                        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-5">
                            <span className="material-symbols-outlined text-brand-red animate-bob">filter_alt</span>
                            Filtres
                        </h2>

                        {/* Filtre Type de véhicule (avec compteur) */}
                        <div className="mb-5">
                            <p className="text-sm font-semibold text-text-primary mb-2">Type de véhicule</p>
                            {TYPES_VEHICULES.map((type) => (
                                <label
                                    key={type.valeur}
                                    className="flex items-center justify-between text-sm text-text-secondary mb-2 cursor-pointer"
                                >
                                    <span className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={brouillon.types.includes(type.valeur)}
                                            onChange={() => basculerBrouillon("types", type.valeur)}
                                            className="accent-brand-red"
                                        />
                                        {type.libelle}
                                    </span>
                                    <span className="text-text-muted">({compteType(type.valeur)})</span>
                                </label>
                            ))}
                        </div>

                        {/* Filtre Nombre de places (sélection unique) */}
                        <div className="mb-5">
                            <p className="text-sm font-semibold text-text-primary mb-2">Nombre de places</p>
                            <div className="flex flex-wrap gap-2">
                                {TRANCHES_PLACES.map((tranche) => (
                                    <button
                                        key={tranche.valeur}
                                        onClick={() =>
                                            setBrouillon({
                                                ...brouillon,
                                                places: brouillon.places === tranche.valeur ? "" : tranche.valeur,
                                            })
                                        }
                                        className={`text-sm px-3 py-1.5 rounded border transition-colors ${brouillon.places === tranche.valeur
                                            ? "bg-brand-red text-white border-brand-red"
                                            : "bg-white text-text-secondary border-border-standard hover:border-brand-red hover:text-brand-red"
                                            }`}
                                    >
                                        {tranche.libelle}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Filtre Options */}
                        <div className="mb-5">
                            <p className="text-sm font-semibold text-text-primary mb-2">Options</p>
                            {OPTIONS.map((option) => (
                                <label
                                    key={option.valeur}
                                    className="flex items-center gap-2 text-sm text-text-secondary mb-2 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={brouillon.options.includes(option.valeur)}
                                        onChange={() => basculerBrouillon("options", option.valeur)}
                                        className="accent-brand-red"
                                    />
                                    {option.libelle}
                                </label>
                            ))}
                        </div>

                        {/* Actions des filtres */}
                        <button
                            onClick={appliquer}
                            className="btn-premium w-full text-white font-bold py-2.5 rounded-full mb-2"
                        >
                            Appliquer les filtres
                        </button>
                        <button
                            onClick={reinitialiser}
                            className="w-full border border-border-standard text-text-secondary hover:text-brand-red hover:border-brand-red font-medium py-2 rounded transition-colors"
                        >
                            Réinitialiser
                        </button>
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




