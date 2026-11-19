/**
 * ════════════════════════════════════════════════════════════════════
 *  CLIENT API — point d'accès unique vers le backend Spring Boot
 * ════════════════════════════════════════════════════════════════════
 *
 * L'URL est configurée via la variable d'environnement VITE_API_URL :
 *   local      → même origine (le proxy Vite relaie /api vers le port 8080)
 *   production → VITE_API_URL=https://mon-serveur.com pnpm build
 *
 * Toutes les réponses JSON parlent français (marque, model, prix...)
 * et correspondent exactement au type `Vehicule`.
 *
 * Quand une session admin est ouverte (clé `admin:session`), son jeton
 * est ajouté automatiquement en "Authorization: Bearer ...".
 */

/**
 * URL de base de l'API, sans slash final.
 *   • développement sans VITE_API_URL → "" (proxy Vite, même origine)
 *   • production sans VITE_API_URL   → "" (même origine que le site)
 *   • "/"                → même origine que le site (déploiement derrière nginx)
 *   • "https://api..."   → API séparée sur un autre domaine
 */
const urlApi = (import.meta.env as Record<string, string | undefined>).VITE_API_URL;
// Même origine : le proxy Vite (dev) et nginx (production) relaient /api.
// On évite ainsi tout CORS et le port du serveur de dev n'a plus d'importance.
const urlParDefaut = "";

export const API_BASE: string =
  !urlApi || urlApi.trim() === ""
    ? urlParDefaut
    : urlApi.trim().replace(/\/+$/, "");

/** Clé localStorage de la session admin (partagée avec config/auth.ts). */
export const CLE_SESSION = "admin:session";

/** Endpoint d'un service donné. */
export const endPoint = (chemin: string): string => `${API_BASE}${chemin}`;

/** Jeton de la session admin, si présente. */
function jetonStocke(): string | null {
  try {
    const brut = window.localStorage.getItem(CLE_SESSION);
    if (!brut) return null;
    const session = JSON.parse(brut) as { token?: unknown };
    return typeof session.token === "string" ? session.token : null;
  } catch {
    return null;
  }
}

/** En-têtes communs (JSON + jeton admin). */
function entetes(json: boolean): Record<string, string> {
  const resultat: Record<string, string> = {};
  if (json) resultat["Content-Type"] = "application/json";
  const jeton = jetonStocke();
  if (jeton) resultat.Authorization = `Bearer ${jeton}`;
  return resultat;
}

/** GET simple + parse JSON (null en cas d'erreur réseau ou 401). */
export async function apiGet<T>(chemin: string): Promise<T | null> {
  try {
    const reponse = await fetch(endPoint(chemin), { headers: entetes(false) });
    if (!reponse.ok) return null;
    return (await reponse.json()) as T;
  } catch {
    return null;
  }
}

/** DELETE — renvoie true si le serveur a confirmé. */
export async function apiDelete(chemin: string): Promise<boolean> {
  try {
    const reponse = await fetch(endPoint(chemin), {
      method: "DELETE",
      headers: entetes(false),
    });
    return reponse.ok;
  } catch {
    return false;
  }
}

/** POST / PUT / PATCH avec corps JSON. */
export async function apiSend<T>(
  chemin: string,
  methode: "POST" | "PUT" | "PATCH" | "DELETE",
  corps?: unknown,
): Promise<T | null> {
  try {
    const reponse = await fetch(endPoint(chemin), {
      method: methode,
      headers: entetes(corps !== undefined),
      body: corps !== undefined ? JSON.stringify(corps) : undefined,
    });
    if (!reponse.ok) return null;
    return methode === "DELETE" ? null : ((await reponse.json()) as T);
  } catch {
    return null;
  }
}
