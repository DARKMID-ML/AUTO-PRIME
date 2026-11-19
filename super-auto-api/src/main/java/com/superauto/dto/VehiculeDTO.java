package com.superauto.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.ArrayList;
import java.util.List;

/**
 * Réponse véhicule — copie du type TS {@code Vehicule} pour le front.
 * Sérialisé en JSON tel quel par Spring (getters Java → champs JSON).
 * Les annotations servent à la validation des créations / modifications
 * (erreur 400 claire au lieu d'une erreur 500 en base).
 */
public class VehiculeDTO {

    private Long id;

    @NotBlank(message = "La marque est obligatoire")
    private String marque;

    @NotBlank(message = "Le modèle est obligatoire")
    private String model;

    @NotNull(message = "L'année est obligatoire")
    private Integer annee;
    private String type;
    private String prix;
    private String image;
    private String description;
    private String statut;
    private String service;
    private String km;
    private String consomation;
    private String transmission;
    private String places;
    private String climatisation;
    private String atouts;
    private String peinture;
    private String interieur;
    private String category;
    private String carburant;
    private String localisation;

    /** Galerie du véhicule (renvoyée comme tableau JSON). */
    private List<String> photos;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMarque() { return marque; }
    public void setMarque(String marque) { this.marque = marque; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Integer getAnnee() { return annee; }
    public void setAnnee(Integer annee) { this.annee = annee; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getPrix() { return prix; }
    public void setPrix(String prix) { this.prix = prix; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public String getService() { return service; }
    public void setService(String service) { this.service = service; }

    public String getKm() { return km; }
    public void setKm(String km) { this.km = km; }

    public String getConsomation() { return consomation; }
    public void setConsomation(String consomation) { this.consomation = consomation; }

    public String getTransmission() { return transmission; }
    public void setTransmission(String transmission) { this.transmission = transmission; }

    public String getPlaces() { return places; }
    public void setPlaces(String places) { this.places = places; }

    public String getClimatisation() { return climatisation; }
    public void setClimatisation(String climatisation) { this.climatisation = climatisation; }

    public String getAtouts() { return atouts; }
    public void setAtouts(String atouts) { this.atouts = atouts; }

    public String getPeinture() { return peinture; }
    public void setPeinture(String peinture) { this.peinture = peinture; }

    public String getInterieur() { return interieur; }
    public void setInterieur(String interieur) { this.interieur = interieur; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getCarburant() { return carburant; }
    public void setCarburant(String carburant) { this.carburant = carburant; }

    public String getLocalisation() { return localisation; }
    public void setLocalisation(String localisation) { this.localisation = localisation; }

    public List<String> getPhotos() {
        return photos == null ? new ArrayList<>() : photos;
    }

    public void setPhotos(List<String> photos) {
        this.photos = photos == null ? new ArrayList<>() : photos;
    }
}
