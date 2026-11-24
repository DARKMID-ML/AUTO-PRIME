import { useState } from "react";
import type { Justificatif } from "@/types/demandes";
import { messageRefus, useDemandes } from "@/store/demandes";
import JustificatifsInput from "./JustificatifsInput";

interface Props {
  client: string;
  telephone: string;
  /** Véhicule déjà connu (lorsque le client signale une location précise). */
  vehicule?: string;
  onClose: () => void;
}

const inputCls =
  "w-full rounded-lg border border-border-standard bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red transition-colors";

/**
 * Déclaration d'un problème rencontré sur un véhicule loué.
 * Le client décrit le problème et joint les justificatifs de son choix.
 */
export default function SinistreModal({ client, telephone, vehicule, onClose }: Props) {
  const { ajouterSinistre } = useDemandes();

  const [vehiculeSaisi, setVehiculeSaisi] = useState(vehicule ?? "");
  const [immatriculation, setImmatriculation] = useState("");
  const [dateIncident, setDateIncident] = useState("");
  const [description, setDescription] = useState("");
  const [gravite, setGravite] = useState<"mineure" | "majeure">("mineure");
  const [justificatifs, setJustificatifs] = useState<Justificatif[]>([]);
  const [erreur, setErreur] = useState("");
  const [envoye, setEnvoye] = useState(false);

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");

    if (!description.trim()) {
      setErreur("Merci de décrire le problème rencontré.");
      return;
    }
    if (justificatifs.length === 0) {
      setErreur("Merci de joindre au moins un justificatif (photo du véhicule, constat…).");
      return;
    }

    try {
      await ajouterSinistre({
        client: client.trim(),
        telephone: telephone.trim(),
        vehicule: vehiculeSaisi.trim(),
        immatriculation: immatriculation.trim() || undefined,
        dateIncident,
        description: description.trim(),
        gravite,
        justificatifs,
      });
    } catch (erreurEnvoi) {
      // Refus du serveur : le signalement n'est pas enregistré.
      setErreur(messageRefus(erreurEnvoi));
      return;
    }
    setEnvoye(true);
  }

  if (envoye) {
    return (
      <div
        className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-modal w-full max-w-md p-8 text-center animate-scale-in"
        >
          <span className="material-symbols-outlined text-5xl text-green-600 animate-pulse">
            task_alt
          </span>
          <h2 className="mt-4 text-xl font-bold text-text-primary">Signalement envoyé</h2>
          <p className="mt-2 text-text-secondary">
            Vos justificatifs sont transmis. Un responsable examine votre dossier et vous
            recontacte avec une décision.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full bg-brand-red text-white font-semibold py-3 rounded-xl hover:bg-brand-red-dark transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Signaler un problème"
    >
      <form
        onSubmit={envoyer}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in"
      >
        <div className="flex items-start justify-between px-6 py-4 border-b border-border-light">
          <div>
            <h2 className="font-bold text-text-primary text-lg">Signaler un problème</h2>
            <p className="text-sm text-text-secondary">
              {client} · {telephone}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-brand-light flex items-center justify-center text-text-primary shrink-0"
            aria-label="Fermer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {erreur && (
            <p className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-xl p-3">
              {erreur}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-sm font-medium text-text-primary mb-1">Véhicule *</span>
              <input
                required
                className={inputCls}
                value={vehiculeSaisi}
                onChange={(e) => setVehiculeSaisi(e.target.value)}
                placeholder="Mercedes-Benz Classe S"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-text-primary mb-1">Immatriculation</span>
              <input
                className={inputCls}
                value={immatriculation}
                onChange={(e) => setImmatriculation(e.target.value)}
                placeholder="1234-AB-01"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-sm font-medium text-text-primary mb-1">
                Date du problème *
              </span>
              <input
                required
                type="date"
                className={inputCls}
                value={dateIncident}
                onChange={(e) => setDateIncident(e.target.value)}
              />
            </label>
            <div>
              <span className="block text-sm font-medium text-text-primary mb-1">Gravité</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGravite("mineure")}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                    gravite === "mineure"
                      ? "bg-brand-blue text-white border-brand-blue"
                      : "border-border-standard text-text-secondary"
                  }`}
                >
                  Mineure
                </button>
                <button
                  type="button"
                  onClick={() => setGravite("majeure")}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                    gravite === "majeure"
                      ? "bg-brand-red text-white border-brand-red"
                      : "border-border-standard text-text-secondary"
                  }`}
                >
                  Majeure
                </button>
              </div>
            </div>
          </div>

          <label className="block">
            <span className="block text-sm font-medium text-text-primary mb-1">
              Description du problème *
            </span>
            <textarea
              required
              rows={4}
              className={inputCls}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Rayure sur le pare-chocs arrière, vignette en panne, frein qui grince…"
            />
          </label>

          <JustificatifsInput
            permisObligatoire={false}
            valeur={justificatifs}
            onChange={setJustificatifs}
          />
        </div>

        <div className="px-6 py-4 border-t border-border-light flex flex-col sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-border-standard font-semibold text-text-secondary hover:bg-brand-light transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-brand-red text-white font-semibold hover:bg-brand-red-dark transition-colors"
          >
            Envoyer le signalement
          </button>
        </div>
      </form>
    </div>
  );
}
