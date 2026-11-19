package com.superauto.repository;

import com.superauto.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Accès aux données de la table "services".
 */
public interface ServiceRepository extends JpaRepository<Service, Long> {

    /** Les services dans l'ordre d'affichage. */
    List<Service> findAllByOrderByOrdreAsc();
}
