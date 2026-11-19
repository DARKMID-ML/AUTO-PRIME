import type { Location, StatutLocation } from "@/types/admin";
import { formatDate } from "@/utils/format";
import { couleurLocation, labelLocation, STATUTS_LOCATION } from "./locationShared";

interface Props {
  locations: Location[];
  onNouvelle: () => void;
  onProlonger: (l: Location) => void;
  onChangerStatut: (id: number, statut: StatutLocation) => void;
  onSupprimer: (l: Location) => void;
}

/** Onglet "Locations en cours" : le suivi des locations clients. */
export default function LocationsTab({ locations, onNouvelle, onProlonger, onChangerStatut, onSupprimer }: Props) {
  const enCours = locations.filter((l) => l.statut === "en_cours" || l.statut === "prolongee").length;
  const aRendre = locations.filter((l) => l.statut === "a_rendre").length;

  return (
    <div className="space-y-6">
      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-card p-4">
          <p className="text-2xl font-extrabold text-brand-blue">{enCours}</p>
          <p className="text-sm text-text-secondary">En cours</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-4">
          <p className="text-2xl font-extrabold text-orange-500">{aRendre}</p>
          <p className="text-sm text-text-secondary">À rendre</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-4">
          <p className="text-2xl font-extrabold text-text-primary">{locations.length}</p>
          <p className="text-sm text-text-secondary">Total historique</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNouvelle}
          className="inline-flex items-center gap-2 bg-brand-red text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-red-dark transition-colors"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Nouvelle location
        </button>
      </div>

      {locations.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center">
          <span className="material-symbols-outlined text-text-muted" style={{ fontSize: "48px" }}>
            event_busy
          </span>
          <p className="mt-3 font-semibold text-text-primary">Aucune location enregistrée</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {locations.map((l) => (
            <li key={l.id} className="bg-white rounded-2xl shadow-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-text-primary">{l.client}</h2>
                  <a
                    href={`tel:${l.telephone}`}
                    className="inline-flex items-center gap-1.5 text-sm text-brand-blue hover:underline"
                  >
                    <span className="material-symbols-outlined text-base" aria-hidden="true">
                      call
                    </span>
                    {l.telephone}
                  </a>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full ${couleurLocation(l.statut)}`}>
                  {labelLocation(l.statut)}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <p className="text-text-secondary">
                  <span className="block text-xs text-text-muted uppercase">Véhicule</span>
                  {l.vehicule}
                </p>
                <p className="text-text-secondary">
                  <span className="block text-xs text-text-muted uppercase">Période</span>
                  {l.dateDebut} → {l.dateFin}
                </p>
                <p className="text-text-secondary">
                  <span className="block text-xs text-text-muted uppercase">Durée / Montant</span>
                  {l.jours} jour(s) ·{" "}
                  <span className="font-semibold text-text-primary">{l.montant}</span>
                </p>
              </div>

              <p className="mt-2 text-xs text-text-muted">Créée le {formatDate(l.createdAt)}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {l.statut !== "terminee" && (
                  <button
                    type="button"
                    onClick={() => onProlonger(l)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border-standard text-text-secondary hover:bg-brand-light"
                  >
                    <span className="material-symbols-outlined text-sm">update</span>
                    Prolonger 3 jours
                  </button>
                )}
                {STATUTS_LOCATION.filter((s) => s.valeur !== l.statut).map((s) => (
                  <button
                    key={s.valeur}
                    type="button"
                    onClick={() => onChangerStatut(l.id, s.valeur)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border-standard text-text-secondary hover:bg-brand-light"
                  >
                    {s.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => onSupprimer(l)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-red border border-brand-red/40 hover:bg-brand-red/10"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
