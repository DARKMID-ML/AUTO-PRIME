import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useLienMesDemandes } from "@/config/pages";

interface Props {
  /** Classes du lien (chaîne ou fonction recevant l'état actif). */
  className?: string | ((etat: { isActive: boolean }) => string);
  onClick?: () => void;
  /** Décor affiché avant le libellé (puce, icône…). */
  avant?: ReactNode;
  /** Décor affiché après le libellé (soulignement animé, icône…). */
  apres?: ReactNode;
}

/**
 * Lien « Suivi de demande » partagé par les compositions Signature, Atelier
 * et Catalogue : libellé, route et condition d'activation viennent de
 * `@/config/pages`, chaque composition n'apportant que son habillage.
 */
export default function LienMesDemandes({ className, onClick, avant, apres }: Props) {
  const lien = useLienMesDemandes();
  if (!lien) {
    return null;
  }

  return (
    <NavLink to={lien.to} className={className} onClick={onClick}>
      {avant}
      {lien.nom}
      {apres}
    </NavLink>
  );
}
