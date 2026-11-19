package com.superauto.dto;

import com.superauto.entity.Compte;

/** Compte utilisateur renvoyé à l'écran « Comptes » (sans le mot de passe). */
public record CompteDTO(
        Long id,
        String nom,
        String identifiant,
        String role,
        Boolean actif,
        String dateCreation
) {
    public static CompteDTO de(Compte compte) {
        return new CompteDTO(
                compte.getId(),
                compte.getNom(),
                compte.getIdentifiant(),
                compte.getRole(),
                compte.getActif(),
                compte.getDateCreation() == null ? null : compte.getDateCreation().toString());
    }
}
