import type { StatutFlotte, StatutLocation } from "@/types/admin";

// Libellés / couleurs des statuts de la flotte
export const STATUTS_FLOTTE: { valeur: StatutFlotte; label: string; couleur: string }[] = [
  { valeur: "disponible", label: "Disponible", couleur: "bg-green-500" },
  { valeur: "loue", label: "Loué", couleur: "bg-brand-blue" },
  { valeur: "maintenance", label: "Maintenance", couleur: "bg-orange-500" },
];

// Libellés / couleurs des statuts de location
export const STATUTS_LOCATION: { valeur: StatutLocation; label: string; couleur: string }[] = [
  { valeur: "en_cours", label: "En cours", couleur: "bg-brand-blue text-white" },
  { valeur: "a_rendre", label: "À rendre", couleur: "bg-orange-500 text-white" },
  { valeur: "prolongee", label: "Prolongée", couleur: "bg-brand-red text-white" },
  { valeur: "terminee", label: "Terminée", couleur: "bg-gray-400 text-white" },
];

export function labelFlotte(statut: StatutFlotte): string {
  return STATUTS_FLOTTE.find((s) => s.valeur === statut)?.label ?? statut;
}

export function couleurFlotte(statut: StatutFlotte): string {
  return STATUTS_FLOTTE.find((s) => s.valeur === statut)?.couleur ?? "bg-gray-400";
}

export function labelLocation(statut: StatutLocation): string {
  return STATUTS_LOCATION.find((s) => s.valeur === statut)?.label ?? statut;
}

export function couleurLocation(statut: StatutLocation): string {
  return STATUTS_LOCATION.find((s) => s.valeur === statut)?.couleur ?? "bg-gray-400 text-white";
}
