package com.superauto.dto;

/**
 * Résultat de la création d'un compte : le compte créé et son mot de passe
 * en clair, affiché UNE SEULE FOIS au mainteneur (il n'est jamais stocké).
 */
public record CompteCreeDTO(CompteDTO compte, String motDePasse) {
}
