package com.autoprime.mapper;

import com.autoprime.dto.ServiceDTO;
import com.autoprime.entity.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Conversion Entité {@code Service} ↔ DTO {@code ServiceDTO}.
 * Les résultats sont triés par {@code ordre} pour respecter l'affichage de la page.
 */
public final class ServiceMapper {

    private ServiceMapper() {
    }

    public static ServiceDTO toDTO(Service entity) {
        if (entity == null) {
            return null;
        }
        ServiceDTO dto = new ServiceDTO();
        dto.setId(entity.getId());
        dto.setTitre(entity.getTitre());
        dto.setDescription(entity.getDescription());
        dto.setIcone(entity.getIcone());
        dto.setCouleur(entity.getCouleur());
        dto.setLien(entity.getLien());
        dto.setHasLink(entity.getHasLink());
        dto.setOrdre(entity.getOrdre());
        return dto;
    }

    public static List<ServiceDTO> toDTO(List<Service> entities) {
        return entities.stream()
                .sorted(Comparator.comparing(e -> e.getOrdre() == null ? 0 : e.getOrdre()))
                .map(ServiceMapper::toDTO)
                .collect(Collectors.toList());
    }

    public static Service toEntity(ServiceDTO dto) {
        if (dto == null) {
            return null;
        }
        Service entity = new Service();
        entity.setId(dto.getId());
        entity.setTitre(dto.getTitre());
        entity.setDescription(dto.getDescription());
        entity.setIcone(dto.getIcone());
        entity.setCouleur(dto.getCouleur());
        entity.setLien(dto.getLien());
        entity.setHasLink(dto.getHasLink());
        entity.setOrdre(dto.getOrdre());
        return entity;
    }
}
