import type { SyntheticEvent } from "react";
import imageLocale from "@/assets/voiture.jpg";

/**
 * Photos de véhicules : repli local.
 *
 * Les fiches véhicules pointent vers les sites des constructeurs. Ces URL
 * peuvent expirer, bloquer le hotlinking ou n'être accessibles que depuis
 * certains réseaux. Sans repli, une carte d'inventaire affiche l'icône
 * « image cassée » et le titre alt à la place de la photo.
 *
 * `repliImage` bascule une seule fois sur la photo locale du showroom : un
 * véhicule sans photo reste lisible et la mise en page ne bouge pas.
 */
export const IMAGE_SECOURS = imageLocale;

export function repliImage(evenement: SyntheticEvent<HTMLImageElement>) {
  const img = evenement.currentTarget;
  if (img.dataset.repli === "1") return;
  img.dataset.repli = "1";
  img.src = IMAGE_SECOURS;
}
