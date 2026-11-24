import { useState } from "react";
import { joursEntre, messageRefus, useDemandes } from "@/store/demandes";
import type { Location } from "@/types/admin";
import type { DemandeLocation, StatutDemande, StatutSinistre } from "@/types/demandes";
import CarteDemande from "./CarteDemande";
import CarteSinistre from "./CarteSinistre";

const CLE_LOCATIONS_ENCOURS = "admin:locations";

/**
 * Espace admin des demandes clients : validation des demandes de location
 * et d'essai, puis traitement des sinistres (justificatifs).
 */
export default function AdminDemandes() {
  const { locations, essais, sinistres, statuerDemande, statuerSinistre } = useDemandes();
  const [onglet, setOnglet] = useState<"locations" | "essais" | "sinistres">("locations");
  const [erreurStatut, setErreurStatut] = useState("");

  /**
   * Applique un changement de statut et affiche le refus du serveur.
   * Un refus (400, 403…) ne modifie rien : la carte garde son statut.
   */
  async function changerStatut(action: Promise<unknown>) {
    try {
      await action;
      setErreurStatut("");
    } catch (erreur) {
      setErreurStatut(messageRefus(erreur));
    }
  }

  const enAttente = (list: { statut: string }[]) => list.filter((d) => d.statut === "en_attente").length;
  const sinistresRecues = sinistres.filter((s) => s.statut === "recue" || s.statut === "en_examen").length;

  /**
   * Transforme une demande validée en location en cours (onglet Location).
   * Le tarif est repris de la flotte si le véhicule y figure.
   */
  function ouvrirLocation(demande: DemandeLocation) {
    let flotte: { marque: string; model: string; tarifJour: string }[] = [];
    try {
      const brut = window.localStorage.getItem("admin:flotte");
      flotte = brut ? (JSON.parse(brut) as typeof flotte) : [];
    } catch {
      flotte = [];
    }
    const tarif = Number(
      (flotte.find((v) => `${v.marque} ${v.model}` === demande.vehicule)?.tarifJour ?? "0").replace(
        /[^\d]/g,
        ""
      )
    );
    const jours = joursEntre(demande.dateDebut, demande.dateFin);

    let enCours: Location[] = [];
    try {
      const brut = window.localStorage.getItem(CLE_LOCATIONS_ENCOURS);
      enCours = brut ? (JSON.parse(brut) as Location[]) : [];
    } catch {
      // localStorage illisible : on repart d'une liste vide
    }

    const nouvelle: Location = {
      id: enCours.reduce((max, l) => Math.max(max, l.id), 0) + 1,
      client: demande.client,
      telephone: demande.telephone,
      vehicule: demande.vehicule,
      dateDebut: demande.dateDebut,
      dateFin: demande.dateFin,
      jours,
      montant: `${(tarif * jours).toLocaleString("fr-FR")} €`,
      statut: "en_cours",
      createdAt: new Date().toISOString().slice(0, 19),
    };

    window.localStorage.setItem(CLE_LOCATIONS_ENCOURS, JSON.stringify([...enCours, nouvelle]));
    window.alert(`Location ouverte pour ${demande.client} — visible dans Admin › Location.`);
  }

  const onglets = [
    { cle: "locations" as const, label: "Locations", icone: "car_rental", compte: locations.length },
    { cle: "essais" as const, label: "Essais", icone: "directions_car", compte: essais.length },
    { cle: "sinistres" as const, label: "Sinistres", icone: "report_problem", compte: sinistres.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary">Demandes clients</h1>
        <p className="text-text-secondary mt-1">
          Validez ou refusez les demandes de location et d'essai, et traitez les sinistres.
        </p>
      </div>

      {/* Statistiques d'action */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-card p-4">
          <p className="text-2xl font-extrabold text-orange-500">
            {enAttente([...locations, ...essais])}
          </p>
          <p className="text-sm text-text-secondary">En attente de décision</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-4">
          <p className="text-2xl font-extrabold text-brand-red">{sinistresRecues}</p>
          <p className="text-sm text-text-secondary">Sinistres à traiter</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-4">
          <p className="text-2xl font-extrabold text-green-600">
            {locations.filter((l) => l.statut === "validee").length}
          </p>
          <p className="text-sm text-text-secondary">Locations validées</p>
        </div>
      </div>

      {erreurStatut && (
        <p role="alert" className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-xl p-3">
          {erreurStatut}
        </p>
      )}

      {/* Onglets */}
      <div className="flex flex-wrap gap-2 border-b border-border-standard">
        {onglets.map((o) => (
          <button
            key={o.cle}
            type="button"
            onClick={() => setOnglet(o.cle)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 font-semibold text-sm rounded-t-lg border-b-2 transition-colors ${
              onglet === o.cle
                ? "border-brand-red text-brand-red"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">
              {o.icone}
            </span>
            {o.label} ({o.compte})
          </button>
        ))}
      </div>

      {/* Demandes de location */}
      {onglet === "locations" && (
        <div className="space-y-4">
          {locations.length === 0 ? (
            <Vide message="Aucune demande de location pour le moment." icone="car_rental" />
          ) : (
            locations.map((d) => (
              <CarteDemande
                key={d.id}
                demande={d}
                type="location"
                onStatuer={(statut: StatutDemande, motifRefus) =>
                  void changerStatut(statuerDemande("locations", d.id, statut, motifRefus))
                }
                onOuvrirLocation={() => ouvrirLocation(d)}
              />
            ))
          )}
        </div>
      )}

      {/* Demandes d'essai */}
      {onglet === "essais" && (
        <div className="space-y-4">
          {essais.length === 0 ? (
            <Vide message="Aucune demande d'essai pour le moment." icone="directions_car" />
          ) : (
            essais.map((d) => (
              <CarteDemande
                key={d.id}
                demande={d}
                type="essai"
                onStatuer={(statut: StatutDemande, motifRefus) =>
                  void changerStatut(statuerDemande("essais", d.id, statut, motifRefus))
                }
              />
            ))
          )}
        </div>
      )}

      {/* Sinistres */}
      {onglet === "sinistres" && (
        <div className="space-y-4">
          {sinistres.length === 0 ? (
            <Vide message="Aucun sinistre signalé." icone="report_problem" />
          ) : (
            sinistres.map((s) => (
              <CarteSinistre
                key={s.id}
                sinistre={s}
                onStatuer={(statut: StatutSinistre, decision) =>
                  void changerStatut(statuerSinistre(s.id, statut, decision))
                }
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

/** État vide partagé. */
function Vide({ message, icone }: { message: string; icone: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-10 text-center">
      <span className="material-symbols-outlined text-text-muted" style={{ fontSize: "48px" }}>
        {icone}
      </span>
      <p className="mt-3 font-semibold text-text-primary">{message}</p>
    </div>
  );
}
