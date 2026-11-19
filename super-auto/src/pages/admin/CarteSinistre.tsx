import { useState } from "react";
import type { Sinistre, StatutSinistre } from "@/types/demandes";
import { formatDate } from "@/utils/format";
import JustificatifsListe from "@/components/JustificatifsListe";

interface Props {
  sinistre: Sinistre;
  onStatuer: (statut: StatutSinistre, decision?: string) => void;
}

const COULEURS: Record<StatutSinistre, string> = {
  recue: "bg-brand-blue text-white",
  en_examen: "bg-orange-500 text-white",
  acceptee: "bg-green-600 text-white",
  refusee: "bg-red-600 text-white",
};

const LABELS: Record<StatutSinistre, string> = {
  recue: "Reçue",
  en_examen: "En examen",
  acceptee: "Acceptée",
  refusee: "Refusée",
};

/** Carte d'un sinistre déclaré par un client, avec la décision de l'admin. */
export default function CarteSinistre({ sinistre, onStatuer }: Props) {
  const [decision, setDecision] = useState("");
  const [saisieOuverte, setSaisieOuverte] = useState(false);

  const grave = sinistre.gravite === "majeure";

  return (
    <article className="bg-white rounded-2xl shadow-card p-5 space-y-4">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase text-text-muted tracking-wide">Sinistre</p>
          <h2 className="font-bold text-text-primary">{sinistre.vehicule}</h2>
          <p className="text-sm text-text-muted">
            {sinistre.client} · reçu le {formatDate(sinistre.createdAt)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full ${COULEURS[sinistre.statut]}`}>
            {LABELS[sinistre.statut]}
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              grave ? "bg-brand-red text-white" : "bg-brand-surface border border-border-standard text-text-secondary"
            }`}
          >
            {grave ? "Majeure" : "Mineure"}
          </span>
        </div>
      </div>

      {/* Infos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <p className="text-text-secondary">
          <span className="block text-xs text-text-muted uppercase">Téléphone</span>
          <a href={`tel:${sinistre.telephone}`} className="text-brand-blue hover:underline">
            {sinistre.telephone}
          </a>
        </p>
        <p className="text-text-secondary">
          <span className="block text-xs text-text-muted uppercase">Date du problème</span>
          {sinistre.dateIncident || "—"}
        </p>
        <p className="text-text-secondary">
          <span className="block text-xs text-text-muted uppercase">Immatriculation</span>
          {sinistre.immatriculation || "—"}
        </p>
      </div>

      <p className="text-sm text-text-secondary bg-brand-light rounded-xl p-3">{sinistre.description}</p>

      {/* Justificatifs */}
      <div>
        <p className="text-xs uppercase text-text-muted mb-2">Justificatifs du client</p>
        <JustificatifsListe justificatifs={sinistre.justificatifs} />
      </div>

      {sinistre.decision && (
        <p className="bg-brand-light border border-border-light text-sm text-text-secondary rounded-xl p-3">
          <span className="font-semibold text-text-primary">Décision : </span>
          {sinistre.decision}
        </p>
      )}

      {/* Saisie de la décision */}
      {saisieOuverte && (
        <div className="space-y-2">
          <textarea
            rows={2}
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            placeholder="Réponse au client : prise en charge, montant, franchise, next steps…"
            className="w-full rounded-lg border border-border-standard bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-red/40"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onStatuer("acceptee", decision.trim());
                setSaisieOuverte(false);
                setDecision("");
              }}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700"
            >
              Accepter le dossier
            </button>
            <button
              type="button"
              onClick={() => {
                onStatuer("refusee", decision.trim());
                setSaisieOuverte(false);
                setDecision("");
              }}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700"
            >
              Refuser
            </button>
            <button
              type="button"
              onClick={() => setSaisieOuverte(false)}
              className="px-4 py-2 rounded-lg text-sm font-semibold border border-border-standard text-text-secondary"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      {!saisieOuverte && sinistre.statut !== "acceptee" && sinistre.statut !== "refusee" && (
        <div className="flex flex-wrap gap-2 pt-1">
          {sinistre.statut === "recue" && (
            <button
              type="button"
              onClick={() => onStatuer("en_examen")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border border-brand-blue/40 text-brand-blue hover:bg-brand-blue/10"
            >
              <span className="material-symbols-outlined text-lg">search</span>
              Mettre en examen
            </button>
          )}
          <button
            type="button"
            onClick={() => setSaisieOuverte(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-brand-red text-white hover:bg-brand-red-dark"
          >
            <span className="material-symbols-outlined text-lg">gavel</span>
            Décider (accepter / refuser)
          </button>
        </div>
      )}
    </article>
  );
}
