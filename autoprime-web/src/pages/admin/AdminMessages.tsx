import { useState } from "react";
import { useMessages } from "@/hooks/useMessages";
import type { MessageContact, StatutMessage } from "@/types/admin";
import { formatDate } from "@/utils/format";

// Libellés et couleurs des statuts (identiques aux entités du backend)
const STATUTS: { valeur: StatutMessage; label: string; couleur: string }[] = [
  { valeur: "new", label: "Nouveau", couleur: "bg-brand-red text-white" },
  { valeur: "read", label: "Lu", couleur: "bg-brand-blue text-white" },
  { valeur: "archived", label: "Archivé", couleur: "bg-gray-400 text-white" },
];

const ONGLETS: { valeur: "" | StatutMessage; label: string }[] = [
  { valeur: "", label: "Tous" },
  { valeur: "new", label: "Nouveaux" },
  { valeur: "read", label: "Lus" },
  { valeur: "archived", label: "Archivés" },
];

function couleurStatut(statut: StatutMessage) {
  return STATUTS.find((s) => s.valeur === statut)?.couleur ?? "bg-gray-400 text-white";
}

function labelStatut(statut: StatutMessage) {
  return STATUTS.find((s) => s.valeur === statut)?.label ?? statut;
}

export default function AdminMessages() {
  const { messages, changerStatut, supprimer, enLigne } = useMessages();
  const [filtre, setFiltre] = useState<"" | StatutMessage>("");
  const [ouvert, setOuvert] = useState<number | null>(null);

  const affiches = filtre === "" ? messages : messages.filter((m) => m.statut === filtre);

  // Tri du plus récent au plus ancien
  const tries = [...affiches].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  async function basculerStatut(id: number, statut: StatutMessage) {
    await changerStatut(id, statut);
  }

  async function supprimerMessage(m: MessageContact) {
    if (window.confirm(`Supprimer le message de ${m.nom} ?`)) {
      await supprimer(m.id);
    }
  }

  const compteurs = {
    "": messages.length,
    new: messages.filter((m) => m.statut === "new").length,
    read: messages.filter((m) => m.statut === "read").length,
    archived: messages.filter((m) => m.statut === "archived").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary">Messages reçus</h1>
        <p className="text-text-secondary mt-1 flex items-center gap-2">
          Messages du formulaire de contact de la page Contact.
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
        {ONGLETS.map((o) => (
          <button
            key={o.valeur}
            type="button"
            onClick={() => setFiltre(o.valeur)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              filtre === o.valeur
                ? "bg-brand-red text-white"
                : "bg-white text-text-secondary border border-border-standard hover:bg-brand-light"
            }`}
          >
            {o.label} ({compteurs[o.valeur]})
          </button>
        ))}
      </div>

      {/* Liste */}
      {tries.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center">
          <span className="material-symbols-outlined text-text-muted" style={{ fontSize: "48px" }}>
            inbox
          </span>
          <p className="mt-3 font-semibold text-text-primary">Aucun message dans cette liste</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {tries.map((m) => (
            <li key={m.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
              {/* En-tête cliquable */}
              <button
                type="button"
                onClick={() => {
                  setOuvert(ouvert === m.id ? null : m.id);
                  // Ouvrir un message le passe en "lu"
                  if (m.statut === "new") changerStatut(m.id, "read");
                }}
                className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-brand-light/60 transition-colors"
                aria-expanded={ouvert === m.id}
              >
                <span className="w-11 h-11 shrink-0 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold">
                  {m.nom
                    .split(" ")
                    .map((mot) => mot[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-text-primary">
                    {m.nom}
                    <span
                      className={`ml-2 align-middle text-xs px-2 py-0.5 rounded-full ${couleurStatut(
                        m.statut
                      )}`}
                    >
                      {labelStatut(m.statut)}
                    </span>
                  </p>
                  <p className="text-sm text-text-muted truncate">
                    {m.sujet} · {m.message}
                  </p>
                </div>
                <span className="text-xs text-text-muted whitespace-nowrap hidden sm:block">
                  {formatDate(m.createdAt)}
                </span>
                <span
                  className="material-symbols-outlined text-text-muted transition-transform"
                  style={{ transform: ouvert === m.id ? "rotate(180deg)" : "none" }}
                  aria-hidden="true"
                >
                  expand_more
                </span>
              </button>

              {/* Détail déplié */}
              {ouvert === m.id && (
                <div className="px-5 pb-5 border-t border-border-light animate-fade-in">
                  <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm mb-4">
                    <p>
                      <span className="block text-text-muted text-xs uppercase">Email</span>
                      <a href={`mailto:${m.email}`} className="text-brand-blue hover:underline">
                        {m.email}
                      </a>
                    </p>
                    <p>
                      <span className="block text-text-muted text-xs uppercase">Téléphone</span>
                      {m.telephone ? (
                        <a href={`tel:${m.telephone}`} className="text-brand-blue hover:underline">
                          {m.telephone}
                        </a>
                      ) : (
                        "—"
                      )}
                    </p>
                    <p>
                      <span className="block text-text-muted text-xs uppercase">Reçu le</span>
                      {formatDate(m.createdAt)}
                    </p>
                  </div>

                  <p className="text-text-secondary whitespace-pre-line bg-brand-light rounded-xl p-4">
                    {m.message}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => basculerStatut(m.id, m.statut === "read" ? "new" : "read")}
                      className="px-4 py-2 rounded-lg text-sm font-semibold border border-border-standard text-text-secondary hover:bg-brand-light"
                    >
                      {m.statut === "read" ? "Marquer non lu" : "Marquer comme lu"}
                    </button>
                    <button
                      type="button"
                      onClick={() => basculerStatut(m.id, "archived")}
                      className="px-4 py-2 rounded-lg text-sm font-semibold border border-border-standard text-text-secondary hover:bg-brand-light"
                    >
                      Archiver
                    </button>
                    {m.statut === "archived" && (
                      <button
                        type="button"
                        onClick={() => basculerStatut(m.id, "new")}
                        className="px-4 py-2 rounded-lg text-sm font-semibold border border-border-standard text-text-secondary hover:bg-brand-light"
                      >
                        Désarchiver
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => supprimerMessage(m)}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-brand-red border border-brand-red/40 hover:bg-brand-red/10"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
