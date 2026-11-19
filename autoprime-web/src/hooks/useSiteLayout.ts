import { useSyncExternalStore } from "react";
import { getThemeSettings, type SiteLayout } from "@/config/theme";

/**
 * Composition de site actuellement active (Admin → Apparence du site).
 *
 * Le choix est conservé dans le localStorage par `config/theme.ts`. Ces hooks
 * s'abonnent aux changements pour que la navbar, le pied de page et les pages
 * se recomposent immédiatement quand l'administrateur modifie ses réglages —
 * y compris lorsque le réglage change dans un autre onglet (« storage »).
 */
const abonner = (callback: () => void) => {
  window.addEventListener("autoprime:theme-updated", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("autoprime:theme-updated", callback);
    window.removeEventListener("storage", callback);
  };
};

const repli = (): SiteLayout => "signature";

/** Composition de base : pilote l'accueil, les cartes et les en-têtes. */
const lireSite = (): SiteLayout => getThemeSettings().siteLayout;

/** Composition effective de la navbar : style personnalisé si défini, sinon composition du site. */
const lireNavbar = (): SiteLayout => {
  const settings = getThemeSettings();
  return settings.navbarStyle ?? settings.siteLayout;
};

/** Composition effective du pied de page : style personnalisé si défini, sinon composition du site. */
const lireFooter = (): SiteLayout => {
  const settings = getThemeSettings();
  return settings.footerStyle ?? settings.siteLayout;
};

export function useSiteLayout(): SiteLayout {
  return useSyncExternalStore(abonner, lireSite, repli);
}

/** Style de navbar à rendre : permet un style indépendant de la composition. */
export function useNavbarLayout(): SiteLayout {
  return useSyncExternalStore(abonner, lireNavbar, repli);
}

/** Style de pied de page à rendre : permet un style indépendant de la composition. */
export function useFooterLayout(): SiteLayout {
  return useSyncExternalStore(abonner, lireFooter, repli);
}

/** Composition effective de la modale de détail véhicule : style personnalisé si défini, sinon composition du site. */
const lireModale = (): SiteLayout => {
  const settings = getThemeSettings();
  return settings.modalStyle ?? settings.siteLayout;
};

export function useModalLayout(): SiteLayout {
  return useSyncExternalStore(abonner, lireModale, repli);
}
