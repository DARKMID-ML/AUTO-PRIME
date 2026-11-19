/**
 * ════════════════════════════════════════════════════════════════════
 *  ANALYTICS — PostHog (mesure d'audience + Session Replay)
 * ════════════════════════════════════════════════════════════════════
 *
 * Un seul point d'entrée pour l'analytique du site public :
 *
 *   • `initialiserAnalytics()`  — appelé au démarrage (main.tsx) ; ne fait
 *     rien si aucun consentement n'a été donné ou si la clé est absente.
 *   • `suivrePage(chemin)`      — page vue à chaque navigation (SPA).
 *   • `capturer(nom, props)`    — évènement de parcours (demande envoyée…).
 *   • `identifierUtilisateur()` / `reinitialiserUtilisateur()` — session admin.
 *   • `lireConsentement()` / `enregistrerConsentement()` — bandeau de consentement.
 *
 * ⚠️ Consentement d'abord : tant que `lireConsentement()` ne vaut pas
 *    "accepte", aucun client PostHog n'est créé, aucun cookie n'est posé et
 *    aucun enregistrement de session n'a lieu (RGPD). Le choix est conservé
 *    dans le localStorage sous `autoprime:consentement`.
 *
 * ⚠️ Replay masqué : tous les champs de saisie sont masqués
 *    (`maskAllInputs`), les blocs marqués `data-posthog-block` (données
 *    clients de l'admin) ne sont jamais enregistrés, et l'enregistrement est
 *    coupé sur les écrans `/admin`.
 *
 * La clé projet est publique (elle part dans le bundle) : c'est
 * `VITE_POSTHOG_KEY` dans `.env`. Ne jamais y mettre de secret serveur.
 * Sans clé, toute cette couche est inerte : le site fonctionne à l'identique.
 */
import posthog from "posthog-js";

const env = import.meta.env as Record<string, string | undefined>;

/** Clé projet PostHog (vide → analytique désactivée). */
const CLE_PROJET = env.VITE_POSTHOG_KEY?.trim() ?? "";

/**
 * Hôte d'ingestion. Europe par défaut (données hébergées dans l'UE) ;
 * `VITE_POSTHOG_HOST=https://us.i.posthog.com` pour la région US.
 */
const HOTE = env.VITE_POSTHOG_HOST?.trim() || "https://eu.i.posthog.com";

/** Clé de stockage du choix de consentement. */
export const CLE_CONSENTEMENT = "autoprime:consentement";

export type Consentement = "accepte" | "refuse" | null;

/** Vrai si une clé PostHog est configurée (sinon rien n'est chargé). */
export const analyticsConfiguree = CLE_PROJET !== "";

/** Choix de consentement enregistré, ou `null` si l'utilisateur n'a pas répondu. */
export function lireConsentement(): Consentement {
  try {
    const valeur = window.localStorage.getItem(CLE_CONSENTEMENT);
    return valeur === "accepte" || valeur === "refuse" ? valeur : null;
  } catch {
    return null;
  }
}

let clientPret = false;

/** Crée le client PostHog (une seule fois, seulement après consentement). */
function demarrerClient(): void {
  if (clientPret || !analyticsConfiguree) return;
  clientPret = true;
  posthog.init(CLE_PROJET, {
    api_host: HOTE,
    // Pas de profil personne pour un visiteur anonyme : uniquement les
    // utilisateurs identifiés (session admin) en ont un.
    person_profiles: "identified_only",
    // Les pages vues sont envoyées par `suivrePage` (navigation React Router),
    // sinon elles seraient doublées à chaque changement de route.
    capture_pageview: false,
    capture_pageleave: true,
    // Session Replay : les champs de saisie sont masqués, et les blocs de
    // données clients sont exclus de l'enregistrement.
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: "[data-posthog-mask]",
      blockSelector: "[data-posthog-block]",
    },
  });
}

/** Vrai si l'utilisateur a accepté la mesure et si une clé est configurée. */
function mesureActive(): boolean {
  return analyticsConfiguree && lireConsentement() === "accepte";
}

/** Au démarrage : active la mesure si le consentement a déjà été donné. */
export function initialiserAnalytics(): void {
  if (!mesureActive()) return;
  demarrerClient();
}

/**
 * Enregistre le choix de l'utilisateur.
 *   • accepte → démarre la mesure et l'enregistrement de session
 *   • refuse  → coupe tout (aucune donnée n'est envoyée)
 */
export function enregistrerConsentement(choix: Exclude<Consentement, null>): void {
  try {
    window.localStorage.setItem(CLE_CONSENTEMENT, choix);
  } catch {
    // stockage désactivé : la mesure reste coupée
  }

  if (choix === "accepte") {
    demarrerClient();
    if (clientPret) {
      posthog.opt_in_capturing({ captureEventName: false });
      posthog.startSessionRecording();
    }
    return;
  }

  if (clientPret) {
    posthog.stopSessionRecording();
    posthog.opt_out_capturing();
  }
}

/**
 * Page vue. Appelée à chaque changement de route.
 * L'enregistrement de session est suspendu dans l'administration, qui
 * affiche des données clients (messages, demandes, devis).
 */
export function suivrePage(chemin: string): void {
  if (!mesureActive()) return;
  demarrerClient();
  if (!clientPret) return;

  if (chemin.startsWith("/admin")) {
    posthog.stopSessionRecording();
  } else {
    posthog.startSessionRecording();
  }
  posthog.capture("$pageview", { chemin });
}

/** Évènement de parcours (les replays y sont rattachés automatiquement). */
export function capturer(evenement: string, proprietes?: Record<string, unknown>): void {
  if (!mesureActive()) return;
  demarrerClient();
  if (!clientPret) return;
  posthog.capture(evenement, proprietes);
}

/** Connexion admin : rattache la suite du parcours au compte connecté. */
export function identifierUtilisateur(identifiant: string, proprietes?: Record<string, unknown>): void {
  if (!mesureActive()) return;
  demarrerClient();
  if (!clientPret) return;
  posthog.identify(identifiant, proprietes);
}

/** Déconnexion : dissocie la session PostHog du compte. */
export function reinitialiserUtilisateur(): void {
  if (!clientPret) return;
  posthog.reset();
}
