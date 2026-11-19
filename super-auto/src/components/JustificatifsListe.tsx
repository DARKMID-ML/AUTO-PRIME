import { useState } from "react";
import type { Justificatif } from "@/types/demandes";
import { tailleLisible } from "@/store/demandes";

/**
 * Affichage des justificatifs reçus : une puce par document,
 * avec aperçu de l'image si elle a pu être stockée.
 */
export default function JustificatifsListe({ justificatifs }: { justificatifs: Justificatif[] }) {
  const [apercu, setApercu] = useState<Justificatif | null>(null);

  if (justificatifs.length === 0) {
    return <p className="text-sm text-text-muted">Aucun justificatif envoyé.</p>;
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {justificatifs.map((j) => (
          <span
            key={j.type}
            className="inline-flex items-center gap-1.5 text-xs font-medium bg-brand-surface border border-border-standard text-text-secondary px-2.5 py-1 rounded-full"
          >
            <span className="material-symbols-outlined text-sm">
              {j.apercu ? "image" : j.lien ? "link" : j.nomFichier ? "description" : "check_circle"}
            </span>
            {j.libelle}
            {j.nomFichier && <span className="text-text-muted">({tailleLisible(j.taille)})</span>}
            {j.apercu && (
              <button
                type="button"
                onClick={() => setApercu(j)}
                className="text-brand-blue hover:underline"
              >
                voir
              </button>
            )}
            {j.lien && (
              <a
                href={j.lien}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-blue hover:underline"
              >
                ouvrir
              </a>
            )}
          </span>
        ))}
      </div>

      {/* Aperçu agrandi */}
      {apercu?.apercu && (
        <div
          className="fixed inset-0 z-[90] bg-black/70 flex items-center justify-center p-4"
          onClick={() => setApercu(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Aperçu — ${apercu.libelle}`}
        >
          <div onClick={(e) => e.stopPropagation()} className="max-w-2xl w-full text-center">
            <img
              src={apercu.apercu}
              alt={apercu.libelle}
              className="max-h-[80vh] mx-auto rounded-xl shadow-modal"
            />
            <p className="text-white mt-3 text-sm">
              {apercu.libelle} — {apercu.nomFichier}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
