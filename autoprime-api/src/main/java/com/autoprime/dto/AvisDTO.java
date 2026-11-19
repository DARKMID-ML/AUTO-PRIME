package com.autoprime.dto;

import jakarta.validation.constraints.NotBlank;

/** Réponse avis — témoignage client affiché sur l'accueil. */
public class AvisDTO {

    private Long id;

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    private String email;

    @NotBlank(message = "Le message est obligatoire")
    private String message;
    private String initiales;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getInitiales() { return initiales; }
    public void setInitiales(String initiales) { this.initiales = initiales; }
}
