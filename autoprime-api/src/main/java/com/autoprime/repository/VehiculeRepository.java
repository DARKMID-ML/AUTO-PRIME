package com.autoprime.repository;

import com.autoprime.entity.Vehicule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/** Accès aux données de la table "vehicules".
 * Spring Data génère automatiquement les méthodes CRUD (findById, save, delete...).
 * Les méthodes déclarées ci-dessous servent aux filtres des pages Vente/Location.
 */
public interface VehiculeRepository extends JpaRepository<Vehicule, Long> {

    /** Filtre par service : "Vente" ou "Location". */
    List<Vehicule> findByService(String service);

    /** Ex: findByServiceIgnoreCase("vente") — insensible à la casse. */
    List<Vehicule> findByServiceIgnoreCase(String service);

    /** Filtres combinés utilisés par la page Vente (?type=sale&brand=...&year=...&fuel=...). */
    List<Vehicule> findByMarqueIgnoreCaseAndAnnee(String marque, Integer annee);

    List<Vehicule> findByCarburantIgnoreCase(String carburant);

    List<Vehicule> findByLocalisationIgnoreCase(String localisation);

    /** Cherche marque OU modèle (barre de recherche). */
    List<Vehicule> findByMarqueContainingIgnoreCaseOrModelContainingIgnoreCase(String marque, String model);
}
