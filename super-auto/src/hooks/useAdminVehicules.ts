/**
 * Hook CRUD véhicules pour l'espace admin.
 *
 * Source de vérité : l'API (`/api/vehicules`). Chaque opération est
 * répercutée en local pour que le tableau de bord et les autres écrans
 * continuent de fonctionner, y compris lorsque le serveur est éteint.
 */
import { useCallback, useEffect, useRef, useState } from "react"
import { apiGet, apiSend, apiDelete } from "@/config/api"
import { featuredVehicules } from "@/data/vehicle"
import type { Vehicule } from "@/types/vehicule"

const CLE = "admin:vehicules"

function lireLocal(repli: Vehicule[]): Vehicule[] {
  try {
    const brut = window.localStorage.getItem(CLE);
    if (brut) {
      const parse = JSON.parse(brut) as Vehicule[];
      if (Array.isArray(parse)) return parse;
    }
  } catch {
    // JSON corrompu → données de départ
  }
  return repli;
}

function ecrireLocal(liste: Vehicule[]) {
  try {
    window.localStorage.setItem(CLE, JSON.stringify(liste));
  } catch {
    // quota dépassé : on ignore l'écriture du miroir
  }
}

/** Prochain id local (uniquement en mode hors ligne). */
function prochainId(liste: Vehicule[]): number {
  return liste.reduce((max, v) => Math.max(max, v.id), 0) + 1;
}

export function useAdminVehicules() {
  const [vehicules, setVehiculesEtat] = useState<Vehicule[]>(() =>
    lireLocal(featuredVehicules),
  );
  const [charge, setCharge] = useState(true);
  const [enLigne, setEnLigne] = useState(false);
  // Miroir pour les callbacks sans closure périmée (mis à jour après rendu)
  const ref = useRef(vehicules);
  useEffect(() => {
    ref.current = vehicules;
  }, [vehicules]);

  // Chargement initial depuis l'API
  useEffect(() => {
    let vivant = true;
    apiGet<Vehicule[]>("/api/vehicules").then((reponse) => {
      if (!vivant) return;
      // Réponse non nulle (même vide) = source de vérité.
      if (reponse !== null) {
        setVehiculesEtat(reponse);
        ecrireLocal(reponse);
        setEnLigne(true);
      }
      setCharge(false);
    },
      () => {
        if (vivant) setCharge(false); // serveur éteint : miroir local
      });
    return () => {
      vivant = false;
    };
  }, []);

  /** Remplace l'état + le miroir. */
  const appliquer = useCallback((liste: Vehicule[]) => {
    setVehiculesEtat(liste);
    ecrireLocal(liste);
  }, []);

  /** Création d'un véhicule. */
  const creer = useCallback(
    async (brouillon: Omit<Vehicule, "id">) => {
      const reponse = await apiSend<Vehicule>("/api/vehicules", "POST", brouillon);
      if (reponse) {
        const dejaPresent = ref.current.some((v) => v.id === reponse.id);
        appliquer(
          dejaPresent
            ? ref.current.map((v) => (v.id === reponse.id ? reponse : v))
            : [...ref.current, reponse],
        );
        setEnLigne(true);
      } else {
        appliquer([...ref.current, { ...brouillon, id: prochainId(ref.current) }]);
        setEnLigne(false);
      }
    },
    [appliquer],
  );

  /** Mise à jour complète d'un véhicule. */
  const modifier = useCallback(
    async (id: number, brouillon: Omit<Vehicule, "id">) => {
      const reponse = await apiSend<Vehicule>(`/api/vehicules/${id}`, "PUT", brouillon);
      if (reponse) {
        appliquer(ref.current.map((v) => (v.id === id ? reponse : v)));
        setEnLigne(true);
      } else {
        appliquer(ref.current.map((v) => (v.id === id ? { ...brouillon, id } : v)));
        setEnLigne(false);
      }
    },
    [appliquer],
  );

  /** Suppression d'un véhicule. */
  const supprimer = useCallback(
    async (id: number) => {
      const ok = await apiDelete(`/api/vehicules/${id}`);
      appliquer(ref.current.filter((v) => v.id !== id));
      setEnLigne(ok);
    },
    [appliquer],
  );

  return { vehicules, charge, enLigne, creer, modifier, supprimer };
}
