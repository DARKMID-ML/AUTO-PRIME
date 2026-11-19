package com.superauto.repository;

import com.superauto.entity.Compte;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/** Accès aux comptes utilisateurs du site (admin + vendeurs). */
public interface CompteRepository extends JpaRepository<Compte, Long> {

    Optional<Compte> findByIdentifiant(String identifiant);

    boolean existsByIdentifiant(String identifiant);

    boolean existsByRole(String role);

    long countByRole(String role);

    long countByRoleAndActifTrue(String role);

    List<Compte> findAllByOrderByRoleAscNomAsc();
}
