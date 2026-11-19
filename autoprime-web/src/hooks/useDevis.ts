/**
 * Hook boîte de réception des demandes de devis transit.
 * Même modèle que `useMessages` : API `/api/devis-transit` + miroir local.
 */
import { useCallback, useEffect, useState } from "react"
import { apiGet, apiSend, apiDelete } from "@/config/api"
import { devisInitiaux } from "@/data/inbox"
import type { DemandeDevis, StatutDevis } from "@/types/admin"

const CLE = "admin:devis"

function lireLocal(repli: DemandeDevis[]): DemandeDevis[] {
  try {
    const brut = window.localStorage.getItem(CLE);
    if (brut) {
      const parse = JSON.parse(brut) as DemandeDevis[];
      if (Array.isArray(parse)) return parse;
    }
  } catch {
    // JSON corrompu → démo
  }
  return repli;
}

function ecrireLocal(liste: DemandeDevis[]) {
  try {
    window.localStorage.setItem(CLE, JSON.stringify(liste));
  } catch {
    // quota dépassé : on ignore
  }
}

export function useDevis() {
  const [devis, setDevisEtat] = useState<DemandeDevis[]>(() =>
    lireLocal(devisInitiaux),
  );
  const [enLigne, setEnLigne] = useState(false);
  const [charge, setCharge] = useState(true);

  useEffect(() => {
    let vivant = true;
    apiGet<DemandeDevis[]>("/api/devis-transit").then((reponse) => {
      if (!vivant) return;
      if (reponse !== null) {
        setDevisEtat(reponse);
        ecrireLocal(reponse);
        setEnLigne(true);
      }
      setCharge(false);
    },
      () => {
        if (vivant) setCharge(false);
      });
    return () => { vivant = false; };
  }, []);

  const appliquer = useCallback((liste: DemandeDevis[]) => {
    setDevisEtat(liste);
    ecrireLocal(liste);
  }, []);

  /** Marquer comme contacté / archivé. */
  const changerStatut = useCallback(
    async (id: number, statut: StatutDevis) => {
      const reponse = await apiSend<DemandeDevis>(`/api/devis-transit/${id}/statut`, "PATCH", { statut });
      if (reponse) {
        appliquer(lireLocal([]).map((d) => (d.id === id ? reponse : d)));
        setEnLigne(true);
      } else {
        appliquer(lireLocal([]).map((d) => (d.id === id ? { ...d, statut } : d)));
        setEnLigne(false);
      }
    },
    [appliquer],
  );

  /** Supprime une demande. */
  const supprimer = useCallback(
    async (id: number) => {
      const ok = await apiDelete(`/api/devis-transit/${id}`);
      appliquer(lireLocal([]).filter((d) => d.id !== id));
      setEnLigne(ok);
    },
    [appliquer],
  );

  return { devis, charge, enLigne, changerStatut, supprimer };
}
