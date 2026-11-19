package com.superauto.service;

import com.superauto.dto.VehiculeDTO;
import com.superauto.entity.Vehicule;
import com.superauto.mapper.VehiculeMapper;
import com.superauto.repository.VehiculeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/** Logique métier des véhicules.
 * Règle 1 : cette classe ne renvoie QUE des DTOs (jamais l'entité).
 * Règle 3 : elle seule touche au repository (le contrôleur ne le voit pas).
 */
@Service
public class VehiculeService {

    private final VehiculeRepository repository;

    public VehiculeService(VehiculeRepository repository) {
        this.repository = repository;
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
        Vehicule saved = repository.save(VehiculeMapper.toEntity(dto));
        return VehiculeMapper.toDTO(saved);
    }

    /** Suppression par id. */
    public boolean delete(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }
}
