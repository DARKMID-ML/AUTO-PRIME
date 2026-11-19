import { useEffect, useState } from "react";
import { enregistrerParametreSite } from "@/config/parametresSite";

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  EN-TÊTES DE PAGE — contenu éditable depuis Admin → Apparence du site
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Chaque page intérieure possède le même en-tête à trois niveaux :
 *
 *   surtitre  → le mot rubrique, en petites capitales (« Le parc »)
 *   titre     → le titre de la page
 *   chapeau   → une phrase d'introduction
 *
 * Les valeurs ci-dessous sont le texte d'origine livré avec le template.
 * L'administration peut les remplacer ; la personnalisation est conservée dans
 * le localStorage de l'appareil, comme le thème (voir `config/theme.ts`).
 * Quand le backend sera branché, `setPageHeader` deviendra un PATCH d'API.
 */

const CLE = "autoprime:page-headers";
const EVENEMENT = "autoprime:headers-updated";

/** Pages dont l'en-tête est modifiable. */
export const pagesEntetes = {
  vente: "Vente",
  location: "Location",
  transit: "Transit",
  services: "Services",
  contact: "Contact",
  "mes-demandes": "Mes demandes",
} as const;

export type PageHeaderKey = keyof typeof pagesEntetes;

export interface PageHeaderContent {
  /** Petite ligne au-dessus du titre (rubrique). */
  surtitre: string;
  /** Titre principal de la page. */
  titre: string;
  /** Phrase d'introduction sous le titre. */
  chapeau: string;
}

/** Texte livré avec le template. */
export const entetesParDefaut: Record<PageHeaderKey, PageHeaderContent> = {
  vente: {
    surtitre: "Le parc",
    titre: "Véhicules à la vente",
    chapeau:
      "Chaque véhicule est contrôlé, révisé et prêt à rouler. Filtrez par marque, année, carburant ou ville pour trouver celui qui vous correspond.",
  },
  location: {
    surtitre: "Location",
    titre: "Louer sans surprise",
    chapeau:
      "Des véhicules récents, un contrat clair, un état des lieux photographié. À la journée, à la semaine ou au mois.",
  },
  transit: {
    surtitre: "Transit & importation",
    titre: "Importez votre véhicule en toute sérénité",
    chapeau:
      "De la recherche à la livraison au Mali, nous gérons l'importation de bout en bout : achat, formalités, fret maritime et dédouanement.",
  },
  services: {
    surtitre: "Nos services",
    titre: "Ce que nous pouvons vous offrir",
    chapeau: "Une gamme complète de services dédiés à l'automobile au Mali, du premier essai à l'entretien.",
  },
  contact: {
    surtitre: "Contact",
    titre: "Nous contacter",
    chapeau: "Une question, un projet ? Notre équipe vous répond sous 24 heures ouvrées.",
  },
  "mes-demandes": {
    surtitre: "Suivi",
    titre: "Mes demandes",
    chapeau: "Retrouvez ici les demandes de location, d'essai et de sinistre déposées depuis cet appareil.",
  },
};

type StoreEntetes = Partial<Record<PageHeaderKey, Partial<PageHeaderContent>>>;

const texteValide = (valeur: unknown): string | undefined =>
  typeof valeur === "string" ? valeur : undefined;

function lireStore(): StoreEntetes {
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return {};
    const parse = JSON.parse(brut) as Record<string, unknown>;
    const resultat: StoreEntetes = {};
    for (const cle of Object.keys(pagesEntetes) as PageHeaderKey[]) {
      const entree = parse[cle];
      if (!entree || typeof entree !== "object") continue;
      const { surtitre, titre, chapeau } = entree as Record<string, unknown>;
      resultat[cle] = {
        surtitre: texteValide(surtitre),
        titre: texteValide(titre),
        chapeau: texteValide(chapeau),
      };
    }
    return resultat;
  } catch {
    return {};
  }
}

function ecrireStore(store: StoreEntetes) {
  try {
    window.localStorage.setItem(CLE, JSON.stringify(store));
    window.dispatchEvent(new Event(EVENEMENT));
    void enregistrerParametreSite("entetes", Object.keys(store).length > 0 ? store : null);
  } catch {
    // stockage plein ou désactivé : on garde au moins l'affichage courant
  }
}

const nettoyer = (contenu: PageHeaderContent): PageHeaderContent => ({
  surtitre: contenu.surtitre.trim(),
  titre: contenu.titre.trim(),
  chapeau: contenu.chapeau.trim(),
});

/** Contenu effectif d'un en-tête (personnalisation par-dessus le texte livré). */
export function getPageHeader(cle: PageHeaderKey): PageHeaderContent {
  const defaut = entetesParDefaut[cle];
  const perso = lireStore()[cle] ?? {};
  const fusion: PageHeaderContent = {
    surtitre: perso.surtitre?.trim() || defaut.surtitre,
    titre: perso.titre?.trim() || defaut.titre,
    chapeau: perso.chapeau?.trim() || defaut.chapeau,
  };
  return fusion;
}

/** Enregistre une modification partielle d'un en-tête. */
export function setPageHeader(cle: PageHeaderKey, patch: Partial<PageHeaderContent>) {
  const store = lireStore();
  const actuel = getPageHeader(cle);
  store[cle] = nettoyer({ ...actuel, ...patch });
  ecrireStore(store);
}

/** Rétablit le texte livré pour une page. */
export function resetPageHeader(cle: PageHeaderKey) {
  const store = lireStore();
  delete store[cle];
  ecrireStore(store);
}

/** Rétablit tous les en-têtes. */
export function resetAllPageHeaders() {
  ecrireStore({});
}

/** Abonnement partagé par tous les composants qui lisent les en-têtes. */
function abonner(callback: () => void) {
  window.addEventListener(EVENEMENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENEMENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** Contenu de l'en-tête d'une page, recalculé à chaque modification. */
export function usePageHeader(cle: PageHeaderKey): PageHeaderContent {
  const [contenu, setContenu] = useState(() => getPageHeader(cle));

  useEffect(() => {
    const maj = () => setContenu(getPageHeader(cle));
    maj();
    return abonner(maj);
  }, [cle]);

  return contenu;
}
