import { useEffect, useState } from "react";

/**
 * useState persisté dans le localStorage.
 * Sert à l'espace admin le temps que l'API n'est pas branchée :
 * les modifications survivent au rechargement de la page.
 *
 * Exemple :
 *   const [vehicules, setVehicules] = useLocalStorage("admin:vehicules", featuredVehicules)
 */
export function useLocalStorage<T>(cle: string, valeurInitiale: T) {
  const [valeur, setValeur] = useState<T>(() => {
    try {
      const brut = window.localStorage.getItem(cle);
      return brut !== null ? (JSON.parse(brut) as T) : valeurInitiale;
    } catch {
      // localStorage indisponible (mode privé, quota…) : on repart de l'initial
      return valeurInitiale;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(cle, JSON.stringify(valeur));
    } catch {
      // on ignore les erreurs d'écriture : l'app reste fonctionnelle en mémoire
    }
  }, [cle, valeur]);

  return [valeur, setValeur] as const;
}
