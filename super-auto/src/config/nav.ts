/**
 * Navigation principale du site, partagée par les trois compositions.
 *
 * Chaque composition (Signature, Éditorial, Catalogue) habille ces liens
 * différemment : pilule flottante, manchette de journal ou barre utilitaire.
 * Les liens des pages désactivées pour le client sont retirés du menu.
 */
import { usePages, type ClePage } from "@/config/pages";

export interface LienNavigation {
  name: string;
  to: string;
  /** Page à activer pour afficher le lien (absent = toujours affiché). */
  page?: ClePage;
}

export const LIENS_NAVIGATION: LienNavigation[] = [
  { name: "Accueil", to: "/" },
  { name: "Vente", to: "/vente", page: "vente" },
  { name: "Location", to: "/location", page: "location" },
  { name: "Transit", to: "/transit", page: "transit" },
  { name: "Services", to: "/services", page: "services" },
  { name: "Contact", to: "/contact" },
];

/** Liens visibles pour le client courant (réactif). */
export function useNavLinks(): LienNavigation[] {
  const pages = usePages();
  return LIENS_NAVIGATION.filter((lien) => !lien.page || pages[lien.page]);
}

/** Bouton d'action affiché à droite de la barre de navigation. */
export const NAV_CTA: LienNavigation = { name: "Essai gratuit", to: "/contact" };
