package com.autoprime.service;

import com.autoprime.dto.ContactDTO;
import com.autoprime.entity.Contact;
import com.autoprime.mapper.ContactMapper;
import com.autoprime.repository.ContactRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/** Service de gestion des contacts (boîte de réception admin). */
@Service
public class ContactService {

    private final ContactRepository repository;

    public ContactService(ContactRepository repository) {
        this.repository = repository;
    }

    /** Tous les messages reçus. */
    public List<ContactDTO> getAll() {
        return ContactMapper.toDTO(repository.findAll());
    }

    /** Un contact par son id. */
    public ContactDTO getById(Long id) {
        return repository.findById(id)
                .map(ContactMapper::toDTO)
                .orElse(null);
    }

    /** Création (id null) ou mise à jour d'un message existant. */
    public ContactDTO save(ContactDTO dto) {
        Contact entity = dto.getId() != null
                ? repository.findById(dto.getId()).orElseGet(Contact::new)
                : new Contact();

        entity.setNom(dto.getNom());
        entity.setEmail(dto.getEmail());
        entity.setTelephone(dto.getTelephone());
        entity.setSujet(dto.getSujet());
        entity.setMessage(dto.getMessage());
        if (dto.getStatut() != null && !dto.getStatut().isBlank()) {
            entity.setStatut(dto.getStatut());
        } else if (entity.getStatut() == null) {
            entity.setStatut("new");
        }
        return ContactMapper.toDTO(repository.save(entity));
    }

    /** Change le statut d'un message (lu / archivé). */
    public ContactDTO changerStatut(Long id, String statut) {
        return repository.findById(id)
                .map(entity -> {
                    entity.setStatut(statut);
                    return ContactMapper.toDTO(repository.save(entity));
                })
                .orElse(null);
    }

    public boolean delete(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }
}
