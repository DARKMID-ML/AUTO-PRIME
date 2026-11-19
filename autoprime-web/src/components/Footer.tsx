import { useFooterLayout } from "@/hooks/useSiteLayout";
import FooterSignature from "./footers/FooterSignature";
import FooterAtelier from "./footers/FooterAtelier";
import FooterCatalogue from "./footers/FooterCatalogue";

/**
 * Pied de page du site public.
 *
 * Comme la barre de navigation, il change entièrement selon la composition :
 * nocturne (Signature), atelier (Atelier) ou plan utilitaire (Catalogue).
 * Un style de pied de page personnalisé prend le dessus sur la composition.
 */
export default function Footer() {
  const layout = useFooterLayout();

  if (layout === "atelier") return <FooterAtelier />;
  if (layout === "catalogue") return <FooterCatalogue />;
  return <FooterSignature />;
}
