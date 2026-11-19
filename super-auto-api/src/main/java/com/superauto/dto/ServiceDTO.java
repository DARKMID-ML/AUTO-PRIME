package com.superauto.dto;

import jakarta.validation.constraints.NotBlank;

/** Réponse service — un des 6 services de la page Services. */
public class ServiceDTO {

    private Long id;

    @NotBlank(message = "Le titre est obligatoire")
    private String titre;

    @NotBlank(message = "La description est obligatoire")
    private String description;
    private String icone;
    private String couleur;
    private String lien;
    private Boolean hasLink;
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
