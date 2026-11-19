import type { VehiculeFlotte } from "@/types/admin";

const inputCls =
  "w-full rounded-lg border border-border-standard bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red transition-colors";

export type BrouillonFlotte = Omit<VehiculeFlotte, "id">;

interface Props {
  brouillon: BrouillonFlotte;
  enEdition: boolean;
  onChange: (b: BrouillonFlotte) => void;
  onValider: (e: React.FormEvent) => void;
  onFermer: () => void;
}

/** Modale d'ajout / d'édition d'un véhicule dans la flotte de location. */
export default function ModaleFlotte({ brouillon, enEdition, onChange, onValider, onFermer }: Props) {
  return (
    <div
      className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4"
      onClick={onFermer}
      role="dialog"
      aria-modal="true"
      aria-label={enEdition ? "Modifier le véhicule" : "Ajouter à la flotte"}
    >
      <form
        onSubmit={onValider}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <h2 className="font-bold text-text-primary">
            {enEdition ? "Modifier le véhicule" : "Ajouter à la flotte"}
          </h2>
          <button
            type="button"
            onClick={onFermer}
            className="w-9 h-9 rounded-full hover:bg-brand-light flex items-center justify-center text-text-primary"
            aria-label="Fermer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-medium text-text-primary mb-1">Marque *</span>
            <input
              required
              className={inputCls}
              value={brouillon.marque}
              onChange={(e) => onChange({ ...brouillon, marque: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-text-primary mb-1">Modèle *</span>
            <input
              required
              className={inputCls}
              value={brouillon.model}
              onChange={(e) => onChange({ ...brouillon, model: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-text-primary mb-1">Tarif journalier *</span>
            <input
              required
              className={inputCls}
              value={brouillon.tarifJour}
              onChange={(e) => onChange({ ...brouillon, tarifJour: e.target.value })}
              placeholder="150 €/jour"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-text-primary mb-1">Caution</span>
            <input
              className={inputCls}
              value={brouillon.caution}
              onChange={(e) => onChange({ ...brouillon, caution: e.target.value })}
              placeholder="500 000 FCFA"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-text-primary mb-1">Année</span>
            <input
              type="number"
              className={inputCls}
              value={brouillon.annee}
              onChange={(e) => onChange({ ...brouillon, annee: Number(e.target.value) })}
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-text-primary mb-1">Type</span>
            <input
              className={inputCls}
              value={brouillon.type}
              onChange={(e) => onChange({ ...brouillon, type: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-text-primary mb-1">Places</span>
            <input
              className={inputCls}
              value={brouillon.places}
              onChange={(e) => onChange({ ...brouillon, places: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-text-primary mb-1">Localisation</span>
            <input
              className={inputCls}
              value={brouillon.localisation}
              onChange={(e) => onChange({ ...brouillon, localisation: e.target.value })}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="block text-sm font-medium text-text-primary mb-1">URL de l'image</span>
            <input
              type="url"
              className={inputCls}
              value={brouillon.image}
              onChange={(e) => onChange({ ...brouillon, image: e.target.value })}
              placeholder="https://…"
            />
          </label>
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
            {enEdition ? "Enregistrer" : "Ajouter"}
          </button>
        </div>
      </form>
    </div>
  );
}
