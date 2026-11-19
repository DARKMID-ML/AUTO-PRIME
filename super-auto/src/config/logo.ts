import { useSyncExternalStore } from "react";
import { SITE } from "./site";
import { enregistrerParametreSite } from "./parametresSite";

/**
 * ════════════════════════════════════════════════════════════════════
 *  LOGO DE L'ENTREPRISE — remplaçable depuis Admin → Entreprise
 * ════════════════════════════════════════════════════════════════════
 *
 * Repli par défaut : les fichiers du dossier `public/`
 * (configurés via .env → VITE_SITE_LOGO, VITE_SITE_LOGO_INVERT).
 *
 * Le choix de l'administrateur (data URL de l'image sélectionnée) est
 * conservé dans le localStorage ; les composants s'abonnent, comme pour
 * le thème, pour se recomposer immédiatement.
 */

const CLE = "admin:logo";
const EVENEMENT = "autoprime:logo-updated";

export interface LogoConfig {
  /** Logo sur fond clair (navbar). */
  normal: string;
  /** Logo sur fond sombre (footer sombre, sidebar admin). */
  invert: string;
}

const replis: LogoConfig = {
  normal: SITE.logo,
  invert: SITE.logoInvert,
};

/** Cache du dernier instantané parseé — getSnapshot doit être stable. */
let cache: LogoConfig | null = null;

const abonner = (callback: () => void) => {
  const surChangement = () => {
    cache = null; // invalide le cache avant de re-render
    callback();
  };
  window.addEventListener(EVENEMENT, surChangement);
  window.addEventListener("storage", surChangement);
  return () => {
    window.removeEventListener(EVENEMENT, surChangement);
    window.removeEventListener("storage", surChangement);
  };
};

function lireConfig(): LogoConfig {
  if (cache) return cache;
  let valeur: LogoConfig = replis;
  try {
    const brut = window.localStorage.getItem(CLE);
    if (brut) {
      const parse = JSON.parse(brut) as Partial<LogoConfig>;
      valeur = {
        normal: typeof parse.normal === "string" && parse.normal ? parse.normal : replis.normal,
        invert: typeof parse.invert === "string" && parse.invert ? parse.invert : replis.invert,
      };
    }
  } catch {
    // JSON corrompu → repli
  }
  cache = valeur;
  return cache;
}

function repliInitial(): LogoConfig {
  return replis;
}

/** Intercepte le réglage courant du logo. */
export function useLogos(): LogoConfig {
  return useSyncExternalStore(abonner, lireConfig, repliInitial);
}

/** Remplace une variante (data URL du fichier choisi). */
export function setLogo(partiel: Partial<LogoConfig>) {
  try {
    const courant = lireConfig();
    const suivant = { ...courant, ...partiel };
    window.localStorage.setItem(CLE, JSON.stringify(suivant));
    window.dispatchEvent(new Event(EVENEMENT));
    void enregistrerParametreSite("logo", suivant);
  } catch {
    // data URL trop lourde pour le localStorage : on ignore silencieusement
  }
}

/** Retour aux fichiers du dossier public (.env). */
export function resetLogo() {
  try {
    window.localStorage.removeItem(CLE);
    window.dispatchEvent(new Event(EVENEMENT));
    void enregistrerParametreSite("logo", null);
  } catch {
    // ignore
  }
}
