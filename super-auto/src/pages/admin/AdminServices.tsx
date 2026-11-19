import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { services } from "@/data/services";
import { enregistrerParametreSite } from "@/config/parametresSite";
import type { ServiceItem } from "@/types/admin";

const CLE_SERVICES = "admin:services";

// Couleurs proposées (classes Tailwind fixes — jamais de classes dynamiques !)
const COULEURS = [
  { valeur: "bg-brand-red", label: "Rouge" },
  { valeur: "bg-brand-blue", label: "Bleu" },
  { valeur: "bg-brand-blue-dark", label: "Bleu foncé" },
  { valeur: "bg-green-600", label: "Vert" },
];

// Icônes Material Symbols proposées pour les services
const ICONES = [
  "directions_car",
  "car_rental",
  "local_shipping",
  "build",
  "settings",
  "manage_search",
  "handyman",
  "engineering",
];

/** Conversion des données statiques en ServiceItem (avec ordre). */
function versServiceItem(s: (typeof services)[number]): ServiceItem {
  return { ...s, ordre: s.id };
}

const serviceVide: Omit<ServiceItem, "id"> = {
  titre: "",
  description: "",
  icone: "directions_car",
  couleur: "bg-brand-red",
  lien: "",
  hasLink: false,
  ordre: 1,
};

export default function AdminServices() {
  const [liste, setListe] = useLocalStorage<ServiceItem[]>(
    CLE_SERVICES,
    services.map(versServiceItem)
  );
  /** Met à jour la liste et la persiste côté serveur. */
  function majListe(suivante: ServiceItem[]) {
    setListe(suivante);
    void enregistrerParametreSite("services", suivante.length > 0 ? suivante : null);
  }

  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [enEdition, setEnEdition] = useState<ServiceItem | null>(null);
  const [brouillon, setBrouillon] = useState<Omit<ServiceItem, "id">>(serviceVide);

  function ouvrirCreation() {
    setEnEdition(null);
    setBrouillon({ ...serviceVide, ordre: liste.length + 1 });
    setFormulaireOuvert(true);
  }

  function ouvrirEdition(s: ServiceItem) {
    setEnEdition(s);
    const { id, ...sansId } = s;
    void id;
    setBrouillon(sansId);
    setFormulaireOuvert(true);
  }

  function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    if (enEdition) {
      majListe(liste.map((s) => (s.id === enEdition.id ? { ...brouillon, id: enEdition.id } : s)));
    } else {
      const nouvelId = liste.reduce((max, s) => Math.max(max, s.id), 0) + 1;
      majListe([...liste, { ...brouillon, id: nouvelId }]);
    }
    setFormulaireOuvert(false);
  }

  function supprimer(s: ServiceItem) {
    if (window.confirm(`Supprimer le service « ${s.titre} » ?`)) {
      majListe(liste.filter((x) => x.id !== s.id));
    }
  }

  function deplacer(index: number, delta: number) {
    const cible = index + delta;
    if (cible < 0 || cible >= liste.length) return;
    const copie = [...liste];
    [copie[index], copie[cible]] = [copie[cible], copie[index]];
    // Recalculer l'ordre pour refléter la nouvelle position
    majListe(copie.map((s, i) => ({ ...s, ordre: i + 1 })));
  }

  // Tri par ordre d'affichage
  const triees = [...liste].sort((a, b) => a.ordre - b.ordre);

  const inputCls =
    "w-full rounded-lg border border-border-standard bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red transition-colors";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary">Services</h1>
          <p className="text-text-secondary mt-1">
            Les 6 services affichés sur la page Services du site.
          </p>
        </div>
        <button
          type="button"
          onClick={ouvrirCreation}
          className="inline-flex items-center gap-2 bg-brand-red text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-red-dark transition-colors"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Ajouter un service
        </button>
      </div>

      {/* Liste */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {triees.map((s, index) => (
          <article key={s.id} className="bg-white rounded-2xl shadow-card p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span
                className={`w-11 h-11 rounded-xl ${s.couleur} text-white flex items-center justify-center shrink-0`}
                aria-hidden="true"
              >
                <span className="material-symbols-outlined text-xl">{s.icone}</span>
              </span>
              <div className="min-w-0">
                <h2 className="font-bold text-text-primary truncate">{s.titre}</h2>
                <p className="text-xs text-text-muted">Position {s.ordre}</p>
              </div>
            </div>

            <p className="text-sm text-text-secondary line-clamp-3 flex-1">{s.description}</p>

            <p className="text-xs text-text-muted inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-sm" aria-hidden="true">
                {s.hasLink ? "link" : "link_off"}
              </span>
              {s.hasLink && s.lien ? s.lien : "Sans lien"}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-border-light">
              {/* Réorganisation */}
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => deplacer(index, -1)}
                  disabled={index === 0}
                  className="w-8 h-8 rounded-lg text-text-secondary hover:bg-brand-light disabled:opacity-30 flex items-center justify-center"
                  aria-label="Monter"
                >
                  <span className="material-symbols-outlined text-lg">arrow_upward</span>
                </button>
                <button
                  type="button"
                  onClick={() => deplacer(index, 1)}
                  disabled={index === triees.length - 1}
                  className="w-8 h-8 rounded-lg text-text-secondary hover:bg-brand-light disabled:opacity-30 flex items-center justify-center"
                  aria-label="Descendre"
                >
                  <span className="material-symbols-outlined text-lg">arrow_downward</span>
                </button>
              </div>

              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => ouvrirEdition(s)}
                  className="w-9 h-9 rounded-lg text-brand-blue hover:bg-brand-blue/10 flex items-center justify-center"
                  aria-label={`Modifier ${s.titre}`}
                >
                  <span className="material-symbols-outlined text-lg">edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => supprimer(s)}
                  className="w-9 h-9 rounded-lg text-brand-red hover:bg-brand-red/10 flex items-center justify-center"
                  aria-label={`Supprimer ${s.titre}`}
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Modal formulaire */}
      {formulaireOuvert && (
        <div
          className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4"
          onClick={() => setFormulaireOuvert(false)}
          role="dialog"
          aria-modal="true"
          aria-label={enEdition ? "Modifier le service" : "Ajouter un service"}
        >
          <form
            onSubmit={enregistrer}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
              <h2 className="font-bold text-text-primary">
                {enEdition ? "Modifier le service" : "Ajouter un service"}
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

            <div className="p-6 space-y-4">
              <label className="block">
                <span className="block text-sm font-medium text-text-primary mb-1">Titre *</span>
                <input
                  required
                  className={inputCls}
                  value={brouillon.titre}
                  onChange={(e) => setBrouillon({ ...brouillon, titre: e.target.value })}
                  placeholder="Vente de Véhicules"
                />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-text-primary mb-1">
                  Description *
                </span>
                <textarea
                  required
                  rows={3}
                  className={inputCls}
                  value={brouillon.description}
                  onChange={(e) => setBrouillon({ ...brouillon, description: e.target.value })}
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-sm font-medium text-text-primary mb-1">Icône</span>
                  <select
                    className={inputCls}
                    value={brouillon.icone}
                    onChange={(e) => setBrouillon({ ...brouillon, icone: e.target.value })}
                  >
                    {ICONES.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="block text-sm font-medium text-text-primary mb-1">Couleur</span>
                  <select
                    className={inputCls}
                    value={brouillon.couleur}
                    onChange={(e) => setBrouillon({ ...brouillon, couleur: e.target.value })}
                  >
                    {COULEURS.map((c) => (
                      <option key={c.valeur} value={c.valeur}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={brouillon.hasLink}
                  onChange={(e) =>
                    setBrouillon({ ...brouillon, hasLink: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#C41E3A]"
                />
                <span className="text-sm font-medium text-text-primary">
                  Afficher un lien « En savoir plus »
                </span>
              </label>

              {brouillon.hasLink && (
                <label className="block">
                  <span className="block text-sm font-medium text-text-primary mb-1">
                    Lien (URL ou chemin interne)
                  </span>
                  <input
                    className={inputCls}
                    value={brouillon.lien}
                    onChange={(e) => setBrouillon({ ...brouillon, lien: e.target.value })}
                    placeholder="/vente"
                  />
                </label>
              )}

              <label className="block">
                <span className="block text-sm font-medium text-text-primary mb-1">
                  Position d'affichage
                </span>
                <input
                  type="number"
                  min={1}
                  className={inputCls}
                  value={brouillon.ordre}
                  onChange={(e) => setBrouillon({ ...brouillon, ordre: Number(e.target.value) })}
                />
              </label>

              {/* Aperçu de l'icône */}
              <div className="flex items-center gap-3 bg-brand-light rounded-xl p-3">
                <span
                  className={`w-10 h-10 rounded-xl ${brouillon.couleur} text-white flex items-center justify-center`}
                  aria-hidden="true"
                >
                  <span className="material-symbols-outlined">{brouillon.icone}</span>
                </span>
                <span className="text-sm font-semibold text-text-primary">
                  {brouillon.titre || "Aperçu du service"}
                </span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border-light flex justify-end gap-3">
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
