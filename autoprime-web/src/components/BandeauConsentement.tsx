import { useState } from "react";
import {
  analyticsConfiguree,
  enregistrerConsentement,
  lireConsentement,
  type Consentement,
} from "@/config/analytics";

/**
 * Bandeau de consentement à la mesure d'audience (PostHog).
 *
 * Affiché uniquement sur le site public, tant que le visiteur n'a pas
 * répondu, et seulement si une clé PostHog est configurée. Le choix est
 * conservé dans le localStorage : aucune donnée n'est envoyée sans
 * « Accepter ».
 */
export default function BandeauConsentement() {
  const [choix, setChoix] = useState<Consentement>(() => lireConsentement());

  if (!analyticsConfiguree || choix !== null) return null;

  function repondre(valeur: "accepte" | "refuse") {
    enregistrerConsentement(valeur);
    setChoix(valeur);
  }

  return (
    <section
      aria-label="Consentement à la mesure d'audience"
      className="fixed inset-x-0 bottom-0 z-[90] p-4 sm:p-6"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-border-light bg-white shadow-premium p-5 sm:p-6 animate-fade-up">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <p className="flex-1 text-sm text-text-secondary">
            <span className="font-semibold text-text-primary">
              Mesure d'audience et enregistrement de session.
            </span>{" "}
            Avec votre accord, nous utilisons PostHog pour comprendre l'usage du
            site et améliorer nos pages. Les champs de formulaire sont masqués
            dans les enregistrements. Vous pouvez refuser : le site fonctionne
            de la même façon.
          </p>
          <div className="flex shrink-0 gap-3">
            <button
              type="button"
              onClick={() => repondre("refuse")}
              className="px-5 py-2.5 rounded-xl border border-border-standard font-semibold text-text-secondary hover:bg-brand-light transition-colors"
            >
              Refuser
            </button>
            <button
              type="button"
              onClick={() => repondre("accepte")}
              className="px-5 py-2.5 rounded-xl bg-brand-red text-white font-semibold hover:bg-brand-red-dark transition-colors"
            >
              Accepter
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
