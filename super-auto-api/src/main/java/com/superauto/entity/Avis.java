package com.superauto.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Table "avis" — témoignages clients affichés sur la page d'accueil.
 * Miroir du type TypeScript {@code Avis} (super-auto/src/types/avis.ts).
 */
@Entity
@Table(name = "avis")
public class Avis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    private String email;

    @Column(nullable = false, length = 2000)
    private String message;

    /** Initiales affichées dans le cercle (ex: "AD"). */
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

