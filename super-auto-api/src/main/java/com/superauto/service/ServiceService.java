package com.superauto.service;

import com.superauto.dto.ServiceDTO;
import com.superauto.entity.Service;
import com.superauto.mapper.ServiceMapper;
import com.superauto.repository.ServiceRepository;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Logique métier des domaines d'expertise affichés
 * (page Services + section Accueil).
 */
@Component
public class ServiceService {

    private final ServiceRepository repository;

    public ServiceService(ServiceRepository repository) {
        this.repository = repository;
    }

    /** Liste ordonnée par le champ "ordre". */
    public List<ServiceDTO> getAll() {
        return repository.findAllByOrderByOrdreAsc().stream()
                .map(ServiceMapper::toDTO)
                .toList();
    }

    public ServiceDTO getById(Long id) {
        return repository.findById(id)
                .map(ServiceMapper::toDTO)
                .orElse(null);
    }

    public ServiceDTO save(ServiceDTO dto) {
        Service saved = repository.save(ServiceMapper.toEntity(dto));
        return ServiceMapper.toDTO(saved);
    }

    public boolean delete(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }
}
