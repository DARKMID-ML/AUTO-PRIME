package com.superauto.mapper;

import com.superauto.dto.VehiculeDTO;
import com.superauto.entity.Vehicule;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Conversion Entité {@code Vehicule} ↔ DTO {@code VehiculeDTO}.
 * Mappings manuels : les noms de champs sont identiques des deux côtés,
 * il suffit donc de recopier chaque champ.
 */
public final class VehiculeMapper {

    private VehiculeMapper() {
        // classe utilitaire : pas d'instanciation
    }

    public static VehiculeDTO toDTO(Vehicule entity) {
        if (entity == null) {
            return null;
        }
        VehiculeDTO dto = new VehiculeDTO();
        dto.setId(entity.getId());
        dto.setMarque(entity.getMarque());
        dto.setModel(entity.getModel());
        dto.setAnnee(entity.getAnnee());
        dto.setType(entity.getType());
        dto.setPrix(entity.getPrix());
        dto.setImage(entity.getImage());
        dto.setDescription(entity.getDescription());
        dto.setStatut(entity.getStatut());
        dto.setService(entity.getService());
        dto.setKm(entity.getKm());
        dto.setConsomation(entity.getConsomation());
        dto.setTransmission(entity.getTransmission());
        dto.setPlaces(entity.getPlaces());
        dto.setClimatisation(entity.getClimatisation());
        dto.setAtouts(entity.getAtouts());
        dto.setPeinture(entity.getPeinture());
        dto.setInterieur(entity.getInterieur());
        dto.setCategory(entity.getCategory());
        dto.setCarburant(entity.getCarburant());
        dto.setLocalisation(entity.getLocalisation());
        dto.setPhotos(versListe(entity.getPhotos()));
        return dto;
    }

    public static List<VehiculeDTO> toDTO(List<Vehicule> entities) {
        return entities.stream()
                .map(VehiculeMapper::toDTO)
                .collect(Collectors.toList());
    }

    public static Vehicule toEntity(VehiculeDTO dto) {
        if (dto == null) {
            return null;
        }
        Vehicule entity = new Vehicule();
        entity.setId(dto.getId());
        entity.setMarque(dto.getMarque());
        entity.setModel(dto.getModel());
        entity.setAnnee(dto.getAnnee());
        entity.setType(dto.getType());
        entity.setPrix(dto.getPrix());
        entity.setImage(dto.getImage());
        entity.setDescription(dto.getDescription());
        entity.setStatut(dto.getStatut());
        entity.setService(dto.getService());
        entity.setKm(dto.getKm());
        entity.setConsomation(dto.getConsomation());
        entity.setTransmission(dto.getTransmission());
        entity.setPlaces(dto.getPlaces());
        entity.setClimatisation(dto.getClimatisation());
        entity.setAtouts(dto.getAtouts());
        entity.setPeinture(dto.getPeinture());
        entity.setInterieur(dto.getInterieur());
        entity.setCategory(dto.getCategory());
        entity.setCarburant(dto.getCarburant());
        entity.setLocalisation(dto.getLocalisation());
        entity.setPhotos(versChaine(dto.getPhotos()));
        return entity;
    }

    /** "a.jpg,b.jpg" → ["a.jpg","b.jpg"] (tolère les espaces et les valeurs vides). */
    private static List<String> versListe(String brut) {
        if (brut == null || brut.isBlank()) {
            return new ArrayList<>();
        }
        return java.util.Arrays.stream(brut.split(","))
                .map(String::trim)
                .filter(morceau -> !morceau.isEmpty())
                .collect(Collectors.toList());
    }

    /** ["a.jpg","b.jpg"] → "a.jpg,b.jpg|null" */
    private static String versChaine(List<String> liste) {
        if (liste == null || liste.isEmpty()) {
            return null;
        }
        return liste.stream()
                .filter(morceau -> morceau != null && !morceau.isBlank())
                .map(String::trim)
                .collect(Collectors.joining(","));
    }
}
