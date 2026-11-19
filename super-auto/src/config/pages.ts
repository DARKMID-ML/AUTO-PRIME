import { useSyncExternalStore } from "react";
import { enregistrerParametreSite } from "@/config/parametresSite";

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  PAGES ACTIVES DU SITE — configurables par client
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Chaque client n'affiche que les activités qu'il propose réellement.
 * L'accueil et le contact restent toujours actifs ; les autres pages
 * (Vente, Location, Transit, Services, Suivi de demande) se cochent dans
 * Admin → Pages du site (compte `dev`).
 *
 * Le réglage est enregistré côté serveur (`pages`) et réinjecté dans le
 * localStorage au démarrage : tous les visiteurs voient le même menu.
 */

export type ClePage = "vente" | "location" | "transit" | "services" | "mes-demandes";

export interface PageSite {
  cle: ClePage;
  nom: string;
  to: string;
  description: string;
}

/** Pages configurables (l'accueil et le contact sont toujours actifs). */
export const PAGES_SITE: PageSite[] = [
  { cle: "vente", nom: "Vente", to: "/vente", description: "Catalogue des véhicules à vendre." },
  { cle: "location", nom: "Location", to: "/location", description: "Flotte et demandes de location." },
  { cle: "transit", nom: "Transit", to: "/transit", description: "Importation et dédouanement." },
  { cle: "services", nom: "Services", to: "/services", description: "Entretien, expertise et conseil." },
  { cle: "mes-demandes", nom: "Suivi de demande", to: "/mes-demandes", description: "Suivi des demandes côté client." },
];

const CLES = PAGES_SITE.map((page) => page.cle);

export type EtatPages = Record<ClePage, boolean>;

const DEFAUT: EtatPages = {
  vente: true,
  location: true,
  transit: true,
  services: true,
  "mes-demandes": true,
};

const CLE = "autoprime:pages";
const EVENEMENT = "autoprime:pages-updated";

function lire(): EtatPages {
  const etat: EtatPages = { ...DEFAUT };
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return etat;
    const parse = JSON.parse(brut) as Partial<Record<ClePage, unknown>>;
    for (const cle of CLES) {
      if (typeof parse[cle] === "boolean") etat[cle] = parse[cle] as boolean;
    }
  } catch {
    // JSON corrompu : on garde les valeurs par défaut
  }
  return etat;
}

let cache: EtatPages = lire();
const abonnes = new Set<() => void>();

function notifier() {
  cache = lire();
  abonnes.forEach((abonne) => abonne());
}

// Un seul écouteur pour les changements locaux et les autres onglets.
if (typeof window !== "undefined") {
  window.addEventListener(EVENEMENT, notifier);
  window.addEventListener("storage", (evenement) => {
    if (!evenement.key || evenement.key === CLE) notifier();
  });
}

/** État réactif des pages actives. */
export function usePages(): EtatPages {
  return useSyncExternalStore(
    (abonne) => {
      abonnes.add(abonne);
      return () => {
        abonnes.delete(abonne);
      };
    },
    () => cache,
    () => cache,
  );
}

/** Active ou désactive une page, localement puis côté serveur. */
export function setPage(cle: ClePage, actif: boolean) {
  const etat: EtatPages = { ...lire(), [cle]: actif };
  try {
    window.localStorage.setItem(CLE, JSON.stringify(etat));
  } catch {
    // stockage indisponible : le changement reste en mémoire
  }
  notifier();
  void enregistrerParametreSite("pages", etat);
}

/** Rétablit toutes les pages (utile quand un client propose tout). */
export function resetPages() {
  try {
    window.localStorage.removeItem(CLE);
  } catch {
    // rien à supprimer
  }
  notifier();
  void enregistrerParametreSite("pages", null);
}
