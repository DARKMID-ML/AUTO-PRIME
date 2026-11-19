package com.autoprime.repository;

import com.autoprime.entity.DevisTransit;
import org.springframework.data.jpa.repository.JpaRepository;

/** Accès aux données de la table "devis_transit". */
public interface DevisTransitRepository extends JpaRepository<DevisTransit, Long> {
}
