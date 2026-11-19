package com.autoprime.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;

/**
 * Compte utilisateur du site de ce déploiement.
 *
 * Trois rôles :
 *   - `admin`   : le responsable du site (créé au premier démarrage) ;
 *   - `vendeur` : un employé, accès limité au catalogue et aux demandes ;
 *   - `dev`     : compte technique du mainteneur, défini dans la configuration
 *                 (il n'est PAS stocké dans cette table).
 *
 * Le mot de passe n'est jamais stocké en clair : seule son empreinte SHA-256
 * est conservée.
 */
@Entity
@Table(name = "comptes")
public class Compte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String identifiant;

    @Column(nullable = false)
    private String motDePasseHash;

    @Column(nullable = false)
    private String nom;

    /** "admin" ou "vendeur". */
    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private Boolean actif = Boolean.TRUE;

    @Column(nullable = false)
    private LocalDate dateCreation;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIdentifiant() { return identifiant; }
    public void setIdentifiant(String identifiant) { this.identifiant = identifiant; }

    public String getMotDePasseHash() { return motDePasseHash; }
    public void setMotDePasseHash(String motDePasseHash) { this.motDePasseHash = motDePasseHash; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Boolean getActif() { return actif; }
    public void setActif(Boolean actif) { this.actif = actif; }

    public LocalDate getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDate dateCreation) { this.dateCreation = dateCreation; }
}
