/**
 * ════════════════════════════════════════════════════════════════════════════
 *  CONFIGURATION DU TEMPLATE — à adapter pour chaque client
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Deux fichiers seulement à toucher pour rebrander le site :
 *
 *   1. `.env`                  → les textes simples (nom, baseline, téléphones,
 *                                email, adresse, ancienneté). C'est aussi ce
 *                                qui alimente le <title> et la meta description
 *                                de `index.html`.
 *   2. `src/config/site.ts`    → (ce fichier) les données structurées :
 *                                horaires, slogan, libellés de coordonnées.
 *
 * Aucune valeur en dur ne doit être ajoutée ailleurs : si vous avez besoin
 * d'afficher le nom de l'entreprise quelque part, importez `SITE`.
 *
 * Les valeurs ci-dessous servent de **repli** : si une variable manque dans
 * `.env`, le site reste fonctionnel avec ce qui est écrit ici.
 *
 * ⚠️ Ne jamais déposer de secret (clé API, mot de passe) dans ce fichier ni
 *    dans `.env` : les variables VITE_ sont embarquées dans le bundle public.
 */

const env = import.meta.env as Record<string, string | undefined>;

/** Lit une variable d'environnement, avec repli sur la valeur par défaut. */
const lu = (cle: string, defaut: string): string => env[cle]?.trim() || defaut;

/** Un créneau d'ouverture de la semaine. */
export interface Horaire {
  jour: string;
  heures: string;
}

/** Tout ce qu'il faut pour identifier l'entreprise affichée par le site. */
export interface SiteConfig {
  /** Nom court — ex. dans le copyright, les textes, le back-office. */
  nom: string;
  /** Nom long — ex. « AutoPrime Motors ». */
  nomLong: string;
  /** Baseline courte — « Vente, Location & Transit de Véhicules ». */
  baseline: string;
  /** <title> de toutes les pages. */
  titrePage: string;
  /** meta description (référencement). */
  descriptionPage: string;
  /** meta keywords. */
  motsCles: string;
  /** Chemin du logo principal dans `public/` (fond clair). */
  logo: string;
  /** Variante claire du logo, pour les fonds sombres (footer, sidebar admin). */
  logoInvert: string;
  /** Chemin du favicon dans `public/`. */
  favicon: string;
  /** Texte alternatif du logo (accessibilité). */
  logoAlt: string;
  telephoneFixe: string;
  telephoneMobile: string;
  /** Numéro WhatsApp au format international, sans `+` ni espaces. */
  whatsapp: string;
  email: string;
  adresse: {
    rue: string;
    ville: string;
    pays: string;
  };
  /** Adresse en une seule ligne (footer, page contact). */
  adresseComplete: string;
  horaires: Horaire[];
  /** Phrase du type « plus de 15 ans ». */
  anciennete: string;
  /** ID de formulaire Formspree de la page Contact (paramétrage par client). */
  formspreeContact: string;
  /** Petit texte de présentation (footer, page contact). */
  slogan: string;
}

/** Coordonnées et identité de l'entreprise. Source unique de vérité. */
export const SITE: SiteConfig = {
  nom: lu("VITE_SITE_NOM", "AutoPrime"),
  nomLong: lu("VITE_SITE_NOM_LONG", "AutoPrime Motors"),
  baseline: lu("VITE_SITE_BASELINE", "Vente, Location & Transit de Véhicules"),
  titrePage: lu("VITE_SITE_TITRE", "AutoPrime — Vente, Location & Transit de Véhicules"),
  descriptionPage: lu(
    "VITE_SITE_DESCRIPTION",
    "AutoPrime — Vente, location et transit de véhicules. Découvrez notre catalogue de véhicules neufs et d'occasion.",
  ),
  motsCles: lu(
    "VITE_SITE_MOTS_CLES",
    "automobile, vente véhicule, location voiture, transit, importation, Toyota, Mercedes, BMW, Ford",
  ),
  logo: lu("VITE_SITE_LOGO", "/logo.svg"),
  logoInvert: lu("VITE_SITE_LOGO_INVERT", "/logo-invert.svg"),
  favicon: lu("VITE_SITE_FAVICON", "/logo.svg"),
  logoAlt: `Logo ${lu("VITE_SITE_NOM", "AutoPrime")}`,
  telephoneFixe: lu("VITE_TELEPHONE_FIXE", "+XXX XX XX XX XX"),
  telephoneMobile: lu("VITE_TELEPHONE_MOBILE", "+XXX XX XX XX XX"),
  whatsapp: lu("VITE_WHATSAPP", "33600000000"),
  email: lu("VITE_EMAIL", "contact@votremarque.com"),
  adresse: {
    rue: lu("VITE_ADRESSE_RUE", "Quartier, Avenue, N°"),
    ville: lu("VITE_ADRESSE_VILLE", "Ville"),
    pays: lu("VITE_ADRESSE_PAYS", "Pays"),
  },
  adresseComplete: [
    lu("VITE_ADRESSE_RUE", "Quartier, Avenue, N°"),
    lu("VITE_ADRESSE_VILLE", "Ville"),
    lu("VITE_ADRESSE_PAYS", "Pays"),
  ]
    .filter((bloc) => bloc && bloc !== "Ville" && bloc !== "Pays")
    .join(", "),
  // ── À MODIFIER ICI pour chaque client ────────────────────────────────────
  horaires: [
    { jour: "Lundi - Vendredi", heures: "08:00 - 18:00" },
    { jour: "Samedi", heures: "09:00 - 15:00" },
    { jour: "Dimanche", heures: "Fermé" },
  ],
  anciennete: lu("VITE_ANCIENNETE", "plus de 15 ans"),
  formspreeContact: lu("VITE_FORMSPREE_CONTACT", "xaqraoal"),
  slogan: `Votre partenaire automobile depuis ${lu("VITE_ANCIENNETE", "plus de 15 ans")}. Vente, location et transit de véhicules premium.`,
};

/* ════════════════════════════════════════════════════════════════════════════
 *  Petites aides pour générer les liens de contact à partir de `SITE`.
 *  Utilisez-les plutôt que d'écrire `tel:`, `mailto:` ou `wa.me` à la main.
 * ════════════════════════════════════════════════════════════════════════════ */

/** Nettoie un numéro de téléphone : garde uniquement `+` et les chiffres. */
const nettoyerNumero = (numero: string): string => numero.replace(/[^\d+]/g, "");

/** Lien d'appel — `telHref(SITE.telephoneFixe)` → `tel:+33123456789`. */
export const telHref = (numero: string): string => `tel:${nettoyerNumero(numero)}`;

/** Lien mail — `mailtoHref(SITE.email)` → `mailto:contact@exemple.com`. */
export const mailtoHref = (adresse: string): string => `mailto:${adresse}`;

/**
 * Lien WhatsApp — `waHref("Bonjour, je vous contacte depuis votre site")`.
 * Le numéro est lu dans `SITE.whatsapp`.
 */
export const waHref = (message: string): string =>
  `https://wa.me/${SITE.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
