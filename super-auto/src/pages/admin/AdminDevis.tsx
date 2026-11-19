import { useState } from "react";
import { useDevis } from "@/hooks/useDevis";
import type { DemandeDevis, StatutDevis } from "@/types/admin";
import { formatDate } from "@/utils/format";

const STATUTS: { valeur: StatutDevis; label: string; couleur: string }[] = [
  { valeur: "new", label: "Nouveau", couleur: "bg-brand-red text-white" },
  { valeur: "contacted", label: "Contacté", couleur: "bg-brand-blue text-white" },
  { valeur: "archived", label: "Archivé", couleur: "bg-gray-400 text-white" },
];

const PAYS_LABELS: Record<string, string> = {
  france: "France",
  usa: "USA",
  dubai: "Dubaï",
  allemagne: "Allemagne",
  autre: "Autre",
};

function couleurStatut(statut: StatutDevis) {
  return STATUTS.find((s) => s.valeur === statut)?.couleur ?? "bg-gray-400 text-white";
}

function labelStatut(statut: StatutDevis) {
  return STATUTS.find((s) => s.valeur === statut)?.label ?? statut;
}

export default function AdminDevis() {
  const { devis, changerStatut, supprimer, enLigne } = useDevis();
  const [filtre, setFiltre] = useState<"" | StatutDevis>("");

  const affiches = (filtre === "" ? devis : devis.filter((d) => d.statut === filtre))
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  async function basculerStatut(id: number, statut: StatutDevis) {
    await changerStatut(id, statut);
  }

  async function supprimerDemande(d: DemandeDevis) {
    if (window.confirm(`Supprimer la demande de ${d.nom} ?`)) {
      await supprimer(d.id);
    }
  }

  const compteurs = {
    "": devis.length,
    new: devis.filter((d) => d.statut === "new").length,
    contacted: devis.filter((d) => d.statut === "contacted").length,
    archived: devis.filter((d) => d.statut === "archived").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary">
          Demandes de devis transit
        </h1>
        <p className="text-text-secondary mt-1 flex items-center gap-2">
          Demandes d'importation reçues depuis la page Transit.
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
              enLigne ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
            }`}
            title={enLigne ? "Lecture depuis le serveur" : "Serveur éteint — boîte locale"}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${enLigne ? "bg-green-600" : "bg-orange-600"}`} aria-hidden="true" />
            {enLigne ? "Serveur" : "Local"}
          </span>
        </p>
      </div>

      {/* Onglets de filtre */}
      <div className="flex flex-wrap gap-2">
        {(["", "new", "contacted", "archived"] as const).map((valeur) => {
          const label =
            valeur === ""
              ? "Tous"
              : (STATUTS.find((s) => s.valeur === valeur)?.label ?? valeur);
          return (
            <button
              key={valeur || "tous"}
              type="button"
              onClick={() => setFiltre(valeur)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                filtre === valeur
                  ? "bg-brand-red text-white"
                  : "bg-white text-text-secondary border border-border-standard hover:bg-brand-light"
              }`}
            >
              {label} ({compteurs[valeur]})
            </button>
          );
        })}
      </div>

      {/* Liste */}
      {affiches.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center">
          <span className="material-symbols-outlined text-text-muted" style={{ fontSize: "48px" }}>
            work_history
          </span>
          <p className="mt-3 font-semibold text-text-primary">Aucune demande dans cette liste</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {affiches.map((d) => (
            <article key={d.id} className="bg-white rounded-2xl shadow-card p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-text-primary">{d.nom}</h2>
                  <p className="text-sm text-text-muted">{formatDate(d.createdAt)}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full ${couleurStatut(d.statut)}`}>
                  {labelStatut(d.statut)}
                </span>
              </div>

              {/* Véhicule demandé */}
              <p className="flex items-start gap-2 text-sm text-text-secondary">
                <span className="material-symbols-outlined text-brand-red" aria-hidden="true">
                  directions_car
                </span>
                <span className="font-semibold text-text-primary">{d.vehicule}</span>
              </p>

              {/* Contact */}
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-text-secondary">
                <a
                  href={`tel:${d.telephone}`}
                  className="inline-flex items-center gap-1.5 hover:text-brand-blue"
                >
                  <span className="material-symbols-outlined text-base" aria-hidden="true">
                    call
                  </span>
                  {d.telephone}
                </a>
                {d.email && (
                  <a
                    href={`mailto:${d.email}`}
                    className="inline-flex items-center gap-1.5 hover:text-brand-blue"
                  >
                    <span className="material-symbols-outlined text-base" aria-hidden="true">
                      mail
                    </span>
                    {d.email}
                  </a>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base" aria-hidden="true">
                    flag
                  </span>
                  {PAYS_LABELS[d.pays] ?? d.pays}
                </span>
              </div>

              {d.message && (
                <p className="text-sm text-text-secondary bg-brand-light rounded-xl p-3">
                  {d.message}
                </p>
              )}

              {/* Actions statut */}
              <div className="flex flex-wrap gap-2 pt-1">
                {STATUTS.filter((s) => s.valeur !== d.statut).map((s) => (
                  <button
                    key={s.valeur}
                    type="button"
                    onClick={() => basculerStatut(d.id, s.valeur)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border-standard text-text-secondary hover:bg-brand-light"
                  >
                    {s.valeur === "new"
                      ? "Remettre en attente"
                      : s.valeur === "contacted"
                        ? "Marquer contacté"
                        : "Archiver"}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => supprimerDemande(d)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-red border border-brand-red/40 hover:bg-brand-red/10"
                >
                  Supprimer
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
