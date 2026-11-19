package com.autoprime.service;

import com.autoprime.dto.CompteCreeDTO;
import com.autoprime.dto.CompteDTO;
import com.autoprime.entity.Compte;
import com.autoprime.repository.CompteRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Authentification et gestion des comptes du déploiement.
 *
 * Un déploiement sert UN client :
 *   - `admin`   : compte du responsable, créé au premier démarrage ;
 *   - `vendeur` : comptes des employés, créés par le compte technique `dev` ;
 *   - `dev`     : compte du mainteneur, défini dans la configuration.
 *
 * Les comptes admin/vendeur sont stockés en base (mot de passe haché).
 * Le compte `dev` n'est jamais en base : son mot de passe vient de la
 * configuration de l'API.
 */
@Service
public class AuthService {

    /** Session active. */
    public record Session(String token, String identifiant, String nom, String role,
                          Instant expiration) {
        public boolean expiree() {
            return Instant.now().isAfter(expiration);
        }
    }

    private static final String ROLE_ADMIN = "admin";
    private static final String ROLE_VENDEUR = "vendeur";

    /** Caractères sans ambiguïté (pas de O/0, I/l/1). */
    private static final String ALPHABET_MOT_DE_PASSE =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

    private static final int LONGUEUR_MOT_DE_PASSE = 12;

    private final Map<String, Session> sessions = new ConcurrentHashMap<>();
    private final SecureRandom aleatoire = new SecureRandom();
    private final CompteRepository compteRepository;

    private final String devIdentifiant;
    private final String devMotDePasse;
    private final long dureeHeures;

    public AuthService(
            @Value("${app.auth.dev.identifiant}") String devIdentifiant,
            @Value("${app.auth.dev.mot-de-passe}") String devMotDePasse,
            @Value("${app.auth.duree-session-heures:12}") long dureeHeures,
            CompteRepository compteRepository) {
        this.devIdentifiant = devIdentifiant;
        this.devMotDePasse = devMotDePasse;
        this.dureeHeures = dureeHeures;
        this.compteRepository = compteRepository;
    }

    /**
     * Connexion : compte technique `dev` d'abord, puis compte en base
     * (admin ou vendeur).
     */
    public Optional<Session> connecter(String identifiant, String motDePasse) {
        if (identifiant == null || motDePasse == null) {
            return Optional.empty();
        }
        String id = identifiant.trim();
        if (id.isEmpty()) {
            return Optional.empty();
        }

        if (egal(id, devIdentifiant) && egalSecret(motDePasse, devMotDePasse)) {
            return Optional.of(ouvrirSession(id, "Développeur", "dev"));
        }

        return compteRepository.findByIdentifiant(id)
                .filter(compte -> Boolean.TRUE.equals(compte.getActif()))
                .filter(compte -> compte.getMotDePasseHash() != null)
                .filter(compte -> egalSecret(hacherMotDePasse(motDePasse), compte.getMotDePasseHash()))
                .map(compte -> ouvrirSession(compte.getIdentifiant(), nomAffiche(compte), compte.getRole()));
    }

    /**
     * Crée le compte admin au premier démarrage. Une fois la ligne créée,
     * l'empreinte en base fait foi : les valeurs de configuration ne sont
     * plus utilisées (le mot de passe se change depuis l'administration).
     */
    @Transactional
    public void initialiserCompteAdmin(String nom, String identifiant, String motDePasse) {
        if (compteRepository.existsByRole(ROLE_ADMIN)) {
            return;
        }
        if (identifiant == null || identifiant.isBlank() || motDePasse == null || motDePasse.isBlank()) {
            return;
        }
        Compte compte = new Compte();
        compte.setIdentifiant(identifiant.trim());
        compte.setMotDePasseHash(hacherMotDePasse(motDePasse));
        compte.setNom(nom == null || nom.isBlank() ? identifiant.trim() : nom.trim());
        compte.setRole(ROLE_ADMIN);
        compte.setActif(Boolean.TRUE);
        compte.setDateCreation(LocalDate.now());
        compteRepository.save(compte);
    }

    /**
     * Change le mot de passe du compte connecté (admin ou vendeur).
     * L'ancien mot de passe est exigé ; toutes ses sessions sont ensuite
     * fermées (y compris celle qui a fait la demande), d'où une reconnexion.
     */
    @Transactional
    public boolean changerMotDePasse(String identifiant, String ancien, String nouveau) {
        if (nouveau == null || nouveau.length() < 6) {
            return false;
        }
        Compte compte = compteRepository.findByIdentifiant(identifiant).orElse(null);
        if (compte == null || compte.getMotDePasseHash() == null
                || !Boolean.TRUE.equals(compte.getActif())) {
            return false;
        }
        if (!egalSecret(hacherMotDePasse(ancien == null ? "" : ancien), compte.getMotDePasseHash())) {
            return false;
        }
        compte.setMotDePasseHash(hacherMotDePasse(nouveau));
        compteRepository.save(compte);
        revoquerSessions(compte.getIdentifiant());
        return true;
    }

    // ------------------------------------------------------------------ //
    // Gestion des comptes — réservée au compte technique `dev`.           //
    // ------------------------------------------------------------------ //

    /** Liste des comptes admin et vendeurs (jamais le compte `dev`). */
    @Transactional(readOnly = true)
    public List<CompteDTO> listerComptes() {
        return compteRepository.findAllByOrderByRoleAscNomAsc().stream()
                .map(CompteDTO::de)
                .toList();
    }

    /**
     * Crée un compte admin ou vendeur avec un mot de passe aléatoire.
     * Le mot de passe en clair est renvoyé une seule fois : il n'est jamais
     * stocké ni relisible ensuite.
     */
    @Transactional
    public CompteCreeDTO creerCompte(String nom, String identifiant, String role) {
        String id = identifiant == null ? "" : identifiant.trim();
        if (id.length() < 3 || id.length() > 40
                || !id.matches("[a-zA-Z0-9._-]+")) {
            throw new IllegalArgumentException(
                    "L'identifiant doit contenir 3 à 40 caractères : lettres, chiffres, point, tiret ou underscore.");
        }
        if (compteRepository.existsByIdentifiant(id)) {
            throw new IllegalArgumentException("Cet identifiant est déjà utilisé.");
        }
        if (devIdentifiant != null && id.equalsIgnoreCase(devIdentifiant)) {
            throw new IllegalArgumentException("Cet identifiant est réservé au compte technique.");
        }
        String roleNormalise = normaliserRole(role);
        String motDePasse = motDePasseAleatoire();

        Compte compte = new Compte();
        compte.setIdentifiant(id);
        compte.setNom(nom == null || nom.isBlank() ? id : nom.trim());
        compte.setMotDePasseHash(hacherMotDePasse(motDePasse));
        compte.setRole(roleNormalise);
        compte.setActif(Boolean.TRUE);
        compte.setDateCreation(LocalDate.now());
        compte = compteRepository.save(compte);

        return new CompteCreeDTO(CompteDTO.de(compte), motDePasse);
    }

    /**
     * Réinitialise le mot de passe d'un compte et renvoie le nouveau mot de
     * passe en clair (une seule fois). Toutes ses sessions sont fermées.
     */
    @Transactional
    public String reinitialiserMotDePasse(Long id) {
        Compte compte = compteRepository.findById(id).orElse(null);
        if (compte == null) {
            return null;
        }
        String motDePasse = motDePasseAleatoire();
        compte.setMotDePasseHash(hacherMotDePasse(motDePasse));
        compteRepository.save(compte);
        revoquerSessions(compte.getIdentifiant());
        return motDePasse;
    }

    /**
     * Active ou désactive un compte. Le dernier administrateur actif ne peut
     * pas être désactivé, sinon le site n'aurait plus de responsable.
     */
    @Transactional
    public boolean changerActif(Long id, boolean actif) {
        Compte compte = compteRepository.findById(id).orElse(null);
        if (compte == null) {
            return false;
        }
        if (!actif && estDernierAdminActif(compte)) {
            throw new IllegalStateException("Impossible de désactiver le dernier administrateur.");
        }
        compte.setActif(actif);
        compteRepository.save(compte);
        if (!actif) {
            revoquerSessions(compte.getIdentifiant());
        }
        return true;
    }

    /**
     * Supprime un compte. Le dernier administrateur ne peut pas être supprimé.
     */
    @Transactional
    public boolean supprimerCompte(Long id) {
        Compte compte = compteRepository.findById(id).orElse(null);
        if (compte == null) {
            return false;
        }
        if (ROLE_ADMIN.equals(compte.getRole()) && compteRepository.countByRole(ROLE_ADMIN) <= 1) {
            throw new IllegalStateException("Impossible de supprimer le dernier administrateur.");
        }
        compteRepository.delete(compte);
        revoquerSessions(compte.getIdentifiant());
        return true;
    }

    // ------------------------------------------------------------------ //
    // Sessions.                                                           //
    // ------------------------------------------------------------------ //

    /** Valide un jeton et renvoie la session associée. */
    public Optional<Session> valider(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        Session session = sessions.get(token);
        if (session == null) {
            return Optional.empty();
        }
        if (session.expiree()) {
            sessions.remove(token);
            return Optional.empty();
        }
        return Optional.of(session);
    }

    public void deconnecter(String token) {
        if (token != null) {
            sessions.remove(token);
        }
    }

    // ------------------------------------------------------------------ //
    // Helpers privés.                                                     //
    // ------------------------------------------------------------------ //

    private boolean estDernierAdminActif(Compte compte) {
        return ROLE_ADMIN.equals(compte.getRole())
                && Boolean.TRUE.equals(compte.getActif())
                && compteRepository.countByRoleAndActifTrue(ROLE_ADMIN) <= 1;
    }

    private String normaliserRole(String role) {
        if (ROLE_ADMIN.equals(role) || ROLE_VENDEUR.equals(role)) {
            return role;
        }
        throw new IllegalArgumentException("Rôle invalide : choisir « admin » ou « vendeur ».");
    }

    private Session ouvrirSession(String identifiant, String nom, String role) {
        byte[] octets = new byte[32];
        aleatoire.nextBytes(octets);
        String token = HexFormat.of().formatHex(octets);
        Session session = new Session(token, identifiant, nom, role,
                Instant.now().plus(dureeHeures, ChronoUnit.HOURS));
        sessions.put(token, session);
        return session;
    }

    /** Ferme les sessions d'un identifiant donné. */
    private void revoquerSessions(String identifiant) {
        if (identifiant == null) {
            return;
        }
        sessions.values().removeIf(session -> identifiant.equals(session.identifiant()));
    }

    private String nomAffiche(Compte compte) {
        return compte.getNom() == null || compte.getNom().isBlank()
                ? compte.getIdentifiant()
                : compte.getNom();
    }

    /** Mot de passe aléatoire lisible (12 caractères sans ambiguïté). */
    private String motDePasseAleatoire() {
        StringBuilder resultat = new StringBuilder(LONGUEUR_MOT_DE_PASSE);
        for (int i = 0; i < LONGUEUR_MOT_DE_PASSE; i++) {
            resultat.append(ALPHABET_MOT_DE_PASSE.charAt(aleatoire.nextInt(ALPHABET_MOT_DE_PASSE.length())));
        }
        return resultat.toString();
    }

    /** Empreinte SHA-256 du mot de passe. */
    private String hacherMotDePasse(String motDePasse) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(motDePasse.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Impossible de hacher le mot de passe", e);
        }
    }

    private static boolean egal(String a, String b) {
        return a != null && b != null && a.equals(b);
    }

    /** Comparaison à temps constant pour éviter les attaques par mesure de durée. */
    private static boolean egalSecret(String fourni, String attendu) {
        if (fourni == null || attendu == null) {
            return false;
        }
        return MessageDigest.isEqual(
                fourni.getBytes(StandardCharsets.UTF_8),
                attendu.getBytes(StandardCharsets.UTF_8));
    }
}
