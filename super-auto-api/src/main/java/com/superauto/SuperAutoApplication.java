package com.superauto;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Point d'entrée du backend Super Auto.
 *
 * Les packages du projet :
 * - com.superauto.entity      → entités JPA (tables SQLite)
 * - com.superauto.dto         → objets échangés avec le front (requêtes/réponses)
 * - com.superauto.mapper      → conversion Entité ↔ DTO
 * - com.superauto.repository  → interfaces Spring Data JPA (accès aux données)
 */
@SpringBootApplication
public class SuperAutoApplication {

    public static void main(String[] args) {
        SpringApplication.run(SuperAutoApplication.class, args);
    }
}
