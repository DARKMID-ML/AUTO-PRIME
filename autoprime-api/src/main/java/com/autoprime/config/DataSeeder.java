package com.autoprime.config;

import com.autoprime.repository.AvisRepository;
import com.autoprime.repository.ContactRepository;
import com.autoprime.repository.DevisTransitRepository;
import com.autoprime.repository.ServiceRepository;
import com.autoprime.repository.VehiculeRepository;
import com.autoprime.service.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Jeu de données de démonstration.
 * Remplit les tables UNIQUEMENT si elles sont vides — relancer l'app
 * n'écrase donc jamais les vraies données.
 *
 * Désactivé sous le profil `test` : les tests créent leurs propres données.
 */
@Component
@Profile("!test")
public class DataSeeder implements CommandLineRunner {

    private final VehiculeRepository vehiculeRepository;
    private final ServiceRepository serviceRepository;
    private final AvisRepository avisRepository;
    private final AuthService authService;

    @Value("${app.site.nom:AutoPrime}")
    private String nomSite;

    @Value("${app.admin.identifiant:gerant}")
    private String adminIdentifiant;

    @Value("${app.admin.mot-de-passe:ChangezMoi2026}")
    private String adminMotDePasse;

    public DataSeeder(VehiculeRepository vehiculeRepository,
                      ServiceRepository serviceRepository,
                      AvisRepository avisRepository,
                      AuthService authService) {
        this.vehiculeRepository = vehiculeRepository;
        this.serviceRepository = serviceRepository;
        this.avisRepository = avisRepository;
        this.authService = authService;
    }

    @Override
    public void run(String... args) {
        seedCompteAdmin();
        seedVehicules();
        seedServices();
        seedAvis();
    }

    // ------------------------------------------------------------------ //
    // Compte admin : une seule fois, au premier démarrage.                 //
    // ------------------------------------------------------------------ //
    private void seedCompteAdmin() {
        authService.initialiserCompteAdmin(nomSite, adminIdentifiant, adminMotDePasse);
    }

    // ------------------------------------------------------------------ //
    // Véhicules : le même contenu que autoprime-web/src/data/vehicle.ts       //
    // ------------------------------------------------------------------ //
    private void seedVehicules() {
        if (vehiculeRepository.count() > 0) {
            return;
        }

        saveVehicule("Tesla", "Model S", 2020, "Berline", "45 000 €",
                "/images/vehicules/tesla-model-s.jpg",
                "Voiture électrique haut de gamme", "Disponible", "Vente",
                "15 000 km", "15 kWh/100 km", "Automatique", "5 places", "Oui",
                "Autonomie 600 km, Accélération 0-100 km/h en 2,5s, Conduite autonome, Écran tactile 17 pouces",
                "Noir", "Cuir noir", "Électrique", "Électrique", "Bamako");

        saveVehicule("Toyota", "Land Cruiser V8", 2023, "SUV", "65 000 €",
                "/images/vehicules/toyota-land-cruiser.jpg",
                "4x4 robuste et fiable pour tous les terrains", "Nouveau", "Vente",
                "0 km", "12 L/100 km", "Automatique", "7 places", "Oui",
                "4x4 permanent, Blocage de différentiel, Caméra 360°, Toit ouvrant",
                "Blanc perle", "Cuir beige", "4x4", "Diesel", "Bamako");

        saveVehicule("Mercedes-Benz", "Classe E", 2022, "Berline", "38 000 €",
                "/images/vehicules/mercedes-classe-e.jpg",
                "Berline de luxe pour professionnels", "Disponible", "Vente",
                "25 000 km", "7 L/100 km", "Automatique", "5 places", "Oui",
                "Sièges cuir chauffants, GPS, Toit panoramique, Système audio Burmester",
                "Gris argent", "Cuir noir", "Luxe", "Essence", "Bamako");

        saveVehicule("Ford", "Ranger Wildtrak", 2024, "Pick-up", "42 000 €",
                "/images/vehicules/ford-ranger.jpg",
                "Pick-up puissant pour le travail et l'aventure", "Nouveau", "Vente",
                "0 km", "9 L/100 km", "Automatique", "5 places", "Oui",
                "Moteur diesel 2.0L, Benne utilitaire, Apple CarPlay, Android Auto",
                "Gris foncé", "Cuir noir", "Utilitaire", "Diesel", "Bamako");

        saveVehicule("BMW", "X5 xDrive", 2021, "SUV", "55 000 €",
                "/images/vehicules/bmw-x5.jpg",
                "SUV premium aux performances exceptionnelles", "Réservé", "Vente",
                "30 000 km", "8 L/100 km", "Automatique", "7 places", "Oui",
                "4x4, Toit panoramique, Caméra 360°, Sièges massants",
                "Bleu métallisé", "Cuir marron", "Luxe", "Essence", "Kayes");

        saveVehicule("Hyundai", "Tucson Executive", 2023, "SUV", "150 €/jour",
                "/images/vehicules/hyundai-tucson.jpg",
                "SUV confortable et économique en location", "Disponible", "Location",
                "10 000 km", "6 L/100 km", "Automatique", "5 places", "Oui",
                "Écran tactile 10 pouces, Caméra de recul, Toit ouvrant",
                "Blanc", "Tissu gris", "SUV", "Diesel", "Bamako");

        saveVehicule("Toyota", "Hilux D-4D", 2024, "Pick-up", "120 €/jour",
                "/images/vehicules/toyota-hilux.jpg",
                "Pick-up indestructible pour les chantiers", "Disponible", "Location",
                "5 000 km", "8 L/100 km", "Manuelle", "5 places", "Oui",
                "Double cabine, Benne, 4x4, Attelage remorque",
                "Blanc", "Tissu noir", "Utilitaire", "Diesel", "Kayes");

        saveVehicule("Mercedes-Benz", "Classe S", 2022, "Berline", "250 €/jour",
                "/images/vehicules/mercedes-classe-s.jpg",
                "Berline de luxe pour vos déplacements professionnels", "Disponible", "Location",
                "20 000 km", "9 L/100 km", "Automatique", "5 places", "Oui",
                "Sièges cuir massants, Écrans arrière, Toit panoramique, Mini-bar",
                "Noir", "Cuir beige", "Luxe", "Essence", "Bamako");
    }

    private void saveVehicule(String marque, String model, Integer annee, String type,
                              String prix, String image, String description, String statut,
                              String service, String km, String consomation, String transmission,
                              String places, String climatisation, String atouts, String peinture,
                              String interieur, String category, String carburant, String localisation) {
        com.autoprime.entity.Vehicule v = new com.autoprime.entity.Vehicule();
        v.setMarque(marque);
        v.setModel(model);
        v.setAnnee(annee);
        v.setType(type);
        v.setPrix(prix);
        v.setImage(image);
        v.setDescription(description);
        v.setStatut(statut);
        v.setService(service);
        v.setKm(km);
        v.setConsomation(consomation);
        v.setTransmission(transmission);
        v.setPlaces(places);
        v.setClimatisation(climatisation);
        v.setAtouts(atouts);
        v.setPeinture(peinture);
        v.setInterieur(interieur);
        v.setCategory(category);
        v.setCarburant(carburant);
        v.setLocalisation(localisation);
        vehiculeRepository.save(v);
    }

    // ------------------------------------------------------------------ //
    // Domaines d'expertise : autoprime-web/src/data/services.ts                //
    // ------------------------------------------------------------------ //
    private void seedServices() {
        if (serviceRepository.count() > 0) {
            return;
        }

        saveService("Vente de Véhicules",
                "Large gamme de véhicules neufs et d'occasion, soigneusement sélectionnés et inspectés pour vous garantir qualité et fiabilité.",
                "directions_car", "bg-brand-red", "/vente", true, 1);

        saveService("Location de Véhicules",
                "Des solutions de location flexibles pour tous vos besoins, que ce soit pour un jour, une semaine ou plus longtemps.",
                "car_rental", "bg-brand-blue", "/location", true, 2);

        saveService("Transit Automobile",
                "Service de transit et d'importation de véhicules, avec une gestion complète des formalités douanières.",
                "local_shipping", "bg-brand-dark", "/transit", true, 3);

        saveService("Expertise & Conseil",
                "Plus de 15 ans d'expérience du marché automobile à votre service pour un achat serein.",
                "verified", "bg-brand-blue", "", false, 4);
    }

    private void saveService(String titre, String description, String icone,
                             String couleur, String lien, Boolean hasLink, Integer ordre) {
        com.autoprime.entity.Service s = new com.autoprime.entity.Service();
        s.setTitre(titre);
        s.setDescription(description);
        s.setIcone(icone);
        s.setCouleur(couleur);
        s.setLien(lien);
        s.setHasLink(hasLink);
        s.setOrdre(ordre);
        serviceRepository.save(s);
    }

    // ------------------------------------------------------------------ //
    // Témoignages : autoprime-web/src/data/testimonials.ts                    //
    // ------------------------------------------------------------------ //
    private void seedAvis() {
        if (avisRepository.count() > 0) {
            return;
        }

        saveAvis("Amadou Diallo", "amadou.diallo@email.com",
                "AutoPrime a rendu l'achat de ma voiture très facile. Équipe professionnelle et service impeccable !", "AD");
        saveAvis("Fatima Traoré", "fatima.traore@email.com",
                "J'ai loué un véhicule pour mes vacances et tout était parfait. Je recommande vivement !", "FT");
        saveAvis("Ibrahim Koné", "ibrahim.kone@email.com",
                "Le service transit est exceptionnel. Mon véhicule est arrivé d'Europe en parfait état.", "IK");
    }

    private void saveAvis(String nom, String email, String message, String initiales) {
        com.autoprime.entity.Avis a = new com.autoprime.entity.Avis();
        a.setNom(nom);
        a.setEmail(email);
        a.setMessage(message);
        a.setInitiales(initiales);
        avisRepository.save(a);
    }
}
