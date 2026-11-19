package com.autoprime.mapper;

import com.autoprime.dto.AvisDTO;
import com.autoprime.entity.Avis;

import java.util.List;
import java.util.stream.Collectors;

/** Conversion Entité {@code Avis} ↔ DTO {@code AvisDTO}. */
public final class AvisMapper {

    private AvisMapper() {
    }

    public static AvisDTO toDTO(Avis entity) {
        if (entity == null) {
            return null;
        }
        AvisDTO dto = new AvisDTO();
        dto.setId(entity.getId());
        dto.setNom(entity.getNom());
        dto.setEmail(entity.getEmail());
        dto.setMessage(entity.getMessage());
        dto.setInitiales(entity.getInitiales());
        return dto;
    }

    public static List<AvisDTO> toDTO(List<Avis> entities) {
        return entities.stream()
                .map(AvisMapper::toDTO)
                .collect(Collectors.toList());
    }

    public static Avis toEntity(AvisDTO dto) {
        if (dto == null) {
            return null;
        }
        Avis entity = new Avis();
        entity.setId(dto.getId());
        entity.setNom(dto.getNom());
        entity.setEmail(dto.getEmail());
        entity.setMessage(dto.getMessage());
        entity.setInitiales(dto.getInitiales());
        return entity;
    }
}
