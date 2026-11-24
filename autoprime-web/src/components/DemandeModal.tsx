import { useEffect, useState } from "react";
import type { Vehicule } from "@/types/vehicule";
import type { Justificatif } from "@/types/demandes";
import { joursEntre, messageRefus, useDemandes } from "@/store/demandes";
import { capturer } from "@/config/analytics";
import JustificatifsInput from "./JustificatifsInput";

interface Props {
  vehicule: Vehicule;
  /** "location" pour un véhicule en location, "essai" pour un véhicule à la vente. */
  mode: "location" | "essai";
  onClose: () => void;
}

const inputCls =
  "w-full rounded-lg border border-border-standard bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red transition-colors";

/**
 * Formulaire de demande : location (avec dates) ou essai (avec une date).
 * Le client coche les justificatifs qu'il souhaite envoyer.
 */
export default function DemandeModal({ vehicule, mode, onClose }: Props) {
  const { ajouterLocation, ajouterEssai } = useDemandes();

  const [client, setClient] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [dateEssai, setDateEssai] = useState("");
  const [message, setMessage] = useState("");
  const [justificatifs, setJustificatifs] = useState<Justificatif[]>([]);
  const [erreur, setErreur] = useState("");
  const [envoye, setEnvoye] = useState(false);

  const estLocation = mode === "location";
  const jours = estLocation ? joursEntre(dateDebut, dateFin) : 0;

  // Intention d'achat / de location : le formulaire est ouvert. Étape
  // intermédiaire du tunnel avant « demande_envoyee ».
  useEffect(() => {
    capturer("demande_ouverte", {
      type: mode === "location" ? "location" : "essai",
      vehicule: `${vehicule.marque} ${vehicule.model}`,
    });
  }, [mode, vehicule.marque, vehicule.model]);

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");

    // Le permis de conduire est obligatoire pour une location
    if (estLocation && !justificatifs.some((j) => j.type === "permis")) {
      setErreur("Merci de joindre votre permis de conduire pour une demande de location.");
      return;
    }

    const commun = {
      client: client.trim(),
      telephone: telephone.trim(),
      email: email.trim() || undefined,
      vehicule: `${vehicule.marque} ${vehicule.model}`,
      message: message.trim() || undefined,
      justificatifs,
    };

    try {
      if (estLocation) {
        await ajouterLocation({
          ...commun,
          dateDebut,
          dateFin,
          jours,
        });
      } else {
        await ajouterEssai({ ...commun, dateEssai });
      }
    } catch (erreurEnvoi) {
      // Refus du serveur : rien n'a été enregistré, on reste sur le formulaire.
      setErreur(messageRefus(erreurEnvoi));
      return;
    }
    // Étape clé du parcours : le replay PostHog y est rattaché (aucune donnée
    // personnelle dans les propriétés envoyées).
    capturer("demande_envoyee", {
      type: estLocation ? "location" : "essai",
      vehicule: `${vehicule.marque} ${vehicule.model}`,
      jours: estLocation ? jours : undefined,
    });
    setEnvoye(true);
  }

  // --- Écran de confirmation -------------------------------------------------
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
            check_circle
          </span>
          <h2 className="mt-4 text-xl font-bold text-text-primary">Demande envoyée !</h2>
          <p className="mt-2 text-text-secondary">
            {estLocation
              ? "Votre demande de location pour "
              : "Votre demande d'essai pour "}
            <span className="font-semibold text-text-primary">
              {vehicule.marque} {vehicule.model}
            </span>{" "}
            a bien été enregistrée. Notre équipe l'étudie et vous rappelle sous 24 h ouvrées.
          </p>
          <p className="mt-3 text-sm text-text-muted">
            Vous pouvez suivre son état depuis la page « Mes demandes ».
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

  // --- Formulaire -----------------------------------------------------------
  return (
    <div
      className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={estLocation ? "Demande de location" : "Demande d'essai"}
    >
      <form
        onSubmit={envoyer}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in"
      >
        {/* En-tête */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-border-light">
          <div>
            <h2 className="font-bold text-text-primary text-lg">
              {estLocation ? "Demande de location" : "Demande d'essai"}
            </h2>
            <p className="text-sm text-text-secondary">
              {vehicule.marque} {vehicule.model} · {vehicule.annee} ·{" "}
              <span className="font-semibold text-brand-red">{vehicule.prix}</span>
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
              <span className="block text-sm font-medium text-text-primary mb-1">
                Nom complet *
              </span>
              <input
                required
                className={inputCls}
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Amadou Diallo"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-text-primary mb-1">Téléphone *</span>
              <input
                required
                className={inputCls}
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="+223 70 00 00 00"
              />
            </label>
          </div>

          <label className="block">
            <span className="block text-sm font-medium text-text-primary mb-1">Email</span>
            <input
              type="email"
              className={inputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="amadou@email.com"
            />
          </label>

          {/* Dates */}
          {estLocation ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-sm font-medium text-text-primary mb-1">
                    Date de début *
                  </span>
                  <input
                    required
                    type="date"
                    className={inputCls}
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium text-text-primary mb-1">
                    Date de fin *
                  </span>
                  <input
                    required
                    type="date"
                    className={inputCls}
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                  />
                </label>
              </div>
              {jours > 0 && (
                <p className="bg-brand-light rounded-xl p-3 text-sm text-text-secondary">
                  Durée : <span className="font-semibold text-text-primary">{jours} jour(s)</span>
                </p>
              )}
            </>
          ) : (
            <label className="block">
              <span className="block text-sm font-medium text-text-primary mb-1">
                Date souhaitée pour l'essai *
              </span>
              <input
                required
                type="date"
                className={inputCls}
                value={dateEssai}
                onChange={(e) => setDateEssai(e.target.value)}
              />
            </label>
          )}

          <label className="block">
            <span className="block text-sm font-medium text-text-primary mb-1">
              Message (optionnel)
            </span>
            <textarea
              rows={3}
              className={inputCls}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                estLocation
                  ? "Besoin d'un véhicule avec remorque, conduite en ville…"
                  : "Je souhaite tester le véhicule sur route."
              }
            />
          </label>

          {/* Justificatifs choisis par le client */}
          <JustificatifsInput
            permisObligatoire={estLocation}
            valeur={justificatifs}
            onChange={setJustificatifs}
          />
        </div>

        {/* Pied : boutons */}
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
            {estLocation ? "Envoyer la demande" : "Demander l'essai"}
          </button>
        </div>
      </form>
    </div>
  );
}
