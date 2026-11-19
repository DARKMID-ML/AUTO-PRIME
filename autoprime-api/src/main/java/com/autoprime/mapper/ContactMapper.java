package com.autoprime.mapper;

import com.autoprime.dto.ContactDTO;
import com.autoprime.dto.ContactRequest;
import com.autoprime.entity.Contact;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Conversion pour {@code Contact} :
 * - Contact → ContactDTO   : réponse (message enregistré)
 * - ContactRequest → Contact : corps de POST /api/contact vers l'entité
 */
public final class ContactMapper {

    private ContactMapper() {
    }

    public static ContactDTO toDTO(Contact entity) {
        if (entity == null) {
            return null;
        }
        ContactDTO dto = new ContactDTO();
        dto.setId(entity.getId());
        dto.setNom(entity.getNom());
        dto.setEmail(entity.getEmail());
        dto.setTelephone(entity.getTelephone());
        dto.setSujet(entity.getSujet());
        dto.setMessage(entity.getMessage());
        dto.setStatut(entity.getStatut());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    public static List<ContactDTO> toDTO(List<Contact> entities) {
        return entities.stream()
                .map(ContactMapper::toDTO)
                .collect(Collectors.toList());
    }

    /** Crée une entité (statut "new", createdAt auto via @PrePersist) depuis la requête du front. */
    public static Contact toEntity(ContactRequest request) {
        if (request == null) {
            return null;
        }
        Contact entity = new Contact();
        entity.setNom(request.getNom());
        entity.setEmail(request.getEmail());
        entity.setTelephone(request.getTelephone());
        entity.setSujet(request.getSujet());
        entity.setMessage(request.getMessage());
        return entity;
    }
}
