import { useEffect, useState } from "react";
import { services as servicesStatiques, domainesAccueil as domainesStatiques, pourquoiNousChoisir as engagementsStatiques } from "@/data/services";
import { temoignages as temoignagesStatiques } from "@/data/testimonials";
import type { ServiceItem } from "@/types/admin";
import type { Avis } from "@/types/avis";
import { enregistrerParametreSite } from "@/config/parametresSite";

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  CONTENU ADMINISTRABLE — services, témoignages, engagements, domaines
 * ════════════════════════════════════════════════════════════════════════════
 *
 * `Admin → Services` écrit la liste des services ; `Admin → Contenu du site`
 * écrit les témoignages, les engagements (« Pourquoi nous choisir ») et les
 * domaines de la page d'accueil. Ce module expose les listes effectives
 * (personnalisées ou livrées avec le template) aux pages publiques.
 *
 * Les listes sont lues au montage et à jour du storage inter-onglets ; les
 * vues se remontent à la navigation, ce qui suffit tant qu'il n'y a pas d'API.
 */

/* ------------------------------------------------------------------ */
/*  Services                                                           */
/* ------------------------------------------------------------------ */

const CLE_SERVICES = "admin:services";
const EVENEMENT_SERVICES = "autoprime:services-updated";

/** Les services livrés avec le template, avec leur ordre d'affichage. */
export const servicesParDefaut: ServiceItem[] = servicesStatiques.map((s) => ({
  ...s,
  ordre: s.id,
}));

const estService = (valeur: unknown): valeur is ServiceItem =>
  !!valeur &&
  typeof valeur === "object" &&
  typeof (valeur as { titre?: unknown }).titre === "string" &&
  typeof (valeur as { description?: unknown }).description === "string";

/** Liste effective des services (personnalisée par l'admin, sinon le template). */
export function lireServicesAdmin(): ServiceItem[] {
  try {
    const brut = window.localStorage.getItem(CLE_SERVICES);
    if (!brut) return servicesParDefaut;
    const parse = JSON.parse(brut) as unknown;
    if (!Array.isArray(parse)) return servicesParDefaut;
    const liste = parse.filter(estService);
    return liste.length > 0 ? liste : servicesParDefaut;
  } catch {
    return servicesParDefaut;
  }
}

/** Liste des services triée par ordre d'affichage, rechargée à chaque montage. */
export function useAdminServices(): ServiceItem[] {
  const [liste, setListe] = useState<ServiceItem[]>(() => lireServicesAdmin());

  useEffect(() => {
    const maj = () => setListe(lireServicesAdmin());
    maj();
    window.addEventListener("storage", maj);
    window.addEventListener(EVENEMENT_SERVICES, maj);
    return () => {
      window.removeEventListener("storage", maj);
      window.removeEventListener(EVENEMENT_SERVICES, maj);
    };
  }, []);

  return [...liste].sort((a, b) => a.ordre - b.ordre);
}

/* ------------------------------------------------------------------ */
/*  Témoignages / engagements / domaines de l'accueil                   */
/* ------------------------------------------------------------------ */

export interface TemoignageEdit {
  id: number;
  nom: string;
  initiales: string;
  message: string;
}

export interface EngagementEdit {
  id: number;
  titre: string;
  description: string;
  icone: string;
}

export interface DomaineEdit {
  id: number;
  titre: string;
  description: string;
  icone: string;
  lien: string;
}

export const temoignagesParDefaut: TemoignageEdit[] = temoignagesStatiques.map((a) => ({
  id: a.id,
  nom: a.nom,
  initiales: a.initiales,
  message: a.message,
}));

export const engagementsParDefaut: EngagementEdit[] = engagementsStatiques.map((e) => ({
  id: e.id,
  titre: e.titre,
  description: e.description,
  icone: e.icone,
}));

export const domainesParDefaut: DomaineEdit[] = domainesStatiques.map((d) => ({
  id: d.id,
  titre: d.titre,
  description: d.description,
  icone: d.icone,
  lien: d.lien,
}));

const CLE_TEMOIGNAGES = "autoprime:temoignages";
const CLE_ENGAGEMENTS = "autoprime:engagements";
const CLE_DOMAINES = "autoprime:domaines";
const EVENEMENT_CONTENU = "autoprime:contenu-updated";

function lireListe<T>(cle: string, defauts: T[], valide: (valeur: unknown) => boolean): T[] {
  try {
    const brut = window.localStorage.getItem(cle);
    if (!brut) return defauts;
    const parse = JSON.parse(brut) as unknown;
    if (!Array.isArray(parse)) return defauts;
    const liste = parse.filter(valide);
    return liste.length > 0 ? liste : defauts;
  } catch {
    return defauts;
  }
}

function ecrireListe<T>(cle: string, liste: T[]) {
  try {
    window.localStorage.setItem(cle, JSON.stringify(liste));
    window.dispatchEvent(new Event(EVENEMENT_CONTENU));
  } catch {
    // stockage plein ou désactivé : on garde l'entité courante
  }
}

const estTemoignage = (valeur: unknown): valeur is TemoignageEdit =>
  estTexte(valeur, "nom") && estTexte(valeur, "message");
const estEngagement = (valeur: unknown): valeur is EngagementEdit =>
  estTexte(valeur, "titre") && estTexte(valeur, "description");
const estDomaine = (valeur: unknown): valeur is DomaineEdit =>
  estTexte(valeur, "titre") && estTexte(valeur, "description") && estTexte(valeur, "lien");

function estTexte(objette: unknown, champ: string): boolean {
  return (
    !!objette &&
    typeof objette === "object" &&
    typeof (objette as Record<string, unknown>)[champ] === "string"
  );
}

export const lireTemoignages = (): Avis[] =>
  lireListe(CLE_TEMOIGNAGES, temoignagesParDefaut, estTemoignage).map((t) => ({
    id: t.id,
    nom: t.nom,
    email: "",
    message: t.message,
    initiales: t.initiales,
  }));

export const lireEngagements = (): EngagementEdit[] =>
  lireListe(CLE_ENGAGEMENTS, engagementsParDefaut, estEngagement);

export const lireDomaines = (): DomaineEdit[] =>
  lireListe(CLE_DOMAINES, domainesParDefaut, estDomaine);

export const setTemoignages = (liste: TemoignageEdit[]) => {
  ecrireListe(CLE_TEMOIGNAGES, liste);
  void enregistrerParametreSite("temoignages", liste.length > 0 ? liste : null);
};
export const setEngagements = (liste: EngagementEdit[]) => {
  ecrireListe(CLE_ENGAGEMENTS, liste);
  void enregistrerParametreSite("engagements", liste.length > 0 ? liste : null);
};
export const setDomaines = (liste: DomaineEdit[]) => {
  ecrireListe(CLE_DOMAINES, liste);
  void enregistrerParametreSite("domaines", liste.length > 0 ? liste : null);
};

export const resetTemoignages = () => setTemoignages([]);
export const resetEngagements = () => setEngagements([]);
export const resetDomaines = () => setDomaines([]);

function useListeContenu<T>(lire: () => T[]): T[] {
  const [liste, setListe] = useState<T[]>(() => lire());

  useEffect(() => {
    const maj = () => setListe(lire());
    maj();
    window.addEventListener(EVENEMENT_CONTENU, maj);
    window.addEventListener("storage", maj);
    return () => {
      window.removeEventListener(EVENEMENT_CONTENU, maj);
      window.removeEventListener("storage", maj);
    };
  }, [lire]);

  return liste;
}

export function useTemoignages(): Avis[] {
  return useListeContenu(lireTemoignages);
}

export function useEngagements(): EngagementEdit[] {
  return useListeContenu(lireEngagements);
}

export function useDomaines(): DomaineEdit[] {
  return useListeContenu(lireDomaines);
}
