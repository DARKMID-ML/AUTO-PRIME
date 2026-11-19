package com.autoprime.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Table "vehicules" — miroir exact du type TypeScript {@code Vehicule}
 * (autoprime-web/src/types/vehicule.ts). Les noms de champs sont en français
 * pour rester 1:1 avec le front.
 */
@Entity
@Table(name = "vehicules")
public class Vehicule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String marque;

    @Column(nullable = false)
    private String model;

    @Column(nullable = false)
    private Integer annee;

    /** Type de véhicule : "Berline", "SUV", "Pick-up"... */
    private String type;

    /** Prix formaté tel qu'affiché côté front (ex: "45 000 €"). */
    private String prix;

    private String image;

    @Column(length = 2000)
    private String description;

    /** "Disponible", "Réservé", "Vendu", "Nouveau" */
    private String statut;

    /** "Vente" ou "Location" */
    private String service;

    private String km;
    private String consomation;
    private String transmission;
    private String places;
    private String climatisation;

    /** Points forts séparés par des virgules (ex: "4x4 permanent, Caméra 360°"). */
    @Column(length = 2000)
    private String atouts;

    private String peinture;
    private String interieur;

    /** "Électrique", "4x4", "Luxe"... */
    private String category;

    /** "Diesel", "Essence", "Électrique"... */
    private String carburant;

    /** "Bamako", "Kayes"... */
    private String localisation;

    /** Galerie : chemins séparés par des virgules (la 1re photo = image principale). */
    @Column(length = 2000)
    private String photos;

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

    public String getPhotos() { return photos; }
    public void setPhotos(String photos) { this.photos = photos; }
}