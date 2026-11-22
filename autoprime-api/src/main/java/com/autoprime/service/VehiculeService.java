package com.autoprime.service;

import com.autoprime.dto.VehiculeDTO;
import com.autoprime.entity.Vehicule;
import com.autoprime.mapper.VehiculeMapper;
import com.autoprime.repository.VehiculeRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Service;

import java.util.List;

/** Logique métier des véhicules.
 * Règle 1 : cette classe ne renvoie QUE des DTOs (jamais l'entité).
 * Règle 3 : elle seule touche au repository (le contrôleur ne le voit pas).
 */
@Service
public class VehiculeService {

    private final VehiculeRepository repository;
    private final Counter vehiculesCreated;
    private final Counter vehiculesUpdated;
    private final Counter vehiculesDeleted;
    private final Gauge vehiculesTotal;

    public VehiculeService(VehiculeRepository repository, MeterRegistry registry) {
        this.repository = repository;
        this.vehiculesCreated = Counter.builder("autoprime.vehicules.creations")
                .description("Nombre de véhicules créés").register(registry);
        this.vehiculesUpdated = Counter.builder("autoprime.vehicules.updated")
                .description("Nombre de véhicules modifiés").register(registry);
        this.vehiculesDeleted = Counter.builder("autoprime.vehicules.deleted")
                .description("Nombre de véhicules supprimés").register(registry);
        this.vehiculesTotal = Gauge.builder("autoprime.vehicules.total", repository, VehiculeRepository::count)
                .description("Total véhicules en base").register(registry);
    }

    /** Tous les véhicules (page Admin + pages Vente/Location). */
    public List<VehiculeDTO> getAll() {
        return VehiculeMapper.toDTO(repository.findAll());
    }

    /** Filtrer par service : "Vente" ou "Location" (insensible à la casse). */
    public List<VehiculeDTO> getByService(String service) {
        return VehiculeMapper.toDTO(repository.findByServiceIgnoreCase(service));
    }

    /** Un véhicule par son id (fiche détail). */
    public VehiculeDTO getById(Long id) {
        return repository.findById(id)
                .map(VehiculeMapper::toDTO)
                .orElse(null);
    }

    /** Création (id null) ou mise à jour complète. */
    public VehiculeDTO save(VehiculeDTO dto) {
        boolean isNew = dto.getId() == null;
        Vehicule saved = repository.save(VehiculeMapper.toEntity(dto));
        if (isNew) {
            vehiculesCreated.increment();
        } else {
            vehiculesUpdated.increment();
        }
        return VehiculeMapper.toDTO(saved);
    }

    /** Suppression par id. */
    public boolean delete(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        vehiculesDeleted.increment();
        return true;
    }
}
