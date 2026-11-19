package com.superauto.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Corps attendu pour POST /api/contact — champs exacts du formulaire
 * dans Contact.tsx (nom, email, telephone, sujet, message).
 */
public class ContactRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Email invalide")
    private String email;

    private String telephone;

    private String sujet;

    @NotBlank(message = "Le message est obligatoire")
    private String message;

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public String getSujet() { return sujet; }
    public void setSujet(String sujet) { this.sujet = sujet; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
