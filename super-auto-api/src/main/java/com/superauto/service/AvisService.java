package com.superauto.service;

import com.superauto.dto.AvisDTO;
import com.superauto.entity.Avis;
import com.superauto.mapper.AvisMapper;
import com.superauto.repository.AvisRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/** Logique métier des témoignages clients (section Accueil). */
@Service
public class AvisService {

    private final AvisRepository repository;

    public AvisService(AvisRepository repository) {
        this.repository = repository;
    }

    /** Tous les témoignages. */
    public List<AvisDTO> getAll() {
        return AvisMapper.toDTO(repository.findAll());
    }

    public AvisDTO getById(Long id) {
        return repository.findById(id)
                .map(AvisMapper::toDTO)
                .orElse(null);
    }

    public AvisDTO save(AvisDTO dto) {
        Avis saved = repository.save(AvisMapper.toEntity(dto));
        return AvisMapper.toDTO(saved);
    }

    public boolean delete(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }
}
