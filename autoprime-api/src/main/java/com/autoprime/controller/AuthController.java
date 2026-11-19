package com.autoprime.controller;

import com.autoprime.config.AccesRole;
import com.autoprime.dto.CompteCreeDTO;
import com.autoprime.dto.CompteDTO;
import com.autoprime.dto.LoginRequest;
import com.autoprime.dto.SessionDTO;
import com.autoprime.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Authentification et comptes du site.
 *
 * POST   /api/auth/login                     → ouvre une session
 * POST   /api/auth/logout                    → ferme la session courante
 * GET    /api/auth/moi                       → session courante
 * POST   /api/auth/mot-de-passe              → change SON mot de passe
 *
 * Gestion des comptes (compte technique `dev` uniquement) :
 * GET    /api/auth/comptes                   → liste admin + vendeurs
 * POST   /api/auth/comptes                   → crée un compte (mot de passe généré)
 * DELETE /api/auth/comptes/{id}              → supprime un compte
 * POST   /api/auth/comptes/{id}/mot-de-passe → réinitialise le mot de passe
 * PATCH  /api/auth/comptes/{id}/actif        → active / désactive
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // ------------------------------------------------------------------ //
    // Session.                                                            //
    // ------------------------------------------------------------------ //

    @PostMapping("/login")
    public ResponseEntity<SessionDTO> login(@RequestBody @Valid LoginRequest request) {
        Optional<AuthService.Session> session =
                authService.connecter(request.getIdentifiant(), request.getMotDePasse());

        if (session.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new SessionDTO("err", "err", "err", "err"));
        }

        AuthService.Session s = session.get();
        return ResponseEntity.ok(new SessionDTO(s.token(), s.identifiant(), s.nom(), s.role()));
    }

    @PostMapping("/logout")
    public Map<String, String> logout(HttpServletRequest request) {
        authService.deconnecter((String) request.getAttribute("auth.token"));
        return Map.of("message", "Deconnecte.");
    }

    @GetMapping("/moi")
    public SessionDTO moi(HttpServletRequest request) {
        return new SessionDTO(
                (String) request.getAttribute("auth.token"),
                (String) request.getAttribute("auth.identifiant"),
                (String) request.getAttribute("auth.nom"),
                (String) request.getAttribute("auth.role"));
    }

    /**
     * Changement du mot de passe du compte connecté (admin ou vendeur).
     * Le compte technique `dev` change son mot de passe dans la configuration
     * de l'API, pas ici.
     */
    @PostMapping("/mot-de-passe")
    public ResponseEntity<Map<String, String>> changerMonMotDePasse(
            @RequestBody ChangerMotDePasseRequest corps,
            HttpServletRequest request) {

        Map<String, String> resp = new HashMap<>();

        String role = AccesRole.role(request);
        if (!"admin".equals(role) && !"vendeur".equals(role)) {
            resp.put("erreur", "Reserve aux comptes administrateur et vendeur");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(resp);
        }

        String nouveau = corps.getNouveauMotDePasse();
        if (nouveau == null || nouveau.length() < 6) {
            resp.put("erreur", "Le nouveau mot de passe doit contenir au moins 6 caracteres");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resp);
        }

        String identifiant = (String) request.getAttribute("auth.identifiant");
        if (!authService.changerMotDePasse(identifiant, corps.getAncienMotDePasse(), nouveau)) {
            resp.put("erreur", "Mot de passe actuel incorrect");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(resp);
        }

        resp.put("message", "Mot de passe modifie. Reconnexion requise.");
        return ResponseEntity.ok(resp);
    }

    // ------------------------------------------------------------------ //
    // Comptes (dev uniquement).                                           //
    // ------------------------------------------------------------------ //

    @GetMapping("/comptes")
    public ResponseEntity<List<CompteDTO>> listerComptes(HttpServletRequest request) {
        if (!AccesRole.estDev(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(authService.listerComptes());
    }

    @PostMapping("/comptes")
    public ResponseEntity<?> creerCompte(@RequestBody CreerCompteRequest corps,
                                         HttpServletRequest request) {
        if (!AccesRole.estDev(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("erreur", "Reserve au compte technique dev."));
        }
        try {
            CompteCreeDTO cree = authService.creerCompte(
                    corps.getNom(), corps.getIdentifiant(), corps.getRole());
            return ResponseEntity.ok(cree);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage()));
        }
    }

    @DeleteMapping("/comptes/{id}")
    public ResponseEntity<?> supprimerCompte(@PathVariable Long id, HttpServletRequest request) {
        if (!AccesRole.estDev(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("erreur", "Reserve au compte technique dev."));
        }
        try {
            return authService.supprimerCompte(id)
                    ? ResponseEntity.noContent().build()
                    : ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("erreur", e.getMessage()));
        }
    }

    /** Réinitialise le mot de passe et renvoie le nouveau, affiché une seule fois. */
    @PostMapping("/comptes/{id}/mot-de-passe")
    public ResponseEntity<?> reinitialiserMotDePasse(@PathVariable Long id,
                                                     HttpServletRequest request) {
        if (!AccesRole.estDev(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("erreur", "Reserve au compte technique dev."));
        }
        String motDePasse = authService.reinitialiserMotDePasse(id);
        if (motDePasse == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("motDePasse", motDePasse));
    }

    @PatchMapping("/comptes/{id}/actif")
    public ResponseEntity<?> changerActif(@PathVariable Long id,
                                          @RequestBody ActifRequest corps,
                                          HttpServletRequest request) {
        if (!AccesRole.estDev(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("erreur", "Reserve au compte technique dev."));
        }
        if (corps.getActif() == null) {
            return ResponseEntity.badRequest().body(Map.of("erreur", "Champ « actif » manquant."));
        }
        try {
            if (!authService.changerActif(id, corps.getActif())) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(Map.of("actif", corps.getActif()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("erreur", e.getMessage()));
        }
    }

    // ------------------------------------------------------------------ //
    // Corps de requêtes.                                                  //
    // ------------------------------------------------------------------ //

    public static class ChangerMotDePasseRequest {
        private String ancienMotDePasse;
        private String nouveauMotDePasse;

        public String getAncienMotDePasse() { return ancienMotDePasse; }
        public void setAncienMotDePasse(String ancienMotDePasse) { this.ancienMotDePasse = ancienMotDePasse; }

        public String getNouveauMotDePasse() { return nouveauMotDePasse; }
        public void setNouveauMotDePasse(String nouveauMotDePasse) { this.nouveauMotDePasse = nouveauMotDePasse; }
    }

    public static class CreerCompteRequest {
        private String nom;
        private String identifiant;
        private String role;

        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }

        public String getIdentifiant() { return identifiant; }
        public void setIdentifiant(String identifiant) { this.identifiant = identifiant; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    public static class ActifRequest {
        private Boolean actif;

        public Boolean getActif() { return actif; }
        public void setActif(Boolean actif) { this.actif = actif; }
    }
}
