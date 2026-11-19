package com.superauto.mapper;

import com.superauto.dto.DevisTransitDTO;
import com.superauto.dto.DevisTransitRequest;
import com.superauto.entity.DevisTransit;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Conversion pour {@code DevisTransit} :
 * - DevisTransit → DevisTransitDTO   : réponse
 * - DevisTransitRequest → DevisTransit : corps de POST /api/transit/quote
 */
public final class DevisTransitMapper {

    private DevisTransitMapper() {
    }

    public static DevisTransitDTO toDTO(DevisTransit entity) {
        if (entity == null) {
            return null;
        }
        DevisTransitDTO dto = new DevisTransitDTO();
        dto.setId(entity.getId());
        dto.setNom(entity.getNom());
        dto.setTelephone(entity.getTelephone());
        dto.setEmail(entity.getEmail());
        dto.setVehicule(entity.getVehicule());
        dto.setPays(entity.getPays());
        dto.setMessage(entity.getMessage());
        dto.setStatut(entity.getStatut());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    public static List<DevisTransitDTO> toDTO(List<DevisTransit> entities) {
        return entities.stream()
                .map(DevisTransitMapper::toDTO)
                .collect(Collectors.toList());
    }

    public static DevisTransit toEntity(DevisTransitRequest request) {
        if (request == null) {
            return null;
        }
        DevisTransit entity = new DevisTransit();
        entity.setNom(request.getNom());
        entity.setTelephone(request.getTelephone());
        entity.setEmail(request.getEmail());
        entity.setVehicule(request.getVehicule());
        entity.setPays(request.getPays());
        entity.setMessage(request.getMessage());
        return entity;
    }
}
