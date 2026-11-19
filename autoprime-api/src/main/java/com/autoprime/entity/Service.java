package com.autoprime.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Table "services" — les 6 services présentés sur la page Services.
 * Miroir de src/data/services.ts (tableau {@code services}).
 */
@Entity
@Table(name = "services")
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(nullable = false, length = 2000)
    private String description;

    /** Nom de l'icône Material Symbols (ex: "directions_car"). */
    private String icone;

    /** Classe Tailwind de couleur (ex: "bg-brand-red"). */
    private String couleur;

    /** Lien interne (ex: "/vente") — vide si aucun. */
    private String lien;

    @Column(nullable = false)
    private Boolean hasLink = false;

    /** Ordre d'affichage sur la page. */
    private Integer ordre;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIcone() { return icone; }
    public void setIcone(String icone) { this.icone = icone; }

    public String getCouleur() { return couleur; }
    public void setCouleur(String couleur) { this.couleur = couleur; }

    public String getLien() { return lien; }
    public void setLien(String lien) { this.lien = lien; }

    public Boolean getHasLink() { return hasLink; }
    public void setHasLink(Boolean hasLink) { this.hasLink = hasLink; }

    public Integer getOrdre() { return ordre; }
    public void setOrdre(Integer ordre) { this.ordre = ordre; }
}
