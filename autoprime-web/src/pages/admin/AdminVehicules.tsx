import { useMemo, useState } from "react";
import { useAdminVehicules } from "@/hooks/useAdminVehicules";
import type { Vehicule } from "@/types/vehicule";

// Valeurs possibles (alignées sur les données du front)
const STATUTS = ["Disponible", "Réservé", "Vendu", "Nouveau"];
const SERVICES = ["Vente", "Location"];
const CARBURANTS = ["Essence", "Diesel", "Hybride", "Électrique"];

/** Véhicule vide pour le formulaire de création. */
const vehiculeVide: Omit<Vehicule, "id"> = {
  marque: "",
  model: "",
  annee: new Date().getFullYear(),
  type: "Berline",
  prix: "",
  image: "",
  description: "",
  statut: "Disponible",
  service: "Vente",
  km: "",
  consomation: "",
  transmission: "Automatique",
  places: "5 places",
  climatisation: "Oui",
  atouts: "",
  peinture: "",
  interieur: "",
  category: "",
  carburant: "Essence",
  localisation: "Bamako",
  photos: [],
};

/** Badge coloré selon le statut (même logique que VehicleCard). */
function BadgeStatut({ statut }: { statut: string }) {
  const couleur =
    statut === "Disponible"
      ? "bg-green-500"
      : statut === "Réservé"
        ? "bg-orange-500"
        : statut === "Vendu"
          ? "bg-red-500"
          : "bg-brand-red";
  return (
    <span className={`text-white text-xs px-2.5 py-1 rounded-full ${couleur}`}>{statut}</span>
  );
}

/** Champ de formulaire générique. */
function Champ({
  label,
  children,
  large = false,
}: {
  label: string;
  children: React.ReactNode;
  large?: boolean;
}) {
  return (
    <label className={`block ${large ? "sm:col-span-2" : ""}`}>
      <span className="block text-sm font-medium text-text-primary mb-1">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-border-standard bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red transition-colors";

export default function AdminVehicules() {
  const { vehicules, enLigne, creer, modifier, supprimer } = useAdminVehicules();
  const [recherche, setRecherche] = useState("");
  const [filtreService, setFiltreService] = useState("");
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [enEdition, setEnEdition] = useState<Vehicule | null>(null);
  const [brouillon, setBrouillon] = useState<Omit<Vehicule, "id">>(vehiculeVide);

  // Liste filtrée
  const affichees = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return vehicules.filter((v) => {
      const correspondRecherche =
        q === "" ||
        `${v.marque} ${v.model}`.toLowerCase().includes(q) ||
        v.localisation.toLowerCase().includes(q);
      const correspondService = filtreService === "" || v.service === filtreService;
      return correspondRecherche && correspondService;
    });
  }, [vehicules, recherche, filtreService]);

  // Ouverture du formulaire (création ou édition)
  function ouvrirCreation() {
    setEnEdition(null);
    setBrouillon(vehiculeVide);
    setFormulaireOuvert(true);
  }

  function ouvrirEdition(v: Vehicule) {
    setEnEdition(v);
    const { id, ...sansId } = v;
    void id;
    setBrouillon(sansId);
    setFormulaireOuvert(true);
  }

  // Enregistrement (création ou remplacement de l'existant)
  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setFormulaireOuvert(false);
    if (enEdition) {
      await modifier(enEdition.id, brouillon);
    } else {
      await creer(brouillon);
    }
  }

  async function supprimerVehicule(v: Vehicule) {
    if (window.confirm(`Supprimer ${v.marque} ${v.model} ? Cette action est définitive.`)) {
      await supprimer(v.id);
    }
  }

  return (
    <div className="space-y-6">
      {/* Titre + action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary">Véhicules</h1>
          <p className="text-text-secondary mt-1 flex items-center gap-2">
            {affichees.length} véhicule(s) affiché(s)
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                enLigne ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
              }`}
              title={
                enLigne
                  ? "Les modifications sont enregistrées sur le serveur"
                  : "Serveur éteint — les modifications restent locales"
              }
            >
              <span className={`w-1.5 h-1.5 rounded-full ${enLigne ? "bg-green-600" : "bg-orange-600"}`} aria-hidden="true" />
              {enLigne ? "Serveur" : "Local"}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={ouvrirCreation}
          className="inline-flex items-center gap-2 bg-brand-red text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-red-dark transition-colors"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Ajouter un véhicule
        </button>
      </div>

      {/* Barre de filtres */}
      <div className="bg-white rounded-2xl shadow-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            search
          </span>
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher par marque, modèle ou ville…"
            className={`${inputCls} pl-10`}
            aria-label="Rechercher un véhicule"
          />
        </div>
        <select
          value={filtreService}
          onChange={(e) => setFiltreService(e.target.value)}
          className={`${inputCls} sm:w-48`}
          aria-label="Filtrer par service"
        >
          <option value="">Tous les services</option>
          {SERVICES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Tableau (desktop) + cartes (mobile) */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {/* Desktop */}
        <table className="hidden md:table w-full text-sm">
          <thead className="bg-brand-surface text-text-secondary text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Véhicule</th>
              <th className="px-4 py-3 font-semibold">Année</th>
              <th className="px-4 py-3 font-semibold">Service</th>
              <th className="px-4 py-3 font-semibold">Prix</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {affichees.map((v) => (
              <tr key={v.id} className="hover:bg-brand-light/60 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={v.image}
                      alt={`${v.marque} ${v.model}`}
                      className="w-14 h-10 object-cover rounded-lg border border-border-light"
                      loading="lazy"
                    />
                    <div>
                      <p className="font-semibold text-text-primary">
                        {v.marque} {v.model}
                      </p>
                      <p className="text-xs text-text-muted">{v.localisation}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-secondary">{v.annee}</td>
                <td className="px-4 py-3 text-text-secondary">{v.service}</td>
                <td className="px-4 py-3 font-semibold text-text-primary">{v.prix}</td>
                <td className="px-4 py-3">
                  <BadgeStatut statut={v.statut} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => ouvrirEdition(v)}
                      className="w-9 h-9 rounded-lg text-text-secondary hover:bg-brand-blue/10 hover:text-brand-blue flex items-center justify-center"
                      aria-label={`Modifier ${v.marque} ${v.model}`}
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => supprimerVehicule(v)}
                      className="w-9 h-9 rounded-lg text-text-secondary hover:bg-brand-red/10 hover:text-brand-red flex items-center justify-center"
                      aria-label={`Supprimer ${v.marque} ${v.model}`}
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile */}
        <ul className="md:hidden divide-y divide-border-light">
          {affichees.map((v) => (
            <li key={v.id} className="p-4 flex items-center gap-3">
              <img
                src={v.image}
                alt={`${v.marque} ${v.model}`}
                className="w-16 h-12 object-cover rounded-lg border border-border-light"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-text-primary truncate">
                  {v.marque} {v.model}
                </p>
                <p className="text-xs text-text-muted">
                  {v.annee} · {v.prix}
                </p>
                <div className="mt-1">
                  <BadgeStatut statut={v.statut} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => ouvrirEdition(v)}
                  className="w-9 h-9 rounded-lg text-brand-blue hover:bg-brand-blue/10 flex items-center justify-center"
                  aria-label={`Modifier ${v.marque} ${v.model}`}
                >
                  <span className="material-symbols-outlined text-lg">edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => supprimerVehicule(v)}
                  className="w-9 h-9 rounded-lg text-brand-red hover:bg-brand-red/10 flex items-center justify-center"
                  aria-label={`Supprimer ${v.marque} ${v.model}`}
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* État vide */}
        {affichees.length === 0 && (
          <div className="p-10 text-center">
            <span className="material-symbols-outlined text-text-muted" style={{ fontSize: "48px" }}>
              search_off
            </span>
            <p className="mt-3 font-semibold text-text-primary">
              Aucun véhicule ne correspond à vos critères
            </p>
            <button
              type="button"
              onClick={() => {
                setRecherche("");
                setFiltreService("");
              }}
              className="mt-3 text-sm font-semibold text-brand-red hover:underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* ===== Modal formulaire (création / édition) ===== */}
      {formulaireOuvert && (
        <div
          className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4"
          onClick={() => setFormulaireOuvert(false)}
          role="dialog"
          aria-modal="true"
          aria-label={enEdition ? "Modifier le véhicule" : "Ajouter un véhicule"}
        >
          <form
            onSubmit={enregistrer}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-light sticky top-0 bg-white">
              <h2 className="font-bold text-text-primary">
                {enEdition ? "Modifier le véhicule" : "Ajouter un véhicule"}
              </h2>
              <button
                type="button"
                onClick={() => setFormulaireOuvert(false)}
                className="w-9 h-9 rounded-full hover:bg-brand-light flex items-center justify-center text-text-primary"
                aria-label="Fermer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Champ label="Marque *">
                <input
                  required
                  className={inputCls}
                  value={brouillon.marque}
                  onChange={(e) => setBrouillon({ ...brouillon, marque: e.target.value })}
                  placeholder="Toyota"
                />
              </Champ>
              <Champ label="Modèle *">
                <input
                  required
                  className={inputCls}
                  value={brouillon.model}
                  onChange={(e) => setBrouillon({ ...brouillon, model: e.target.value })}
                  placeholder="Land Cruiser"
                />
              </Champ>
              <Champ label="Année *">
                <input
                  required
                  type="number"
                  min={1980}
                  max={2100}
                  className={inputCls}
                  value={brouillon.annee}
                  onChange={(e) => setBrouillon({ ...brouillon, annee: Number(e.target.value) })}
                />
              </Champ>
              <Champ label="Prix *">
                <input
                  required
                  className={inputCls}
                  value={brouillon.prix}
                  onChange={(e) => setBrouillon({ ...brouillon, prix: e.target.value })}
                  placeholder="65 000 €"
                />
              </Champ>
              <Champ label="Service">
                <select
                  className={inputCls}
                  value={brouillon.service}
                  onChange={(e) => setBrouillon({ ...brouillon, service: e.target.value })}
                >
                  {SERVICES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Champ>
              <Champ label="Statut">
                <select
                  className={inputCls}
                  value={brouillon.statut}
                  onChange={(e) => setBrouillon({ ...brouillon, statut: e.target.value })}
                >
                  {STATUTS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Champ>
              <Champ label="Type de véhicule">
                <input
                  className={inputCls}
                  value={brouillon.type}
                  onChange={(e) => setBrouillon({ ...brouillon, type: e.target.value })}
                  placeholder="SUV"
                />
              </Champ>
              <Champ label="Catégorie">
                <input
                  className={inputCls}
                  value={brouillon.category}
                  onChange={(e) => setBrouillon({ ...brouillon, category: e.target.value })}
                  placeholder="4x4"
                />
              </Champ>
              <Champ label="Carburant">
                <select
                  className={inputCls}
                  value={brouillon.carburant}
                  onChange={(e) => setBrouillon({ ...brouillon, carburant: e.target.value })}
                >
                  {CARBURANTS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Champ>
              <Champ label="Transmission">
                <select
                  className={inputCls}
                  value={brouillon.transmission}
                  onChange={(e) => setBrouillon({ ...brouillon, transmission: e.target.value })}
                >
                  <option>Automatique</option>
                  <option>Manuelle</option>
                </select>
              </Champ>
              <Champ label="Kilométrage">
                <input
                  className={inputCls}
                  value={brouillon.km}
                  onChange={(e) => setBrouillon({ ...brouillon, km: e.target.value })}
                  placeholder="15 000 km"
                />
              </Champ>
              <Champ label="Consommation">
                <input
                  className={inputCls}
                  value={brouillon.consomation}
                  onChange={(e) => setBrouillon({ ...brouillon, consomation: e.target.value })}
                  placeholder="12 L/100 km"
                />
              </Champ>
              <Champ label="Places">
                <input
                  className={inputCls}
                  value={brouillon.places}
                  onChange={(e) => setBrouillon({ ...brouillon, places: e.target.value })}
                  placeholder="7 places"
                />
              </Champ>
              <Champ label="Climatisation">
                <select
                  className={inputCls}
                  value={brouillon.climatisation}
                  onChange={(e) => setBrouillon({ ...brouillon, climatisation: e.target.value })}
                >
                  <option>Oui</option>
                  <option>Non</option>
                </select>
              </Champ>
              <Champ label="Localisation">
                <input
                  className={inputCls}
                  value={brouillon.localisation}
                  onChange={(e) => setBrouillon({ ...brouillon, localisation: e.target.value })}
                  placeholder="Bamako"
                />
              </Champ>
              <Champ label="Couleur extérieure">
                <input
                  className={inputCls}
                  value={brouillon.peinture}
                  onChange={(e) => setBrouillon({ ...brouillon, peinture: e.target.value })}
                  placeholder="Blanc perle"
                />
              </Champ>
              <Champ label="Couleur intérieure">
                <input
                  className={inputCls}
                  value={brouillon.interieur}
                  onChange={(e) => setBrouillon({ ...brouillon, interieur: e.target.value })}
                  placeholder="Cuir beige"
                />
              </Champ>
              <Champ label="URL de l'image" large>
                <input
                  type="url"
                  className={inputCls}
                  value={brouillon.image}
                  onChange={(e) => setBrouillon({ ...brouillon, image: e.target.value })}
                  placeholder="https://…"
                />
              </Champ>
              <Champ label="Galerie de photos (URLs séparées par des virgules)" large>
                <input
                  className={inputCls}
                  value={(brouillon.photos ?? []).join(", ")}
                  onChange={(e) =>
                    setBrouillon({
                      ...brouillon,
                      photos: e.target.value
                        .split(",")
                        .map((p) => p.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="/images/vehicules/vue-interieur.jpg, /images/vehicules/vue-arriere.jpg"
                />
              </Champ>
              <Champ label="Description" large>
                <textarea
                  rows={3}
                  className={inputCls}
                  value={brouillon.description}
                  onChange={(e) => setBrouillon({ ...brouillon, description: e.target.value })}
                />
              </Champ>
              <Champ label="Atouts (séparés par des virgules)" large>
                <input
                  className={inputCls}
                  value={brouillon.atouts}
                  onChange={(e) => setBrouillon({ ...brouillon, atouts: e.target.value })}
                  placeholder="4x4 permanent, Caméra 360°, Toit ouvrant"
                />
              </Champ>
            </div>

            <div className="px-6 py-4 border-t border-border-light flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                type="button"
                onClick={() => setFormulaireOuvert(false)}
                className="px-5 py-2.5 rounded-xl border border-border-standard font-semibold text-text-secondary hover:bg-brand-light transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-brand-red text-white font-semibold hover:bg-brand-red-dark transition-colors"
              >
                {enEdition ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
