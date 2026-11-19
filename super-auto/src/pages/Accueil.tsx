import { useSiteLayout } from "@/hooks/useSiteLayout"
import HomeSignature from "./home/HomeSignature"
import HomeAtelier from "./home/HomeAtelier"
import HomeCatalogue from "./home/HomeCatalogue"

/**
 * Page d'accueil publique.
 *
 * La composition choisie dans Admin → Apparence du site décide de tout :
 * showroom nocturne (Signature), atelier technique (Atelier) ou inventaire
 * avec moteur de recherche (Catalogue).
 */
export default function Accueil() {
  const layout = useSiteLayout()

  if (layout === "atelier") return <HomeAtelier />
  if (layout === "catalogue") return <HomeCatalogue />
  return <HomeSignature />
}
