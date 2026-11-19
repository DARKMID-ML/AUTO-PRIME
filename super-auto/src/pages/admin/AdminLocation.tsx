import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { flotteInitiale, locationsInitiales } from "@/data/location";
import type { Location, StatutFlotte, StatutLocation, VehiculeFlotte } from "@/types/admin";
import { calculerJours } from "@/utils/format";
import FlotteTab from "./FlotteTab";
import LocationsTab from "./LocationsTab";
import ModaleFlotte, { type BrouillonFlotte } from "./LocationModals";
import ModaleLocation, { type BrouillonLocation } from "./ModaleLocation";

/** Véhicule de flotte vide pour le formulaire d'ajout. */
const flotteVide: BrouillonFlotte = {
  marque: "",
  model: "",
  annee: new Date().getFullYear(),
  type: "Berline",
  image: "",
  tarifJour: "",
  caution: "",
  places: "5 places",
  climatisation: "Oui",
  transmission: "Automatique",
  localisation: "Bamako",
  statut: "disponible",
};

const locationVide: BrouillonLocation = {
  client: "",
  telephone: "",
  vehicule: "",
  dateDebut: "",
  dateFin: "",
};

/** Extrait le nombre d'un tarif formaté ("150 €/jour" → 150). */
function tarifNumerique(tarif: string): number {
  return Number(tarif.replace(/[^\d]/g, "")) || 0;
}

export default function AdminLocation() {
  const [onglet, setOnglet] = useState<"flotte" | "locations">("flotte");

  const [flotte, setFlotte] = useLocalStorage<VehiculeFlotte[]>(
    "admin:flotte",
    flotteInitiale,
  );
  const [locations, setLocations] = useLocalStorage<Location[]>(
    "admin:locations",
    locationsInitiales,
  );

  const [modalFlotte, setModalFlotte] = useState(false);
  const [flotteEnEdition, setFlotteEnEdition] = useState<VehiculeFlotte | null>(null);
  const [brouillonFlotte, setBrouillonFlotte] = useState<BrouillonFlotte>(flotteVide);

  const [modalLocation, setModalLocation] = useState(false);
  const [brouillonLocation, setBrouillonLocation] = useState<BrouillonLocation>(locationVide);

  // --- Flotte ---------------------------------------------------------------
  function ouvrirAjoutFlotte() {
    setFlotteEnEdition(null);
    setBrouillonFlotte(flotteVide);
    setModalFlotte(true);
  }

  function ouvrirEditionFlotte(v: VehiculeFlotte) {
    setFlotteEnEdition(v);
    const { id, ...sansId } = v;
    void id;
    setBrouillonFlotte(sansId);
    setModalFlotte(true);
  }

  function enregistrerFlotte(e: React.FormEvent) {
    e.preventDefault();
    if (flotteEnEdition) {
      setFlotte(
        flotte.map((v) =>
          v.id === flotteEnEdition.id ? { ...brouillonFlotte, id: flotteEnEdition.id } : v
        )
      );
    } else {
      const nouvelId = flotte.reduce((max, v) => Math.max(max, v.id), 0) + 1;
      setFlotte([...flotte, { ...brouillonFlotte, id: nouvelId }]);
    }
    setModalFlotte(false);
  }

  function supprimerFlotte(v: VehiculeFlotte) {
    if (window.confirm(`Retirer ${v.marque} ${v.model} de la flotte de location ?`)) {
      setFlotte(flotte.filter((x) => x.id !== v.id));
    }
  }

  function changerStatutFlotte(id: number, statut: StatutFlotte) {
    setFlotte(flotte.map((v) => (v.id === id ? { ...v, statut } : v)));
  }

  // --- Locations ------------------------------------------------------------
  function enregistrerLocation(e: React.FormEvent) {
    e.preventDefault();
    const jours = calculerJours(brouillonLocation.dateDebut, brouillonLocation.dateFin);
    const tarif = tarifNumerique(
      flotte.find((v) => `${v.marque} ${v.model}` === brouillonLocation.vehicule)?.tarifJour ?? "0"
    );

    const nouvelle: Location = {
      id: locations.reduce((max, l) => Math.max(max, l.id), 0) + 1,
      client: brouillonLocation.client,
      telephone: brouillonLocation.telephone,
      vehicule: brouillonLocation.vehicule,
      dateDebut: brouillonLocation.dateDebut,
      dateFin: brouillonLocation.dateFin,
      jours,
      montant: `${(tarif * jours).toLocaleString("fr-FR")} €`,
      statut: "en_cours",
      createdAt: new Date().toISOString().slice(0, 19),
    };

    setLocations([...locations, nouvelle]);
    // Le véhicule loué quitte la flotte disponible
    setFlotte(
      flotte.map((v) =>
        `${v.marque} ${v.model}` === nouvelle.vehicule ? { ...v, statut: "loue" } : v
      )
    );
    setModalLocation(false);
    setBrouillonLocation(locationVide);
    setOnglet("locations");
  }

  function changerStatutLocation(id: number, statut: StatutLocation) {
    setLocations(locations.map((l) => (l.id === id ? { ...l, statut } : l)));
    const loc = locations.find((l) => l.id === id);
    // Véhicule rendu ou location close → il redevient disponible
    if (loc && (statut === "terminee" || statut === "a_rendre")) {
      setFlotte(
        flotte.map((v) =>
          `${v.marque} ${v.model}` === loc.vehicule ? { ...v, statut: "disponible" } : v
        )
      );
    }
  }

  function prolonger(l: Location) {
    const nouvelleFin = new Date(l.dateFin);
    nouvelleFin.setDate(nouvelleFin.getDate() + 3);
    const dateFin = nouvelleFin.toISOString().slice(0, 10);
    const jours = calculerJours(l.dateDebut, dateFin);
    const tarif = tarifNumerique(
      flotte.find((v) => `${v.marque} ${v.model}` === l.vehicule)?.tarifJour ?? "0"
    );

    setLocations(
      locations.map((x) =>
        x.id === l.id
          ? {
              ...x,
              dateFin,
              jours,
              montant: `${(tarif * jours).toLocaleString("fr-FR")} €`,
              statut: "prolongee",
            }
          : x
      )
    );
  }

  function supprimerLocation(l: Location) {
    if (window.confirm(`Supprimer la location de ${l.client} ?`)) {
      setLocations(locations.filter((x) => x.id !== l.id));
    }
  }

  const onglets = [
    { cle: "flotte" as const, label: "Flotte", icone: "car_rental", compte: flotte.length },
    {
      cle: "locations" as const,
      label: "Locations en cours",
      icone: "event_available",
      compte: locations.filter((l) => l.statut !== "terminee").length,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary">Location</h1>
        <p className="text-text-secondary mt-1">
          Gérez la flotte louable et le suivi des locations en cours.
        </p>
      </div>

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

      {onglet === "flotte" ? (
        <FlotteTab
          flotte={flotte}
          onAjouter={ouvrirAjoutFlotte}
          onModifier={ouvrirEditionFlotte}
          onSupprimer={supprimerFlotte}
          onChangerStatut={changerStatutFlotte}
        />
      ) : (
        <LocationsTab
          locations={locations}
          onNouvelle={() => setModalLocation(true)}
          onProlonger={prolonger}
          onChangerStatut={changerStatutLocation}
          onSupprimer={supprimerLocation}
        />
      )}

      {modalFlotte && (
        <ModaleFlotte
          brouillon={brouillonFlotte}
          enEdition={flotteEnEdition !== null}
          onChange={setBrouillonFlotte}
          onValider={enregistrerFlotte}
          onFermer={() => setModalFlotte(false)}
        />
      )}

      {modalLocation && (
        <ModaleLocation
          brouillon={brouillonLocation}
          flotte={flotte}
          onChange={setBrouillonLocation}
          onValider={enregistrerLocation}
          onFermer={() => setModalLocation(false)}
        />
      )}
    </div>
  );
}
