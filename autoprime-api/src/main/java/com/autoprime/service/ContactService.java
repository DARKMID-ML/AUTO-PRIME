package com.autoprime.service;

import com.autoprime.dto.ContactDTO;
import com.autoprime.entity.Contact;
import com.autoprime.mapper.ContactMapper;
import com.autoprime.repository.ContactRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Service;

import java.util.List;

/** Service de gestion des contacts (boîte de réception admin). */
@Service
public class ContactService {

    private final ContactRepository repository;
    private final Counter contactCreated;
    private final Gauge contactTotal;
    private final Counter contactNew;

    public ContactService(ContactRepository repository, MeterRegistry registry) {
        this.repository = repository;
        this.contactCreated = Counter.builder("autoprime.contact.creations")
                .description("Nombre de messages de contact créés").register(registry);
        this.contactTotal = Gauge.builder("autoprime.contact.total", repository, ContactRepository::count)
                .description("Total messages contact en base").register(registry);
        this.contactNew = Counter.builder("autoprime.messages.new")
                .description("Messages avec statut new").register(registry);
    }

    /** Tous les messages reçus. */
    public List<ContactDTO> getAll() {
        List<ContactDTO> list = ContactMapper.toDTO(repository.findAll());
        long newCount = list.stream().filter(c -> "new".equals(c.getStatut())).count();
        contactNew.increment(newCount);
        return list;
    }

    /** Un contact par son id. */
    public ContactDTO getById(Long id) {
        return repository.findById(id)
                .map(ContactMapper::toDTO)
                .orElse(null);
    }

    /** Création (id null) ou mise à jour d'un message existant. */
    public ContactDTO save(ContactDTO dto) {
        boolean isNew = dto.getId() == null;
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
        Contact saved = repository.save(entity);
        if (isNew) {
            contactCreated.increment();
        }
        return ContactMapper.toDTO(saved);
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
