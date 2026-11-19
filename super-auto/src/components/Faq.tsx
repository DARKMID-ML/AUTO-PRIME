import { useState } from "react"
import { faqImportation, type QuestionReponse } from "@/data/faq"

/**
 * ══════════════════════════════════════════════════════════════════════
 *  FAQ ACCORDÉON — questions fréquentes de l'importation (page Transit)
 * ══════════════════════════════════════════════════════════════════════
 *
 * Une seule réponse ouverte à la fois ; accessible au clavier
 * (boutons + aria-expanded + aria-controls).
 */
export default function Faq({
  questions = faqImportation,
  titre = "Questions fréquentes",
  sousTitre = "Tout ce qu'il faut savoir avant de lancer votre importation.",
}: {
  questions?: QuestionReponse[]
  titre?: string
  sousTitre?: string
}) {
  const [ouvert, setOuvert] = useState<number | null>(1)

  return (
    <section className="py-16 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <p className="text-brand-red text-[11px] font-bold uppercase tracking-[0.24em] text-center">
          FAQ
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-text-primary text-center mt-1">
          {titre}
        </h2>
        <p className="text-text-secondary text-center mt-2 mb-10">{sousTitre}</p>

        <div className="divide-y divide-border-light border-y border-border-light">
          {questions.map((question) => {
            const estOuvert = ouvert === question.id
            return (
              <article key={question.id}>
                <button
                  type="button"
                  onClick={() => setOuvert(estOuvert ? null : question.id)}
                  aria-expanded={estOuvert}
                  aria-controls={`faq-reponse-${question.id}`}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left group"
                >
                  <span
                    className={`font-bold text-text-primary group-hover:text-brand-red transition-colors ${
                      estOuvert ? "text-brand-red" : ""
                    }`}
                  >
                    {question.question}
                  </span>
                  <span
                    className={`material-symbols-outlined text-2xl text-brand-red flex-shrink-0 transition-transform duration-300 ${
                      estOuvert ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  >
                    expand_more
                  </span>
                </button>

                <div
                  id={`faq-reponse-${question.id}`}
                  hidden={!estOuvert}
                  className="pb-6 pr-10 text-text-secondary leading-relaxed"
                >
                  {question.reponse}
                </div>
              </article>
            )
          })}
        </div>

        <p className="text-center text-sm text-text-secondary mt-8">
          Une autre question ?{" "}
          <a href="#devis" className="text-brand-blue font-bold underline underline-offset-2 hover:text-brand-red">
            Demandez votre devis
          </a>{" "}
          — notre équipe répond sous 24 h.
        </p>
      </div>
    </section>
  )
}
