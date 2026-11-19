import { apiGet, apiSend } from "@/config/api";

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  PARAMÈTRES DU SITE PRINCIPAL — persistés côté serveur
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Les écrans « site » (apparence, identité, contenu, services) ne sont plus
 * des réglages de navigateur : ils appartiennent au site et doivent
 * s'appliquer à tous les visiteurs.
 *
 * `GET /api/site/parametres` est public : au démarrage, le front récupère les
 * réglages enregistrés et les réinjecte dans le localStorage, ce qui laisse
 * les modules existants (`config/theme`, `config/logo`, ...) fonctionner sans
 * changement. `PUT` est réservé aux comptes connectés (contrôle côté serveur).
 *
 * Une valeur `null` supprime le réglage : le site revient au texte/au thème
 * livré avec le template.
 */

export type CleSite =
  | "theme"
  | "logo"
  | "entreprise"
  | "services"
  | "entetes"
  | "temoignages"
  | "engagements"
  | "domaines"
  | "pages";

/** Clé localStorage que chaque réglage alimente. */
const STOCKAGE: Record<CleSite, string> = {
  theme: "autoprime:theme-settings",
  logo: "admin:logo",
  entreprise: "autoprime:entreprise",
  services: "admin:services",
  entetes: "autoprime:page-headers",
  temoignages: "autoprime:temoignages",
  engagements: "autoprime:engagements",
  domaines: "autoprime:domaines",
  pages: "autoprime:pages",
};

/** Événement écouté par les modules concernés pour se recomposer. */
const EVENEMENTS: Record<CleSite, string> = {
  theme: "autoprime:theme-updated",
  logo: "autoprime:logo-updated",
  entreprise: "autoprime:entreprise-updated",
  services: "autoprime:services-updated",
  entetes: "autoprime:headers-updated",
  temoignages: "autoprime:contenu-updated",
  engagements: "autoprime:contenu-updated",
  domaines: "autoprime:contenu-updated",
  pages: "autoprime:pages-updated",
};

let chargement: Promise<void> | null = null;

/**
 * Charge les réglages du site et les applique au navigateur courant.
 * Appelé une fois au démarrage du front ; idempotent.
 */
export function chargerParametresSite(): Promise<void> {
  if (chargement) return chargement;
  chargement = (async () => {
    const parametres = await apiGet<Record<string, string>>("/api/site/parametres");
    if (!parametres) return;
    for (const [cle, valeur] of Object.entries(parametres)) {
      const cleSite = cle as CleSite;
      const stockage = STOCKAGE[cleSite];
      if (!stockage || typeof valeur !== "string") continue;
      try {
        window.localStorage.setItem(stockage, valeur);
      } catch {
        continue;
      }
      window.dispatchEvent(new Event(EVENEMENTS[cleSite]));
    }
  })();
  return chargement;
}

/**
 * Enregistre un réglage côté serveur. `null` rétablit la valeur livrée.
 * Le localStorage a déjà été mis à jour par l'écran appelant : on ne bloque
 * pas l'interface si le serveur est momentanément indisponible.
 */
export async function enregistrerParametreSite(
  cle: CleSite,
  valeur: unknown,
): Promise<boolean> {
  const corps = { [cle]: valeur == null ? null : JSON.stringify(valeur) };
  const reponse = await apiSend<Record<string, string>>(
    "/api/site/parametres",
    "PUT",
    corps,
  );
  return reponse !== null;
}
