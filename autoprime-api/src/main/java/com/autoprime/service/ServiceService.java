package com.autoprime.service;

import com.autoprime.dto.ServiceDTO;
import com.autoprime.entity.Service;
import com.autoprime.mapper.ServiceMapper;
import com.autoprime.repository.ServiceRepository;
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
