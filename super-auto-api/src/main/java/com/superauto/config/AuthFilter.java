package com.superauto.config;

import com.superauto.service.AuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;

/**
 * Filtre d'authentification des routes /api/**.
 *
 * Routes publiques (site vitrine) :
 *   - GET  /api/vehicules/** , /api/services/** , /api/avis/**
 *   - POST /api/contact , /api/devis-transit
 *   - POST /api/auth/login
 *
 * Tout le reste (lecture des messages/devis, créations, modifications,
 * suppressions, déconnexion, /api/auth/moi) exige un jeton Bearer valide.
 *
 * Réponse 401 en JSON français, avec les en-têtes CORS nécessaires pour
 * que le navigateur puisse lire le statut.
 */
@Component
public class AuthFilter extends OncePerRequestFilter {

    private final AuthService authService;
    private final String originesAutorisees;

    public AuthFilter(AuthService authService,
                      @Value("${cors.allowed-origins}") String originesAutorisees) {
        this.authService = authService;
        this.originesAutorisees = originesAutorisees;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chaine)
            throws ServletException, IOException {

        String chemin = request.getRequestURI();
        String methode = request.getMethod();

        // Hors API et pré-vol CORS : laisser passer.
        if (!chemin.startsWith("/api/") || "OPTIONS".equalsIgnoreCase(methode)) {
            chaine.doFilter(request, response);
            return;
        }

        boolean publique = estPublique(chemin, methode);

        String entete = request.getHeader("Authorization");
        String token = null;
        if (entete != null && entete.regionMatches(true, 0, "Bearer ", 0, 7)) {
            token = entete.substring(7).trim();
        }

        // Un jeton fourni est toujours vérifié, y compris sur une route publique.
        // Jeton invalide (déconnecté, compte modifié, API redémarrée) → 401.
        Optional<AuthService.Session> session = authService.valider(token);
        if (token != null && session.isEmpty()) {
            refuser(request, response);
            return;
        }

        if (session.isEmpty() && !publique) {
            refuser(request, response);
            return;
        }

        session.ifPresent(s -> {
            request.setAttribute("auth.token", s.token());
            request.setAttribute("auth.identifiant", s.identifiant());
            request.setAttribute("auth.nom", s.nom());
            request.setAttribute("auth.role", s.role());
        });

        chaine.doFilter(request, response);
    }

    /** Routes accessibles sans jeton. */
    private boolean estPublique(String chemin, String methode) {
        boolean lecture = "GET".equalsIgnoreCase(methode);
        boolean ecriture = "POST".equalsIgnoreCase(methode);

        if (lecture && (chemin.equals("/api/vehicules") || chemin.startsWith("/api/vehicules/")
                || chemin.equals("/api/services") || chemin.startsWith("/api/services/")
                || chemin.equals("/api/avis") || chemin.startsWith("/api/avis/")
                || chemin.equals("/api/site/parametres"))) {
            return true;
        }
        if (ecriture && (chemin.equals("/api/contact")
                || chemin.equals("/api/devis-transit")
                || chemin.equals("/api/auth/login"))) {
            return true;
        }
        return false;
    }

    /** 401 JSON, en répétant l'origine autorisée pour le CORS. */
    private void refuser(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.setCharacterEncoding("UTF-8");

        String origine = request.getHeader("Origin");
        if (origine != null && Arrays.asList(originesAutorisees.split(",")).contains(origine)) {
            response.setHeader("Access-Control-Allow-Origin", origine);
            response.setHeader("Vary", "Origin");
        }

        response.getWriter().write("{\"erreur\":\"Authentification requise.\"}");
    }
}
