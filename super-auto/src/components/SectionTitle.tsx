// Props du composant
interface SectionTitleProps {
  titre: string       // Titre principal (obligatoire)
  sousTitre?: string  // Sous-titre optionnel
  kicker?: string     // Petites capitales au-dessus du titre (optionnel)
  sombre?: boolean    // Version sur fond sombre (texte blanc)
}

// Composant pour afficher un titre de section centré, style premium
export default function SectionTitle({ titre, sousTitre, kicker, sombre = false }: SectionTitleProps) {
  return (
    // Conteneur centré avec marge en bas
    <div className="text-center mb-12">
      {/* Kicker : petites capitales avec traits qui pulsent */}
      {kicker && (
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-red mb-4">
          <span className="h-px w-8 bg-brand-red origin-left animate-line-pulse" aria-hidden="true" />
          {kicker}
          <span className="h-px w-8 bg-brand-red origin-right animate-line-pulse" aria-hidden="true" />
        </span>
      )}

      {/* Titre principal en gros et gras */}
      <h2 className={`text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 ${sombre ? "text-white" : "text-text-primary"}`}>
        {titre}
      </h2>
      
      {/* Sous-titre optionnel */}
      {sousTitre && (
        <p className={`text-lg max-w-2xl mx-auto leading-relaxed ${sombre ? "text-gray-300" : "text-text-secondary"}`}>
          {sousTitre}
        </p>
      )}
    </div>
  )
}