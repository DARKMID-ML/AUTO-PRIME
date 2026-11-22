package com.autoprime.service;

import com.autoprime.dto.DevisTransitDTO;
import com.autoprime.entity.DevisTransit;
import com.autoprime.mapper.DevisTransitMapper;
import com.autoprime.repository.DevisTransitRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Service;

import java.util.List;

/** Service de gestion des devis de transit. */
@Service
public class DevisTransitService {

    private final DevisTransitRepository repository;
    private final Counter devisCreated;
    private final Gauge devisTotal;
    private final Counter devisNew;

    public DevisTransitService(DevisTransitRepository repository, MeterRegistry registry) {
        this.repository = repository;
        this.devisCreated = Counter.builder("autoprime.devis.creations")
                .description("Nombre de demandes de devis créées").register(registry);
        this.devisTotal = Gauge.builder("autoprime.devis.total", repository, DevisTransitRepository::count)
                .description("Total demandes de devis en base").register(registry);
        this.devisNew = Counter.builder("autoprime.devis.new")
                .description("Devis avec statut new").register(registry);
    }

    /** Toutes les demandes de devis. */
    public List<DevisTransitDTO> getAll() {
        List<DevisTransitDTO> list = DevisTransitMapper.toDTO(repository.findAll());
        long newCount = list.stream().filter(d -> "new".equals(d.getStatut())).count();
        devisNew.increment(newCount);
        return list;
    }

    /** Un devis par son id. */
    public DevisTransitDTO getById(Long id) {
        return repository.findById(id)
                .map(DevisTransitMapper::toDTO)
                .orElse(null);
    }

    /** Création (id null) ou mise à jour d'une demande existante. */
    public DevisTransitDTO save(DevisTransitDTO dto) {
        boolean isNew = dto.getId() == null;
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
        DevisTransit saved = repository.save(entity);
        if (isNew) {
            devisCreated.increment();
        }
        return DevisTransitMapper.toDTO(saved);
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
