/** ════════════════════════════════════════════════════════════════════
 *  SESSION ADMIN — un seul point pour savoir « qui est connecté »
 * ════════════════════════════════════════════════════════════════════
 *
 * Trois rôles :
 *   - "admin"   : responsable du site, gère le catalogue et les demandes
 *   - "vendeur" : employé, accès limité au catalogue et aux demandes
 *   - "dev"     : compte technique du mainteneur, accès aux écrans de
 *                 configuration et à la gestion des comptes
 *
 * Le jeton est stocké dans localStorage (clé `admin:session`) et envoyé
 * à l'API via l'en-tête Authorization. Le vrai contrôle d'accès est fait
 * côté serveur (AuthFilter) ; le rôle ici sert à masquer les écrans
 * réservés au développeur.
 */
import { useSyncExternalStore } from "react"
import { CLE_SESSION, apiSend, endPoint } from "@/config/api"
import { reinitialiserUtilisateur } from "@/config/analytics"

export type Role = "admin" | "vendeur" | "dev"

export interface Session {
  token: string
  identifiant: string
  nom: string
  role: Role
}

function lireStockage(): Session | null {
  try {
    const brut = window.localStorage.getItem(CLE_SESSION)
    if (!brut) return null
    const donnees = JSON.parse(brut) as Partial<Session>
    if (
      typeof donnees.token !== "string" ||
      typeof donnees.identifiant !== "string" ||
      (donnees.role !== "admin" && donnees.role !== "vendeur" && donnees.role !== "dev")
    ) {
      return null
    }
    return {
      token: donnees.token,
      identifiant: donnees.identifiant,
      nom: typeof donnees.nom === "string" ? donnees.nom : donnees.identifiant,
      role: donnees.role,
    }
  } catch {
    return null
  }
}

// Cache stable obligatoire pour useSyncExternalStore (sinon boucle infinie).
let cache: Session | null = lireStockage()
const abonnes = new Set<() => void>()

export function sAbonnerSession(abonne: () => void): () => void {
  abonnes.add(abonne)
  return () => {
    abonnes.delete(abonne)
  }
}

export function instantaneSession(): Session | null {
  return cache
}

function appliquer(session: Session | null) {
  cache = session
  try {
    if (session) {
      window.localStorage.setItem(CLE_SESSION, JSON.stringify(session))
    } else {
      window.localStorage.removeItem(CLE_SESSION)
    }
  } catch {
    // stockage plein ou désactivé : la session reste en mémoire
  }
  abonnes.forEach((abonne) => abonne())
}

/** Session courante (réactive). */
export function useSession(): Session | null {
  return useSyncExternalStore(sAbonnerSession, instantaneSession, instantaneSession)
}

/** Vrai si la session appartient au développeur. */
export function estDev(session: Session | null): boolean {
  return session?.role === "dev"
}

/** Vrai pour l'admin du site ou le compte technique. */
export function estAdminOuDev(session: Session | null): boolean {
  return session?.role === "admin" || estDev(session)
}

/**
 * Connexion : renvoie `null` en cas de succès, sinon un message d'erreur.
 */
export async function seConnecter(
  identifiant: string,
  motDePasse: string,
): Promise<string | null> {
  const reponse = await apiSend<Session>("/api/auth/login", "POST", { identifiant, motDePasse })
  if (!reponse || !reponse.token) {
    return "Identifiant ou mot de passe incorrect, ou serveur indisponible."
  }
  appliquer(reponse)
  return null
}

/** Déconnexion : invalide le jeton côté serveur puis efface la session locale. */
export async function seDeconnecter(): Promise<void> {
  await apiSend("/api/auth/logout", "POST")
  appliquer(null)
  // La session d'analytique ne doit plus être rattachée au compte.
  reinitialiserUtilisateur()
}

/** Vérifie au démarrage que le jeton stocké est toujours valide.
 * - 401/403 → session effacée (API redémarrée ou jeton expiré)
 * - serveur injoignable → on conserve la session locale (mode hors ligne)
 */
export async function verifierSession(): Promise<void> {
  if (!cache) return
  try {
    const reponse = await fetch(endPoint("/api/auth/moi"), {
      headers: { Authorization: `Bearer ${cache.token}` },
    })
    if (reponse.status === 401 || reponse.status === 403) {
      appliquer(null)
    }
  } catch {
    // Serveur éteint : la session locale reste utilisable.
  }
}
