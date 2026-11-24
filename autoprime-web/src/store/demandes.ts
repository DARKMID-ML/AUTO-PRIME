import { useCallback, useEffect, useRef, useState } from "react";
import { apiEnvoyer, apiGet } from "@/config/api";
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
 * La source de vérité est l'API Spring Boot :
 *   POST  /api/demandes/location | /api/demandes/essai | /api/sinistres  (client)
 *   GET   /api/demandes/location | /api/demandes/essai | /api/sinistres  (admin)
 *   PATCH /api/…/{id}/statut                                             (admin)
 *
 * Le localStorage reste un miroir : il alimente le suivi client et permet au
 * site de continuer à fonctionner quand le serveur est éteint.
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

/** Message affichable pour une action refusée (ou pour un échec inattendu). */
export function messageRefus(erreur: unknown): string {
  return erreur instanceof Error && erreur.message
    ? erreur.message
    : "L'opération a échoué. Réessayez dans un instant.";
}

/**
 * Écriture d'une demande côté serveur : renvoie l'objet enregistré, ou `null`
 * quand le serveur est injoignable (le store bascule alors en repli local).
 * Tout refus lève une erreur : rien n'est enregistré, ni côté serveur ni
 * localement, et le message du serveur remonte jusqu'à l'écran.
 */
async function enregistrerAuServeur<T>(
  setEnLigne: (enLigne: boolean) => void,
  chemin: string,
  methode: "POST" | "PATCH",
  corps: unknown
): Promise<T | null> {
  const reponse = await apiEnvoyer<T>(chemin, methode, corps);
  if (reponse.etat === "injoignable") {
    setEnLigne(false);
    return null;
  }
  // Le serveur a répondu : il est joignable, même s'il refuse l'écriture.
  setEnLigne(true);
  if (reponse.etat === "refus") throw new Error(reponse.message);
  if (!reponse.donnees) throw new Error("Le serveur n'a pas renvoyé l'objet enregistré.");
  return reponse.donnees;
}

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
 * Lit un fichier et renvoie un justificatif prêt à envoyer.
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

/** Identifiant local suivant (repli hors ligne uniquement). */
const prochainId = (liste: { id: number }[]) =>
  liste.reduce((max, d) => Math.max(max, d.id), 0) + 1;

/** Hook principal : lit/écrit le store et expose les actions. */
export function useDemandes() {
  const [store, setStore] = useState<StoreDemandes>(() => lire());
  const [enLigne, setEnLigne] = useState(false);
  const ref = useRef(store);

  useEffect(() => {
    ref.current = store;
  }, [store]);

  useEffect(() => {
    ecrire(store);
  }, [store]);

  // Synchronise les onglets ouverts
  useEffect(() => {
    const surChangement = () => setStore(lire());
    window.addEventListener("storage", surChangement);
    return () => window.removeEventListener("storage", surChangement);
  }, []);

  // Hydratation depuis l'API. Les listes sont réservées aux comptes connectés :
  // un visiteur reçoit 401 et garde simplement le miroir local.
  useEffect(() => {
    let vivant = true;
    Promise.all([
      apiGet<DemandeLocation[]>("/api/demandes/location"),
      apiGet<DemandeEssai[]>("/api/demandes/essai"),
      apiGet<Sinistre[]>("/api/sinistres"),
    ]).then(([locations, essais, sinistres]) => {
      if (!vivant || (!locations && !essais && !sinistres)) return;
      const serveur: StoreDemandes = {
        locations: locations ?? ref.current.locations,
        essais: essais ?? ref.current.essais,
        sinistres: sinistres ?? ref.current.sinistres,
      };
      setStore(serveur);
      setEnLigne(true);
    });
    return () => {
      vivant = false;
    };
  }, []);

  const ajouterLocation = useCallback(
    async (demande: Omit<DemandeLocation, "id" | "createdAt" | "statut">) => {
      const creee = await enregistrerAuServeur<DemandeLocation>(setEnLigne, "/api/demandes/location", "POST", demande);
      if (creee) {
        setStore((s) => ({ ...s, locations: [creee, ...s.locations] }));
        return creee;
      }
      // Serveur injoignable : la demande reste sur cet appareil.
      const locale: DemandeLocation = {
        ...demande,
        id: prochainId(ref.current.locations),
        statut: "en_attente",
        createdAt: new Date().toISOString().slice(0, 19),
      };
      setStore((s) => ({ ...s, locations: [locale, ...s.locations] }));
      return locale;
    },
    []
  );

  const ajouterEssai = useCallback(
    async (demande: Omit<DemandeEssai, "id" | "createdAt" | "statut">) => {
      const creee = await enregistrerAuServeur<DemandeEssai>(setEnLigne, "/api/demandes/essai", "POST", demande);
      if (creee) {
        setStore((s) => ({ ...s, essais: [creee, ...s.essais] }));
        return creee;
      }
      // Serveur injoignable : la demande reste sur cet appareil.
      const locale: DemandeEssai = {
        ...demande,
        id: prochainId(ref.current.essais),
        statut: "en_attente",
        createdAt: new Date().toISOString().slice(0, 19),
      };
      setStore((s) => ({ ...s, essais: [locale, ...s.essais] }));
      return locale;
    },
    []
  );

  const ajouterSinistre = useCallback(
    async (sinistre: Omit<Sinistre, "id" | "createdAt" | "statut">) => {
      const cree = await enregistrerAuServeur<Sinistre>(setEnLigne, "/api/sinistres", "POST", sinistre);
      if (cree) {
        setStore((s) => ({ ...s, sinistres: [cree, ...s.sinistres] }));
        return cree;
      }
      // Serveur injoignable : le sinistre reste sur cet appareil.
      const local: Sinistre = {
        ...sinistre,
        id: prochainId(ref.current.sinistres),
        statut: "recue",
        createdAt: new Date().toISOString().slice(0, 19),
      };
      setStore((s) => ({ ...s, sinistres: [local, ...s.sinistres] }));
      return local;
    },
    []
  );

  // --- Actions admin ---------------------------------------------------------
  const statuerDemande = useCallback(
    async (type: "locations" | "essais", id: number, statut: StatutDemande, motifRefus?: string) => {
      const chemin = type === "locations" ? "/api/demandes/location" : "/api/demandes/essai";
      const motif = statut === "refusee" ? motifRefus : undefined;
      const maj = await enregistrerAuServeur<DemandeLocation | DemandeEssai>(setEnLigne, `${chemin}/${id}/statut`, "PATCH", {
        statut,
        motifRefus: motif,
      });

      if (maj) {
        if (type === "locations") {
          setStore((s) => ({
            ...s,
            locations: s.locations.map((d) => (d.id === id ? (maj as DemandeLocation) : d)),
          }));
        } else {
          setStore((s) => ({
            ...s,
            essais: s.essais.map((d) => (d.id === id ? (maj as DemandeEssai) : d)),
          }));
        }
        return;
      }

      // Serveur injoignable : décision locale (visible sur cet appareil seulement).
      setStore((s) => {
        const liste = s[type].map((d) => (d.id === id ? { ...d, statut, motifRefus: motif } : d));
        return { ...s, [type]: liste } as StoreDemandes;
      });
    },
    []
  );

  const statuerSinistre = useCallback(
    async (id: number, statut: StatutSinistre, decision?: string) => {
      const maj = await enregistrerAuServeur<Sinistre>(setEnLigne, `/api/sinistres/${id}/statut`, "PATCH", {
        statut,
        decision,
      });
      if (maj) {
        setStore((s) => ({
          ...s,
          sinistres: s.sinistres.map((x) => (x.id === id ? maj : x)),
        }));
        return;
      }
      // Serveur injoignable : décision locale (visible sur cet appareil seulement).
      setStore((s) => ({
        ...s,
        sinistres: s.sinistres.map((x) => (x.id === id ? { ...x, statut, decision } : x)),
      }));
    },
    []
  );

  return {
    ...store,
    enLigne,
    ajouterLocation,
    ajouterEssai,
    ajouterSinistre,
    statuerDemande,
    statuerSinistre,
  };
}
