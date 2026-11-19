package com.superauto.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Corps attendu pour POST /api/transit/quote — champs exacts du formulaire
 * dans Transit.tsx (nom, telephone, email, vehicule, pays, message).
 * Le guide expliquera comment le valider avec @Valid dans le contrôleur.
 */
public class DevisTransitRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le téléphone est obligatoire")
    private String telephone;

    @Email(message = "Email invalide")
    private String email;

    @NotBlank(message = "Le véhicule est obligatoire")
    private String vehicule;

    private String pays;

    private String message;

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getVehicule() { return vehicule; }
    public void setVehicule(String vehicule) { this.vehicule = vehicule; }

    public String getPays() { return pays; }
    public void setPays(String pays) { this.pays = pays; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
