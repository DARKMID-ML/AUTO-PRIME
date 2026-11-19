import type { StatutFlotte, VehiculeFlotte } from "@/types/admin";
import { couleurFlotte, labelFlotte, STATUTS_FLOTTE } from "./locationShared";

interface Props {
  flotte: VehiculeFlotte[];
  onAjouter: () => void;
  onModifier: (v: VehiculeFlotte) => void;
  onSupprimer: (v: VehiculeFlotte) => void;
  onChangerStatut: (id: number, statut: StatutFlotte) => void;
}

/** Onglet "Flotte" : les véhicules louables, avec tarif, caution et disponibilité. */
export default function FlotteTab({ flotte, onAjouter, onModifier, onSupprimer, onChangerStatut }: Props) {
  const disponibles = flotte.filter((v) => v.statut === "disponible").length;
  const loues = flotte.filter((v) => v.statut === "loue").length;

  return (
    <div className="space-y-6">
      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-card p-4">
          <p className="text-2xl font-extrabold text-text-primary">{flotte.length}</p>
          <p className="text-sm text-text-secondary">Véhicules en flotte</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-4">
          <p className="text-2xl font-extrabold text-green-600">{disponibles}</p>
          <p className="text-sm text-text-secondary">Disponibles</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-4">
          <p className="text-2xl font-extrabold text-brand-blue">{loues}</p>
          <p className="text-sm text-text-secondary">Loués</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onAjouter}
          className="inline-flex items-center gap-2 bg-brand-red text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-red-dark transition-colors"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Ajouter à la flotte
        </button>
      </div>

      {flotte.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center">
          <span className="material-symbols-outlined text-text-muted" style={{ fontSize: "48px" }}>
            no_transfer
          </span>
          <p className="mt-3 font-semibold text-text-primary">Aucun véhicule dans la flotte</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {flotte.map((v) => (
            <article key={v.id} className="bg-white rounded-2xl shadow-card overflow-hidden flex flex-col">
              <div className="relative">
                {v.image ? (
                  <img
                    src={v.image}
                    alt={`${v.marque} ${v.model}`}
                    className="w-full h-32 object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-32 bg-brand-surface flex items-center justify-center">
                    <span className="material-symbols-outlined text-text-muted" style={{ fontSize: "40px" }}>
                      directions_car
                    </span>
                  </div>
                )}
                <span
                  className={`absolute top-3 right-3 text-white text-xs px-2.5 py-1 rounded-full ${couleurFlotte(
                    v.statut
                  )}`}
                >
                  {labelFlotte(v.statut)}
                </span>
              </div>

              <div className="p-4 flex-1 space-y-3">
                <div>
                  <h2 className="font-bold text-text-primary">
                    {v.marque} {v.model}
                  </h2>
                  <p className="text-xs text-text-muted">
                    {v.annee} · {v.type} · {v.places}
                  </p>
                </div>

                <p className="text-xl font-extrabold text-brand-red">{v.tarifJour}</p>

                <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary">
                  <p>
                    <span className="block text-text-muted uppercase">Caution</span>
                    {v.caution || "—"}
                  </p>
                  <p>
                    <span className="block text-text-muted uppercase">Transmission</span>
                    {v.transmission}
                  </p>
                  <p>
                    <span className="block text-text-muted uppercase">Climatisation</span>
                    {v.climatisation}
                  </p>
                  <p>
                    <span className="block text-text-muted uppercase">Lieu</span>
                    {v.localisation}
                  </p>
                </div>
              </div>

              <div className="px-4 py-3 border-t border-border-light flex items-center justify-between">
                <select
                  value={v.statut}
                  onChange={(e) => onChangerStatut(v.id, e.target.value as StatutFlotte)}
                  className="text-xs rounded-lg border border-border-standard px-2 py-1 bg-white"
                  aria-label={`Statut de ${v.marque} ${v.model}`}
                >
                  {STATUTS_FLOTTE.map((s) => (
                    <option key={s.valeur} value={s.valeur}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onModifier(v)}
                    className="w-9 h-9 rounded-lg text-brand-blue hover:bg-brand-blue/10 flex items-center justify-center"
                    aria-label={`Modifier ${v.marque} ${v.model}`}
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSupprimer(v)}
                    className="w-9 h-9 rounded-lg text-brand-red hover:bg-brand-red/10 flex items-center justify-center"
                    aria-label={`Retirer ${v.marque} ${v.model}`}
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
