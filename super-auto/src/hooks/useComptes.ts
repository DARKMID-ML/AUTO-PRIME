import { useCallback, useEffect, useState } from "react"
import { apiDelete, apiGet, apiSend } from "@/config/api"

/** Rôle d'un compte stocké en base (le compte `dev` n'est pas dans la liste). */
export type RoleCompte = "admin" | "vendeur"

/** Compte tel que renvoyé par GET /api/auth/comptes. */
export interface CompteUtilisateur {
  id: number
  nom: string
  identifiant: string
  role: RoleCompte
  actif: boolean
  dateCreation: string | null
}

/** Réponse de création : le mot de passe n'est affiché qu'une seule fois. */
export interface CompteCree {
  compte: CompteUtilisateur
  motDePasse: string
}

function trier(liste: CompteUtilisateur[]): CompteUtilisateur[] {
  return [...liste].sort(
    (a, b) => a.role.localeCompare(b.role) || a.nom.localeCompare(b.nom, "fr"),
  )
}

/**
 * Gestion des comptes admin/vendeurs — réservée au compte technique `dev`.
 * Les mots de passe sont générés par le serveur et ne sont jamais stockés.
 */
export function useComptes() {
  const [comptes, setComptes] = useState<CompteUtilisateur[]>([])
  const [charge, setCharge] = useState(true)
  const [enLigne, setEnLigne] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  const recharger = useCallback(() => {
    let vivant = true
    apiGet<CompteUtilisateur[]>("/api/auth/comptes").then((reponse) => {
      if (!vivant) return
      if (reponse !== null) {
        setComptes(trier(reponse))
        setEnLigne(true)
        setErreur(null)
      } else {
        setEnLigne(false)
        setErreur("Impossible de charger les comptes : API injoignable ou accès refusé.")
      }
      setCharge(false)
    })
    return () => {
      vivant = false
    }
  }, [])

  useEffect(() => recharger(), [recharger])

  const creer = useCallback(
    async (nom: string, identifiant: string, role: RoleCompte): Promise<CompteCree | null> => {
      const reponse = await apiSend<CompteCree>("/api/auth/comptes", "POST", {
        nom,
        identifiant,
        role,
      })
      if (!reponse) return null
      setComptes((liste) => trier([...liste, reponse.compte]))
      setEnLigne(true)
      return reponse
    },
    [],
  )

  const supprimer = useCallback(async (id: number): Promise<boolean> => {
    const ok = await apiDelete(`/api/auth/comptes/${id}`)
    if (ok) {
      setComptes((liste) => liste.filter((compte) => compte.id !== id))
    }
    return ok
  }, [])

  const reinitialiser = useCallback(async (id: number): Promise<string | null> => {
    const reponse = await apiSend<{ motDePasse: string }>(
      `/api/auth/comptes/${id}/mot-de-passe`,
      "POST",
    )
    return reponse?.motDePasse ?? null
  }, [])

  const basculerActif = useCallback(
    async (id: number, actif: boolean): Promise<boolean> => {
      const reponse = await apiSend<{ actif: boolean }>(
        `/api/auth/comptes/${id}/actif`,
        "PATCH",
        { actif },
      )
      if (!reponse) return false
      setComptes((liste) =>
        liste.map((compte) => (compte.id === id ? { ...compte, actif: reponse.actif } : compte)),
      )
      return true
    },
    [],
  )

  return { comptes, charge, enLigne, erreur, recharger, creer, supprimer, reinitialiser, basculerActif }
}
