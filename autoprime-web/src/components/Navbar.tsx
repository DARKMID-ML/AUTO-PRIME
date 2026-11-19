import { useNavbarLayout } from "@/hooks/useSiteLayout";
import NavbarSignature from "./navbars/NavbarSignature";
import NavbarAtelier from "./navbars/NavbarAtelier";
import NavbarCatalogue from "./navbars/NavbarCatalogue";

/**
 * Barre de navigation du site public.
 *
 * La composition choisie dans Admin → Apparence du site change entièrement la
 * barre : pilule de verre (Signature), barre d'atelier (Atelier) ou barre
 * utilitaire avec recherche (Catalogue). Un style de navbar personnalisé
 * prend le dessus sur la composition.
 */
export default function Navbar() {
  const layout = useNavbarLayout();

  if (layout === "atelier") return <NavbarAtelier />;
  if (layout === "catalogue") return <NavbarCatalogue />;
  return <NavbarSignature />;
}
