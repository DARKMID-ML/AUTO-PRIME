import { useState } from "react";
import type { DemandeEssai, DemandeLocation, StatutDemande } from "@/types/demandes";
import { formatDate } from "@/utils/format";
import JustificatifsListe from "@/components/JustificatifsListe";

interface Props {
  demande: DemandeLocation | DemandeEssai;
  /** "location" ou "essai" : change le libellé affiché. */
  type: "location" | "essai";
  onStatuer: (statut: StatutDemande, motifRefus?: string) => void;
  /** Proposé uniquement pour les demandes de location validées. */
  onOuvrirLocation?: () => void;
}

const COULEURS: Record<StatutDemande, string> = {
  en_attente: "bg-orange-500 text-white",
  validee: "bg-green-600 text-white",
  refusee: "bg-red-600 text-white",
};

const LABELS: Record<StatutDemande, string> = {
  en_attente: "En attente",
  validee: "Validée",
  refusee: "Refusée",
};

/** Carte d'une demande (location ou essai) avec les actions de l'administrateur. */
export default function CarteDemande({ demande, type, onStatuer, onOuvrirLocation }: Props) {
  const [motifOuvert, setMotifOuvert] = useState(false);
  const [motif, setMotif] = useState("");

  const estLocation = type === "location";

  return (
    <article className="bg-white rounded-2xl shadow-card p-5 space-y-4">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase text-text-muted tracking-wide">
            {estLocation ? "Demande de location" : "Demande d'essai"}
          </p>
          <h2 className="font-bold text-text-primary">{demande.vehicule}</h2>
          <p className="text-sm text-text-muted">Reçue le {formatDate(demande.createdAt)}</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full ${COULEURS[demande.statut]}`}>
          {LABELS[demande.statut]}
        </span>
      </div>

      {/* Client */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <p className="text-text-secondary">
          <span className="block text-xs text-text-muted uppercase">Client</span>
          {demande.client}
        </p>
        <p className="text-text-secondary">
          <span className="block text-xs text-text-muted uppercase">Téléphone</span>
          <a href={`tel:${demande.telephone}`} className="text-brand-blue hover:underline">
            {demande.telephone}
          </a>
        </p>
        <p className="text-text-secondary">
          <span className="block text-xs text-text-muted uppercase">Email</span>
          {demande.email || "—"}
        </p>
      </div>

      {/* Période */}
      <p className="text-sm text-text-secondary">
        {estLocation ? (
          <>
            Du <span className="font-semibold text-text-primary">{(demande as DemandeLocation).dateDebut}</span> au{" "}
            <span className="font-semibold text-text-primary">{(demande as DemandeLocation).dateFin}</span> ({" "}
            {(demande as DemandeLocation).jours} jour(s))
          </>
        ) : (
          <>
            Essai souhaité le{" "}
            <span className="font-semibold text-text-primary">{(demande as DemandeEssai).dateEssai}</span>
          </>
        )}
      </p>

      {demande.message && (
        <p className="text-sm text-text-secondary bg-brand-light rounded-xl p-3">{demande.message}</p>
      )}

      {/* Justificatifs reçus */}
      <div>
        <p className="text-xs uppercase text-text-muted mb-2">Justificatifs reçus</p>
        <JustificatifsListe justificatifs={demande.justificatifs} />
        {estLocation && !demande.justificatifs.some((j) => j.type === "permis") && (
          <p className="text-xs text-brand-red mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">warning</span>
            Permis de conduire manquant — à réclamer avant validation.
          </p>
        )}
      </div>

      {demande.motifRefus && (
        <p className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
          Refus motif : {demande.motifRefus}
        </p>
      )}

      {/* Motif de refus */}
      {motifOuvert && (
        <div className="space-y-2">
          <textarea
            rows={2}
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Motif du refus (visible par le client sur la page Mes demandes)"
            className="w-full rounded-lg border border-border-standard bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-red/40"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={motif.trim() === ""}
              onClick={() => {
                onStatuer("refusee", motif.trim());
                setMotifOuvert(false);
                setMotif("");
              }}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-40"
            >
              Confirmer le refus
            </button>
            <button
              type="button"
              onClick={() => setMotifOuvert(false)}
              className="px-4 py-2 rounded-lg text-sm font-semibold border border-border-standard text-text-secondary"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      {demande.statut !== "refusee" && (
        <div className="flex flex-wrap gap-2 pt-1">
          {demande.statut !== "validee" && (
            <button
              type="button"
              onClick={() => onStatuer("validee")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700"
            >
              <span className="material-symbols-outlined text-lg">check</span>
              Valider la demande
            </button>
          )}
          {onOuvrirLocation && demande.statut === "validee" && (
            <button
              type="button"
              onClick={onOuvrirLocation}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-brand-blue text-white hover:bg-brand-blue-dark"
            >
              <span className="material-symbols-outlined text-lg">key</span>
              Ouvrir la location
            </button>
          )}
          {!motifOuvert && (
            <button
              type="button"
              onClick={() => setMotifOuvert(true)}
              className="px-4 py-2 rounded-lg text-sm font-semibold border border-red-600/40 text-brand-red hover:bg-brand-red/10"
            >
              Refuser
            </button>
          )}
        </div>
      )}
    </article>
  );
}
