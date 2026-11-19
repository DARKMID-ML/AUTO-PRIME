package com.superauto.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Corps attendu pour POST /api/auth/login.
 * Le compte admin est créé au premier démarrage (section app.admin) ; le
 * compte technique `dev` est défini dans la configuration de l'API.
 */
public class LoginRequest {

    @NotBlank(message = "L'identifiant est obligatoire")
    private String identifiant;

    @NotBlank(message = "Le mot de passe est obligatoire")
    private String motDePasse;

    public String getIdentifiant() { return identifiant; }
    public void setIdentifiant(String identifiant) { this.identifiant = identifiant; }

    public String getMotDePasse() { return motDePasse; }
    public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }
}
