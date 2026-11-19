package com.autoprime.service;

import com.autoprime.dto.DevisTransitDTO;
import com.autoprime.entity.DevisTransit;
import com.autoprime.mapper.DevisTransitMapper;
import com.autoprime.repository.DevisTransitRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/** Service de gestion des devis de transit. */
@Service
public class DevisTransitService {

    private final DevisTransitRepository repository;

    public DevisTransitService(DevisTransitRepository repository) {
        this.repository = repository;
    }

    /** Toutes les demandes de devis. */
    public List<DevisTransitDTO> getAll() {
        return DevisTransitMapper.toDTO(repository.findAll());
    }

    /** Un devis par son id. */
    public DevisTransitDTO getById(Long id) {
        return repository.findById(id)
                .map(DevisTransitMapper::toDTO)
                .orElse(null);
    }

    /** Création (id null) ou mise à jour d'une demande existante. */
    public DevisTransitDTO save(DevisTransitDTO dto) {
        DevisTransit entity = dto.getId() != null
                ? repository.findById(dto.getId()).orElseGet(DevisTransit::new)
                : new DevisTransit();

        entity.setNom(dto.getNom());
        entity.setTelephone(dto.getTelephone());
        entity.setEmail(dto.getEmail());
        entity.setVehicule(dto.getVehicule());
        entity.setPays(dto.getPays());
        entity.setMessage(dto.getMessage());
        if (dto.getStatut() != null && !dto.getStatut().isBlank()) {
            entity.setStatut(dto.getStatut());
        } else if (entity.getStatut() == null) {
            entity.setStatut("new");
        }
        return DevisTransitMapper.toDTO(repository.save(entity));
    }

    /** Change le statut d'une demande (contacté / archivé). */
    public DevisTransitDTO changerStatut(Long id, String statut) {
        return repository.findById(id)
                .map(entity -> {
                    entity.setStatut(statut);
                    return DevisTransitMapper.toDTO(repository.save(entity));
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
