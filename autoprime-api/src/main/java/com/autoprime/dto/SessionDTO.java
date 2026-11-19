package com.autoprime.dto;

/**
 * Session renvoyée par POST /api/auth/login et GET /api/auth/moi.
 * Le front stocke le jeton et l'envoie ensuite dans l'en-tête
 * "Authorization: Bearer &lt;jeton&gt;".
 */
public record SessionDTO(
        String token,
        String identifiant,
        String nom,
        String role
) {
}
