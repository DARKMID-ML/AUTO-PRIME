import { useEffect, useState } from "react";
import { SITE, type Horaire } from "@/config/site";
import { enregistrerParametreSite } from "@/config/parametresSite";

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  INFORMATIONS DE L'ENTREPRISE — éditables depuis Admin → Entreprise
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Même principe que `config/headers.ts` : les valeurs livrées avec le template
 * (`.env` + `config/site.ts`) servent de repli ; l'administrateur peut
 * remplacer tout ce qui suit dans l'administration, et le site public se
 * recompose immédiatement. La personnalisation est conservée dans le
 * localStorage de l'appareil ; quand le backend sera branché, `setEntreprise`
 * deviendra un PATCH d'API.
 *
 * ⚠️ Le logo / favicon restent dans `public/` (configurés par .env) : ce sont
 *    des fichiers, pas des textes.
 */

const CLE = "autoprime:entreprise";
const EVENEMENT = "autoprime:entreprise-updated";

/** Un chiffre clé affiché dans les bandeaux de statistiques. */
export interface Statistique {
  id: number;
  chiffre: string;
  label: string;
}

/** Ce que l'administration peut modifier. */
export interface EntrepriseInfo {
  nom: string;
  nomLong: string;
  baseline: string;
  slogan: string;
  anciennete: string;
  titrePage: string;
  descriptionPage: string;
  telephoneFixe: string;
  telephoneMobile: string;
  whatsapp: string;
  email: string;
  adresseRue: string;
  adresseVille: string;
  adressePays: string;
  horaires: Horaire[];
  statistiques: Statistique[];
}

/** Valeurs par défaut : ce que `config/site.ts` (et `.env`) livrent. */
export const entrepriseParDefaut: EntrepriseInfo = {
  nom: SITE.nom,
  nomLong: SITE.nomLong,
  baseline: SITE.baseline,
  slogan: SITE.slogan,
  anciennete: SITE.anciennete,
  titrePage: SITE.titrePage,
  descriptionPage: SITE.descriptionPage,
  telephoneFixe: SITE.telephoneFixe,
  telephoneMobile: SITE.telephoneMobile,
  whatsapp: SITE.whatsapp,
  email: SITE.email,
  adresseRue: SITE.adresse.rue,
  adresseVille: SITE.adresse.ville,
  adressePays: SITE.adresse.pays,
  horaires: SITE.horaires.map((h) => ({ ...h })),
  statistiques: [
    { id: 1, chiffre: "15+", label: "Années d'expérience" },
    { id: 2, chiffre: "2000+", label: "Véhicules vendus" },
    { id: 3, chiffre: "4.9/5", label: "Satisfaction client" },
    { id: 4, chiffre: "3", label: "Showrooms au Mali" },
  ],
};

type StoreEntreprise = Partial<Record<keyof EntrepriseInfo, unknown>>;

const texte = (valeur: unknown): string | undefined =>
  typeof valeur === "string" ? valeur : undefined;

function horairesValides(valeur: unknown): Horaire[] | undefined {
  if (!Array.isArray(valeur)) return undefined;
  const resultat = valeur
    .filter((h): h is { jour?: unknown; heures?: unknown } => !!h && typeof h === "object")
    .map((h) => ({ jour: texte(h.jour) ?? "", heures: texte(h.heures) ?? "" }))
    .filter((h) => h.jour.trim() || h.heures.trim());
  return resultat.length > 0 ? resultat : undefined;
}

function statistiquesValides(valeur: unknown): Statistique[] | undefined {
  if (!Array.isArray(valeur)) return undefined;
  const resultat = valeur
    .filter((s): s is { id?: unknown; chiffre?: unknown; label?: unknown } => !!s && typeof s === "object")
    .map((s, index) => ({
      id: typeof s.id === "number" ? s.id : index + 1,
      chiffre: texte(s.chiffre) ?? "",
      label: texte(s.label) ?? "",
    }))
    .filter((s) => s.chiffre.trim() && s.label.trim());
  return resultat.length > 0 ? resultat : undefined;
}

function lireStore(): StoreEntreprise {
  try {
    const brut = window.localStorage.getItem(CLE);
    return brut ? (JSON.parse(brut) as StoreEntreprise) : {};
  } catch {
    return {};
  }
}

function ecrireStore(store: StoreEntreprise) {
  try {
    window.localStorage.setItem(CLE, JSON.stringify(store));
    window.dispatchEvent(new Event(EVENEMENT));
  } catch {
    // stockage plein ou désactivé : on garde au moins l'affichage courant
  }
}

/** Adresse au format une-ligne (footers, bandeaux, page contact). */
export function adresseComplete(info: EntrepriseInfo): string {
  return [info.adresseRue, info.adresseVille, info.adressePays]
    .filter((bloc) => bloc.trim())
    .join(", ");
}

/** Fusionne le repli (SITE) avec la personnalisation administrateur. */
export function getEntreprise(): EntrepriseInfo {
  const store = lireStore();
  const loc = texte(store.adresseRue) ?? entrepriseParDefaut.adresseRue;
  const ville = texte(store.adresseVille) ?? entrepriseParDefaut.adresseVille;
  const pays = texte(store.adressePays) ?? entrepriseParDefaut.adressePays;
  return {
    nom: texte(store.nom)?.trim() || entrepriseParDefaut.nom,
    nomLong: texte(store.nomLong)?.trim() || entrepriseParDefaut.nomLong,
    baseline: texte(store.baseline)?.trim() || entrepriseParDefaut.baseline,
    slogan: texte(store.slogan)?.trim() || entrepriseParDefaut.slogan,
    anciennete: texte(store.anciennete)?.trim() || entrepriseParDefaut.anciennete,
    titrePage: texte(store.titrePage)?.trim() || entrepriseParDefaut.titrePage,
    descriptionPage: texte(store.descriptionPage)?.trim() || entrepriseParDefaut.descriptionPage,
    telephoneFixe: texte(store.telephoneFixe)?.trim() || entrepriseParDefaut.telephoneFixe,
    telephoneMobile: texte(store.telephoneMobile)?.trim() || entrepriseParDefaut.telephoneMobile,
    whatsapp: texte(store.whatsapp)?.replace(/\D/g, "") || entrepriseParDefaut.whatsapp,
    email: texte(store.email)?.trim() || entrepriseParDefaut.email,
    adresseRue: loc,
    adresseVille: ville,
    adressePays: pays,
    horaires: horairesValides(store.horaires) ?? entrepriseParDefaut.horaires,
    statistiques: statistiquesValides(store.statistiques) ?? entrepriseParDefaut.statistiques,
  };
}

/** Enregistre une modification partielle. Les listes (horaires, stats) sont remplacées en bloc. */
export function setEntreprise(patch: Partial<EntrepriseInfo>) {
  const store = lireStore();
  for (const [cle, valeur] of Object.entries(patch)) {
    store[cle as keyof EntrepriseInfo] =
      cle === "horaires" ? horairesValides(valeur) : cle === "statistiques" ? statistiquesValides(valeur) : valeur;
  }
  ecrireStore(store);
  // On enregistre l'information effective (replis compris) pour que le site
  // public reçoive un objet complet, pas seulement le patch.
  void enregistrerParametreSite("entreprise", getEntreprise());
}

/** Rétablit les valeurs livrées avec le template. */
export function resetEntreprise() {
  ecrireStore({});
  void enregistrerParametreSite("entreprise", null);
}

function abonner(callback: () => void) {
  window.addEventListener(EVENEMENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENEMENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** Informations de l'entreprise effectives, recalculées à chaque modification. */
export function useEntreprise(): EntrepriseInfo {
  const [info, setInfo] = useState<EntrepriseInfo>(() => getEntreprise());

  useEffect(() => {
    const maj = () => setInfo(getEntreprise());
    maj();
    return abonner(maj);
  }, []);

  return info;
}
