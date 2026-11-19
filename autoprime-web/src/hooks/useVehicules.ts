/**
 * Hook catalogue : liste des véhicules depuis le backend.
 *
 * - Repli automatique sur les données locales (`data/vehicle.ts`)
 *   si l'API est éteinte → le site reste démontrable hors ligne.
 * - `enLigne` indique si les données viennent du serveur.
 */
import { useEffect, useState } from "react"
import { apiGet } from "@/config/api"
import { featuredVehicules } from "@/data/vehicle"
import type { Vehicule } from "@/types/vehicule"

export function useVehicules() {
  const [vehicules, setVehicules] = useState<Vehicule[]>(featuredVehicules)
  const [charge, setCharge] = useState(true)
  const [enLigne, setEnLigne] = useState(false)

  useEffect(() => {
    let vivant = true
    apiGet<Vehicule[]>("/api/vehicules").then(
      (donnees) => {
        if (!vivant) return
        if (donnees && donnees.length > 0) {
          setVehicules(donnees)
          setEnLigne(true)
        }
        setCharge(false)
      },
      () => {
        if (vivant) setCharge(false)
      },
    )
    return () => {
      vivant = false
    }
  }, [])

  return { vehicules, charge, enLigne }
}
