/**
 * Hook boîte de réception des messages de contact.
 *
 * Source de vérité : l'API (`/api/contact`). Miroir localStorage conservé
 * (`admin:messages`) pour que le tableau de bord continue de lire les
 * compteurs si le serveur est éteint.
 */
import { useCallback, useEffect, useState } from "react"
import { apiGet, apiSend, apiDelete } from "@/config/api"
import { messagesInitiaux } from "@/data/inbox"
import type { MessageContact, StatutMessage } from "@/types/admin"

const CLE = "admin:messages"

function lireLocal(repli: MessageContact[]): MessageContact[] {
  try {
    const brut = window.localStorage.getItem(CLE);
    if (brut) {
      const parse = JSON.parse(brut) as MessageContact[];
      if (Array.isArray(parse)) return parse;
    }
  } catch {
    // JSON corrompu → démo
  }
  return repli;
}

function ecrireLocal(liste: MessageContact[]) {
  try {
    window.localStorage.setItem(CLE, JSON.stringify(liste));
  } catch {
    // quota dépassé : on ignore
  }
}

export function useMessages() {
  const [messages, setMessagesEtat] = useState<MessageContact[]>(() =>
    lireLocal(messagesInitiaux),
  );
  const [enLigne, setEnLigne] = useState(false);
  const [charge, setCharge] = useState(true);

  useEffect(() => {
    let vivant = true;
    const cache = (liste: MessageContact[]) => {
      setMessagesEtat(liste);
      ecrireLocal(liste);
    };
    apiGet<MessageContact[]>("/api/contact").then((reponse) => {
      if (!vivant) return;
      if (reponse !== null) {
        cache(reponse); // l'API est la source de vérité (même vide)
        setEnLigne(true);
      }
      setCharge(false);
    },
      () => {
        if (vivant) setCharge(false);
      });
    return () => { vivant = false; };
  }, []);

  const appliquer = useCallback((liste: MessageContact[]) => {
    setMessagesEtat(liste);
    ecrireLocal(liste);
  }, []);

  /** Marquer comme lu / archivé. */
  const changerStatut = useCallback(
    async (id: number, statut: StatutMessage) => {
      const reponse = await apiSend<MessageContact>(`/api/contact/${id}/statut`, "PATCH", { statut });
      if (reponse) {
        appliquer(lireLocal([]).map((m) => (m.id === id ? reponse : m)));
        setEnLigne(true);
      } else {
        appliquer(lireLocal([]).map((m) => (m.id === id ? { ...m, statut } : m)));
        setEnLigne(false);
      }
    },
    [appliquer],
  );

  /** Supprime un message. */
  const supprimer = useCallback(
    async (id: number) => {
      const ok = await apiDelete(`/api/contact/${id}`);
      appliquer(lireLocal([]).filter((m) => m.id !== id));
      setEnLigne(ok);
    },
    [appliquer],
  );

  return { messages, charge, enLigne, changerStatut, supprimer };
}
