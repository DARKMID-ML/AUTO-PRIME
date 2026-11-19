import { useCallback, useEffect, useState } from "react";
import type {
  DemandeEssai,
  DemandeLocation,
  Justificatif,
  Sinistre,
  StatutDemande,
  StatutSinistre,
  StoreDemandes,
  TypeJustificatif,
} from "@/types/demandes";

/**
 * Store des demandes clients (demandes de location, essais, sinistres).
 *
 * ⚠️ Tout est stocké dans le localStorage le temps que l'API Spring Boot
 * prenne le relais : chaque fonction ci-dessous correspond à un futur appel
 * API (POST /api/vehicles/demande-location, PATCH /api/admin/demandes/:id…).
 */

const CLE = "sa:demandes";

/** Libellés des justificatifs proposés au client (il coche ceux qu'il envoie). */
export const LIBELLES_JUSTIFICATIFS: { type: TypeJustificatif; label: string; aide: string }[] = [
  { type: "permis", label: "Permis de conduire", aide: "Obligatoire pour valider une location" },
  { type: "identite", label: "Pièce d'identité", aide: "Carte nationale d'identité ou passeport" },
  { type: "photo_vehicule", label: "Photos du véhicule", aide: "État des lieux avant / après" },
  { type: "constat", label: "Constat ou rapport", aide: "En cas de problème sur le véhicule" },
  { type: "facture", label: "Facture / devis", aide: "Justificatif de paiement" },
  { type: "autre", label: "Autre document", aide: "Précisez ci-dessous" },
];

export const storeVide: StoreDemandes = { locations: [], essais: [], sinistres: [] };

function lire(): StoreDemandes {
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return storeVide;
    const parse = JSON.parse(brut) as Partial<StoreDemandes>;
    return {
      locations: parse.locations ?? [],
      essais: parse.essais ?? [],
      sinistres: parse.sinistres ?? [],
    };
  } catch {
    return storeVide;
  }
}

function ecrire(store: StoreDemandes) {
  try {
    window.localStorage.setItem(CLE, JSON.stringify(store));
  } catch {
    // quota dépassé (trop d'aperçus d'images) : on ignore l'écriture
  }
}

/** Taille lisible d'un fichier (ex: 245760 → "240 Ko"). */
export function tailleLisible(octets?: number): string {
  if (!octets) return "";
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
}

/** Nombre de jours entre deux dates (le client les saisit dans le formulaire). */
export function joursEntre(debut: string, fin: string): number {
  const d1 = new Date(debut);
  const d2 = new Date(fin);
  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return 0;
  const diff = Math.round((d2.getTime() - d1.getTime()) / 86400000);
  return diff > 0 ? diff : 0;
}

/**
 * Lit un fichier et renvoie un justificatif prêt à stocker.
 * Les images passent en data URL pour l'aperçu, tant qu'elles ne sont pas
 * trop lourdes ; sinon seul le nom du fichier est conservé (l'upload réel
 * se fera via l'API).
 */
export function justificatifDepuisFichier(
  type: TypeJustificatif,
  libelle: string,
  fichier: File
): Promise<Justificatif> {
  const base: Justificatif = {
    type,
    libelle,
    nomFichier: fichier.name,
    taille: fichier.size,
  };

  const TAILLE_MAX_APERCU = 700 * 1024;
  if (!fichier.type.startsWith("image/") || fichier.size > TAILLE_MAX_APERCU) {
    return Promise.resolve(base);
  }

  return new Promise((resolve) => {
    const lecteur = new FileReader();
    lecteur.onload = () => resolve({ ...base, apercu: String(lecteur.result) });
    lecteur.onerror = () => resolve(base);
    lecteur.readAsDataURL(fichier);
  });
}

/** Hook principal : lit/écrit le store et expose les actions. */
export function useDemandes() {
  const [store, setStore] = useState<StoreDemandes>(() => lire());

  useEffect(() => {
    ecrire(store);
  }, [store]);

  // Synchronise les onglets ouverts
  useEffect(() => {
    const surChangement = () => setStore(lire());
    window.addEventListener("storage", surChangement);
    return () => window.removeEventListener("storage", surChangement);
  }, []);

  const ajouterLocation = useCallback((demande: Omit<DemandeLocation, "id" | "createdAt" | "statut">) => {
    setStore((s) => ({
      ...s,
      locations: [
        {
          ...demande,
          id: s.locations.reduce((max, d) => Math.max(max, d.id), 0) + 1,
          statut: "en_attente",
          createdAt: new Date().toISOString().slice(0, 19),
        },
        ...s.locations,
      ],
    }));
  }, []);

  const ajouterEssai = useCallback((demande: Omit<DemandeEssai, "id" | "createdAt" | "statut">) => {
    setStore((s) => ({
      ...s,
      essais: [
        {
          ...demande,
          id: s.essais.reduce((max, d) => Math.max(max, d.id), 0) + 1,
          statut: "en_attente",
          createdAt: new Date().toISOString().slice(0, 19),
        },
        ...s.essais,
      ],
    }));
  }, []);

  const ajouterSinistre = useCallback((sinistre: Omit<Sinistre, "id" | "createdAt" | "statut">) => {
    setStore((s) => ({
      ...s,
      sinistres: [
        {
          ...sinistre,
          id: s.sinistres.reduce((max, d) => Math.max(max, d.id), 0) + 1,
          statut: "recue",
          createdAt: new Date().toISOString().slice(0, 19),
        },
        ...s.sinistres,
      ],
    }));
  }, []);

  // --- Actions admin ---------------------------------------------------------
  const statuerDemande = useCallback(
    (type: "locations" | "essais", id: number, statut: StatutDemande, motifRefus?: string) => {
      setStore((s) => {
        const liste = s[type].map((d) =>
          d.id === id ? { ...d, statut, motifRefus: statut === "refusee" ? motifRefus : undefined } : d
        );
        return { ...s, [type]: liste } as StoreDemandes;
      });
    },
    []
  );

  const statuerSinistre = useCallback((id: number, statut: StatutSinistre, decision?: string) => {
    setStore((s) => ({
      ...s,
      sinistres: s.sinistres.map((x) => (x.id === id ? { ...x, statut, decision } : x)),
    }));
  }, []);

  return {
    ...store,
    ajouterLocation,
    ajouterEssai,
    ajouterSinistre,
    statuerDemande,
    statuerSinistre,
  };
}
