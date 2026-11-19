package com.autoprime;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Point d'entrée du backend AutoPrime.
 *
 * Les packages du projet :
 * - com.autoprime.entity      → entités JPA (tables SQLite)
 * - com.autoprime.dto         → objets échangés avec le front (requêtes/réponses)
 * - com.autoprime.mapper      → conversion Entité ↔ DTO
 * - com.autoprime.repository  → interfaces Spring Data JPA (accès aux données)
 */
@SpringBootApplication
public class AutoPrimeApplication {

    public static void main(String[] args) {
        SpringApplication.run(AutoPrimeApplication.class, args);
    }
}
