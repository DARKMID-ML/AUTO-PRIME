/** Formatage d'une date ISO en "01 oct. 2026 à 09:24" (français). */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Nombre de jours entre deux dates ISO (YYYY-MM-DD).
 * Sert au suivi des locations : la durée se recalcule dès que les dates changent.
 */
export function calculerJours(debut: string, fin: string): number {
  const d1 = new Date(debut);
  const d2 = new Date(fin);
  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return 0;
  const diff = Math.round((d2.getTime() - d1.getTime()) / 86400000);
  return diff > 0 ? diff : 0;
}

/** Initiales d'un nom complet (ex: "Amadou Diallo" → "AD"). */
export function initiales(nom: string): string {
  return nom
    .split(" ")
    .map((mot) => mot[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
