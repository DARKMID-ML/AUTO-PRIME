package com.superauto.controller;

import com.superauto.config.AccesRole;
import com.superauto.entity.ParametreSite;
import com.superauto.repository.ParametreSiteRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Réglages du site de l'établissement.
 *
 * `GET` est public : le site vitrine applique les réglages à tous les
 * visiteurs. `PUT` est réservé aux comptes connectés (admin ou dev).
 */
@RestController
@RequestMapping("/api/site/parametres")
public class SiteParametresController {

    /** Clés connues : on n'accepte rien d'autre en base. */
    private static final Set<String> CLES = Set.of(
            "theme", "logo", "entreprise", "services",
            "entetes", "temoignages", "engagements", "domaines", "pages");

    /** Taille maximale d'une valeur (le logo en data URL peut être volumineux). */
    private static final int TAILLE_MAX = 1_000_000;

    private final ParametreSiteRepository repository;

    public SiteParametresController(ParametreSiteRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public Map<String, String> lire() {
        Map<String, String> resultat = new LinkedHashMap<>();
        for (ParametreSite parametre : repository.findAll()) {
            resultat.put(parametre.getCle(), parametre.getValeur());
        }
        return resultat;
    }

    @PutMapping
    public ResponseEntity<Map<String, String>> enregistrer(
            @RequestBody Map<String, String> corps,
            HttpServletRequest request) {

        if (!AccesRole.estAdminOuDev(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        for (Map.Entry<String, String> entree : corps.entrySet()) {
            String cle = entree.getKey();
            String valeur = entree.getValue();

            if (!CLES.contains(cle)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("erreur", "Réglage inconnu : " + cle));
            }
            if (valeur != null && valeur.length() > TAILLE_MAX) {
                return ResponseEntity.badRequest()
                        .body(Map.of("erreur", "Réglage trop volumineux : " + cle));
            }
        }

        for (Map.Entry<String, String> entree : corps.entrySet()) {
            String cle = entree.getKey();
            String valeur = entree.getValue();
            if (valeur == null) {
                repository.deleteById(cle);
            } else {
                ParametreSite parametre = new ParametreSite(cle, valeur);
                repository.save(parametre);
            }
        }

        return ResponseEntity.ok(lire());
    }
}
