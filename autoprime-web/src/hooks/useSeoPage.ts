/**
 * SEO par page : met à jour le titre et les métadonnées à l'affichage
 * de chaque page publique. L'effet se rejoue quand le véhicule change
 * (fiche produit), ce qui fait varier titre et description dynamiquement.
 */
import { useEffect } from "react"
import { SITE } from "@/config/site"

export function useSeoPage(titre: string, description: string) {
  useEffect(() => {
    const titreComplet = titre.includes(SITE.nom) ? titre : `${titre} — ${SITE.nom}`

    document.title = titreComplet

    const metaDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (metaDescription) metaDescription.content = description

    // Open Graph / Twitter : contenu dynamique si les balises existent
    const ogTitre = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')
    if (ogTitre) ogTitre.content = titreComplet
    const ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]')
    if (ogDescription) ogDescription.content = description
  }, [titre, description])
}
