// Types de l'espace admin — alignés sur les entités du backend (super-auto-api)
// pour que le branchement API se fasse sans traduction.

/** Statut d'un message de contact (identique à l'entité Contact du backend). */
export type StatutMessage = "new" | "read" | "archived";

/** Statut d'une demande de devis transit (identique à l'entité DevisTransit). */
export type StatutDevis = "new" | "contacted" | "archived";

/** Message reçu via le formulaire de contact. */
export interface MessageContact {
  id: number;
  nom: string;
  email: string;
  telephone?: string;
  sujet: string;
  message: string;
  statut: StatutMessage;
  /** Date ISO (ex: "2026-09-28T10:15:00") */
  createdAt: string;
}

/** Demande de devis d'importation reçue via la page Transit. */
export interface DemandeDevis {
  id: number;
  nom: string;
  telephone: string;
  email?: string;
  vehicule: string;
  /** "france" | "usa" | "dubai" | "allemagne" | "autre" */
  pays: string;
  message?: string;
  statut: StatutDevis;
  createdAt: string;
}

/**
 * Statut d'un véhicule dans la flotte de location.
 * - "disponible" : louable immédiatement
 * - "loue"       : actuellement loué (voir une Location en cours)
 * - "maintenance" : révision, entretien, immobilisé
 */
export type StatutFlotte = "disponible" | "loue" | "maintenance";

/** Statut d'une location en cours. */
export type StatutLocation = "en_cours" | "a_rendre" | "prolongee" | "terminee";

/**
 * Véhicule de la flotte de location (section "Flotte" de /admin/location).
 * Complète l'entité Vehicule avec les données propres à la location.
 */
export interface VehiculeFlotte {
  /** Lien vers le véhicule du catalogue (id de type Vehicule). */
  id: number;
  marque: string;
  model: string;
  annee: number;
  type: string;
  image: string;
  /** Tarif journalier affiché (ex: "150 €/jour"). */
  tarifJour: string;
  /** Caution demandée au client (ex: "500 000 FCFA"). */
  caution: string;
  /** Nombre de places (ex: "7 places"). */
  places: string;
  climatisation: string;
  transmission: string;
  localisation: string;
  statut: StatutFlotte;
}

/** Location en cours : un client a loué un véhicule de la flotte. */
export interface Location {
  id: number;
  client: string;
  telephone: string;
  /** Véhicule loué (libellé "Marque Modèle"). */
  vehicule: string;
  /** Date de début au format YYYY-MM-DD. */
  dateDebut: string;
  /** Date de fin au format YYYY-MM-DD. */
  dateFin: string;
  /** Nombre de jours (recalculé si les dates changent). */
  jours: number;
  /** Montant total (tarif × jours). */
  montant: string;
  statut: StatutLocation;
  createdAt: string;
}

/** Un des 6 services du site (mirroir de src/data/services.ts). */
export interface ServiceItem {
  id: number;
  titre: string;
  description: string;
  icone: string;
  couleur: string;
  lien: string;
  hasLink: boolean;
  ordre: number;
}
