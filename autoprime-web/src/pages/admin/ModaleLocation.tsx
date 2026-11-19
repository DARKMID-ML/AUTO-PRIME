import type { VehiculeFlotte } from "@/types/admin";
import { calculerJours } from "@/utils/format";

const inputCls =
  "w-full rounded-lg border border-border-standard bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red transition-colors";

export type BrouillonLocation = {
  client: string;
  telephone: string;
  vehicule: string;
  dateDebut: string;
  dateFin: string;
};

interface Props {
  brouillon: BrouillonLocation;
  flotte: VehiculeFlotte[];
  onChange: (b: BrouillonLocation) => void;
  onValider: (e: React.FormEvent) => void;
  onFermer: () => void;
}

/** Modale de création d'une nouvelle location. */
export default function ModaleLocation({ brouillon, flotte, onChange, onValider, onFermer }: Props) {
  const jours = brouillon.dateDebut && brouillon.dateFin
    ? calculerJours(brouillon.dateDebut, brouillon.dateFin)
    : 0;

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4"
      onClick={onFermer}
      role="dialog"
      aria-modal="true"
      aria-label="Nouvelle location"
    >
      <form
        onSubmit={onValider}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <h2 className="font-bold text-text-primary">Nouvelle location</h2>
          <button
            type="button"
            onClick={onFermer}
            className="w-9 h-9 rounded-full hover:bg-brand-light flex items-center justify-center text-text-primary"
            aria-label="Fermer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <label className="block">
            <span className="block text-sm font-medium text-text-primary mb-1">Client *</span>
            <input
              required
              className={inputCls}
              value={brouillon.client}
              onChange={(e) => onChange({ ...brouillon, client: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-text-primary mb-1">Téléphone *</span>
            <input
              required
              className={inputCls}
              value={brouillon.telephone}
              onChange={(e) => onChange({ ...brouillon, telephone: e.target.value })}
              placeholder="+223 70 00 00 00"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-text-primary mb-1">Véhicule *</span>
            <select
              required
              className={inputCls}
              value={brouillon.vehicule}
              onChange={(e) => onChange({ ...brouillon, vehicule: e.target.value })}
            >
              <option value="">Choisir un véhicule…</option>
              {flotte.map((v) => (
                <option key={v.id} value={`${v.marque} ${v.model}`}>
                  {v.marque} {v.model} — {v.tarifJour}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-sm font-medium text-text-primary mb-1">Début *</span>
              <input
                required
                type="date"
                className={inputCls}
                value={brouillon.dateDebut}
                onChange={(e) => onChange({ ...brouillon, dateDebut: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-text-primary mb-1">Fin *</span>
              <input
                required
                type="date"
                className={inputCls}
                value={brouillon.dateFin}
                onChange={(e) => onChange({ ...brouillon, dateFin: e.target.value })}
              />
            </label>
          </div>

          {jours > 0 && (
            <p className="bg-brand-light rounded-xl p-3 text-sm text-text-secondary">
              Durée calculée :{" "}
              <span className="font-semibold text-text-primary">{jours} jour(s)</span>
            </p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border-light flex justify-end gap-3">
          <button
            type="button"
            onClick={onFermer}
            className="px-5 py-2.5 rounded-xl border border-border-standard font-semibold text-text-secondary hover:bg-brand-light transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-brand-red text-white font-semibold hover:bg-brand-red-dark transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}
