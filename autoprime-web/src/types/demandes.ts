// Types des demandes clients : location, essai et sinistres.
// Les champs restent alignés sur les entités Spring Boot (autoprime-api).

/** Statut d'une demande (location ou essai). */
export type StatutDemande = "en_attente" | "validee" | "refusee";

/** Statut d'un sinistre déclaré après une location. */
export type StatutSinistre = "recue" | "en_examen" | "acceptee" | "refusee";

/** Types de justificatifs que le client peut choisir d'envoyer. */
export type TypeJustificatif =
  | "permis"
  | "identite"
  | "photo_vehicule"
  | "constat"
  | "facture"
  | "autre";

/** Un justificatif envoyé par le client. */
export interface Justificatif {
  type: TypeJustificatif;
  /** Libellé affiché (ex: "Permis de conduire"). */
  libelle: string;
  /** Nom du fichier joint (si le client a ajouté un fichier). */
  nomFichier?: string;
  /** Lien externe fourni par le client (Drive, WhatsApp…). */
  lien?: string;
  /** Aperçu local (data URL) pour les images, si la taille le permet. */
  apercu?: string;
  /** Taille du fichier en octets. */
  taille?: number;
}

/** Demande de location soumise depuis la fiche d'un véhicule. */
export interface DemandeLocation {
  id: number;
  client: string;
  telephone: string;
  email?: string;
  /** "Marque Modèle" du véhicule demandé. */
  vehicule: string;
  dateDebut: string;
  dateFin: string;
  jours: number;
  message?: string;
  justificatifs: Justificatif[];
  statut: StatutDemande;
  /** Raison du refus, remplie par l'admin. */
  motifRefus?: string;
  createdAt: string;
}

/** Demande d'essai soumise depuis la fiche d'un véhicule à la vente. */
export interface DemandeEssai {
  id: number;
  client: string;
  telephone: string;
  email?: string;
  vehicule: string;
  dateEssai: string;
  message?: string;
  justificatifs: Justificatif[];
  statut: StatutDemande;
  motifRefus?: string;
  createdAt: string;
}

/** Sinistre déclaré par un client après une location. */
export interface Sinistre {
  id: number;
  client: string;
  telephone: string;
  /** Véhicule concerné ("Marque Modèle"). */
  vehicule: string;
  immatriculation?: string;
  dateIncident: string;
  description: string;
  /** "mineure" = rayure / petit dégât, "majeure" = panne / accident. */
  gravite: "mineure" | "majeure";
  justificatifs: Justificatif[];
  statut: StatutSinistre;
  /** Réponse donnée par l'admin à la demande d'indemnisation. */
  decision?: string;
  createdAt: string;
}

/** Contenu complet du store local (le temps que l'API prenne le relais). */
export interface StoreDemandes {
  locations: DemandeLocation[];
  essais: DemandeEssai[];
  sinistres: Sinistre[];
}
