import { useEffect, useRef, useState, type ReactNode } from "react"

// Props du composant : un contenu à afficher progressivement au scroll
interface RevealProps {
  children: ReactNode
  // Classes Tailwind additionnelles (grille, marges...)
  className?: string
  // Délai avant l'animation (en ms) — permet d'écarter les cartes
  delay?: number
}

// Enveloppe un bloc de page et le fait apparaître lorsqu'il entre dans le viewport.
// Respecte prefers-reduced-motion via la règle CSS .reveal dans index.css.
export default function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  // Repli sécurisé : sans IntersectionObserver, le contenu est visible d'emblée
  const [visible, setVisible] = useState(
    () => typeof IntersectionObserver === "undefined"
  )

  useEffect(() => {
    // Pas d'observer possible : rien à faire (déjà visible)
    if (typeof IntersectionObserver === "undefined") return

    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            // Une seule fois : on n'observe plus après l'apparition
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={elementRef}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}