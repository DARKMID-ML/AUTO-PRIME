import { useEffect, useRef, useState } from "react"
import { useVehicules } from "@/hooks/useVehicules"
import { useEntreprise } from "@/config/entreprise"
import { useSiteLayout } from "@/hooks/useSiteLayout"
import { type Vehicule } from "@/types/vehicule"

/**
 * ══════════════════════════════════════════════════════════════════════
 *  BANDE DE CHIFFRES CLÉS — compteurs qui s'animent à l'apparition
 * ══════════════════════════════════════════════════════════════════════
 *
 * Trois habillages, comme toutes les sections du site :
 *   - Signature : bande sombre/prestige (chiffres resize en rouge)
 *   - Catalogue : grille façon tableau d'inventaire
 *
 * Le compteur respecte prefers-reduced-motion (affichage immédiat).
 */

interface Chiffre {
  valeur: number
  /** Apposé après le nombre ("+", "%"…). */
  suffixe?: string
  libelle: string
  icone: string
}

/** Extrait le nombre d'années du texte « plus de 15 ans ». */
function anciennete(entreprise: ReturnType<typeof useEntreprise>): number {
  const trouve = entreprise.anciennete.match(/\d+/)
  return trouve ? Number(trouve[0]) : 15
}

/** Construit la liste des chiffres clés (catalogue = valeur dynamique). */
function listeChiffres(vehicules: Vehicule[], entreprise: ReturnType<typeof useEntreprise>): Chiffre[] {
  return [
    {
      valeur: anciennete(entreprise),
      suffixe: "+",
      libelle: "années d'expérience",
      icone: "workspace_premium",
    },
    {
      valeur: vehicules.length,
      libelle: "véhicules au catalogue",
      icone: "directions_car",
    },
    {
      valeur: 4,
      libelle: "continents d'importation",
      icone: "public",
    },
    {
      valeur: 500,
      suffixe: "+",
      libelle: "clients accompagnés",
      icone: "sentiment_satisfied",
    },
  ]
}

export default function SectionChiffres() {
  const layout = useSiteLayout()
  const { vehicules } = useVehicules()
  const entreprise = useEntreprise()

  const chiffres = listeChiffres(vehicules, entreprise)

  const [visible, setVisible] = useState(false)
  const bande = useRef<HTMLElement | null>(null)

  const cles = chiffres.map((c) => c.valeur).join(",")
  const cibles = cles.split(",").map(Number)
  // Respecte « animations réduites » sans passer par un setState dans un effet.
  const mouvementReduit =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches

  // Apparition : démarre les compteurs quand la bande entre dans l'écran.
  useEffect(() => {
    const element = bande.current
    if (!element) return
    const observateur = new IntersectionObserver(
      (entrees) => {
        entrees.forEach((entree) => {
          if (entree.isIntersecting) {
            setVisible(true)
            observateur.disconnect()
          }
        })
      },
      { threshold: 0.3 },
    )
    observateur.observe(element)
    return () => observateur.disconnect()
  }, [])

  const [actuels, setActuels] = useState<number[]>(() => chiffres.map(() => 0))

  useEffect(() => {
    if (!visible || mouvementReduit) return
    const ciblesAnimation = cles.split(",").map(Number)
    let debut: number | null = null
    const duree = 1300
    let identifiant = 0
    const animer = (horodatage: number) => {
      if (debut === null) debut = horodatage
      const progression = Math.min(1, (horodatage - debut) / duree)
      const relachee = 1 - Math.pow(1 - progression, 3)
      setActuels(ciblesAnimation.map((cible) => Math.round(cible * relachee)))
      if (progression < 1) identifiant = requestAnimationFrame(animer)
    }
    identifiant = requestAnimationFrame(animer)
    return () => cancelAnimationFrame(identifiant)
  }, [visible, cles, mouvementReduit])

  return (
    <section
      ref={bande}
      className={
        layout === "catalogue"
            ? "py-14 px-4 bg-white border-y border-black/10"
            : layout === "atelier"
              ? "py-16 px-5 md:px-10 bg-[color:var(--at-ink)] text-[color:var(--at-paper)]"
              : "py-16 px-4 md:px-8 relative overflow-hidden bg-gradient-to-r from-brand-blue-dark to-[#0a1020]"
      }
    >
      {layout === "signature" && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(196,30,58,0.22),transparent_55%)]" aria-hidden="true" />
      )}

      <div className="max-w-6xl mx-auto">
        <p
          className={`text-[11px] font-bold uppercase tracking-[0.24em] mb-8 text-center ${
            layout === "signature" || layout === "atelier" ? "text-white/55" : "text-brand-red"
          }`}
        >
          L'agence en chiffres
        </p>

        <dl
          className={
            layout === "catalogue"
              ? "grid grid-cols-2 md:grid-cols-4 border border-black/10 divide-x divide-y md:divide-y-0 divide-black/10 divide-x-reverse text-center"
                : layout === "atelier"
                  ? "grid grid-cols-2 md:grid-cols-4 border border-white/15 divide-x divide-y divide-white/15 md:divide-y-0"
                  : "grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4"
          }
        >
          {chiffres.map((chiffre, index) => {
            const nombres = layout === "signature"

            return (
              <div
                key={chiffre.libelle}
                className={
                  nombres
                    ? "text-center px-2 py-6 rounded-2xl bg-white/5 border border-white/12 backdrop-blur-sm"
                      : layout === "atelier"
                        ? "text-center px-2 py-6"
                        : "text-center px-2 py-6"
                }
              >
                <dt className="sr-only">{chiffre.libelle}</dt>
                <dd
                  className={
                    nombres
                      ? "font-heading text-4xl md:text-5xl font-extrabold text-brand-red leading-none tabular-nums"
                        : layout === "atelier"
                          ? "font-heading text-4xl md:text-5xl font-extrabold text-brand-red leading-none tabular-nums"
                          : "text-4xl md:text-5xl font-extrabold text-brand-red leading-none tabular-nums"
                  }
                >
                  {(mouvementReduit ? cibles : actuels)[index]?.toLocaleString("fr-FR")}
                  {chiffre.suffixe}
                </dd>

                <p
                  className={
                    nombres
                      ? "mt-3 text-[12px] uppercase tracking-[0.16em] text-white/70 font-semibold"
                        : layout === "atelier"
                          ? "mt-3 text-[11px] uppercase tracking-[0.14em] text-white/55 font-semibold"
                          : "mt-3 text-[12px] uppercase tracking-[0.14em] text-text-muted font-semibold"
                  }
                >
                  <span
                    className={`material-symbols-outlined align-middle mr-1.5 text-lg ${
                      layout === "signature" ? "text-white/50" : "text-brand-red"                    }`}
                    aria-hidden="true"
                  >
                    {chiffre.icone}
                  </span>
                  {chiffre.libelle}
                </p>
              </div>
            )
          })}
        </dl>
      </div>
    </section>
  )
}
