package com.autoprime.config;

import com.autoprime.service.AuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

/**
 * Filtre d'authentification des routes /api/.
 *
 * Ce filtre ne prend PAS de décision de sécurité (c'est le rôle de SecurityConfig).
 * Il valide seulement le jeton Bearer s'il est présent, et détermine si la route
 * est publique selon la règle du cahier des charges.
 *
 * Règles publiques (pas de token requis) :
 *   - GET  /api/vehicules/** , /api/services/** , /api/avis/**
 *   - GET  /api/site/parametres
 *   - POST /api/contact
 *   - POST /api/devis-transit
 *   - POST /api/auth/login
 *
 * Tout le reste exige un jeton Bearer valide.
 *
 * Si un jeton est fourni mais invalide (expiré, compte modifié, API redémarrée),
 * le filtre répond 401 immédiatement.
 *
 * Si aucun jeton n'est fourni sur une route privée, on laisse Spring Security
 * gérer la réponse 401 via l'authenticationEntryPoint.
 */
@Component
public class AuthFilter extends OncePerRequestFilter {

    private final AuthService authService;

    public AuthFilter(AuthService authService) {
        this.authService = authService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chaine)
            throws ServletException, IOException {

        String chemin = request.getRequestURI();
        String methode = request.getMethod();

        // Hors API et pré-vol CORS : laisser passer sans validation.
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

        // Jeton fourni : on le valide.
        if (token != null) {
            Optional<AuthService.Session> session = authService.valider(token);
            if (session.isEmpty()) {
                // Jeton invalide → 401 immédiat
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json;charset=UTF-8");
                response.setCharacterEncoding("UTF-8");
                response.getWriter().write("{\"erreur\":\"Session invalide ou expirée.\"}");
                return;
            }

            // Jeton valide : peupler les attributs pour les contrôleurs.
            AuthService.Session s = session.get();
            request.setAttribute("auth.token", s.token());
            request.setAttribute("auth.identifiant", s.identifiant());
            request.setAttribute("auth.nom", s.nom());
            request.setAttribute("auth.role", s.role());

            chaine.doFilter(request, response);
            return;
        }

        // Pas de jeton : si route publique, laisser passer sans validation.
        // Si route privée, répondre 401 immédiatement (l'AuthFilter gère l'autorisation).
        if (!publique) {
            // Route privée sans jeton → 401
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"erreur\":\"Authentification requise.\"}");
            return;
        }

        // Route publique sans jeton : laisser passer
        chaine.doFilter(request, response);
    }

    /** Détermine si une route / méthode est accessible sans authentification. */
    private boolean estPublique(String chemin, String methode) {
        // Routes GET en lecture
        boolean lecture = "GET".equalsIgnoreCase(methode);
        if (lecture) {
            if (chemin.equals("/api/vehicules") || chemin.startsWith("/api/vehicules/")) return true;
            if (chemin.equals("/api/services") || chemin.startsWith("/api/services/")) return true;
            if (chemin.equals("/api/avis") || chemin.startsWith("/api/avis/")) return true;
            if (chemin.equals("/api/site/parametres")) return true;
            return false;
        }

        // Routes POST en écriture publique
        boolean ecriture = "POST".equalsIgnoreCase(methode);
        if (ecriture) {
            if (chemin.equals("/api/contact") || chemin.equals("/api/contact/")) return true;
            if (chemin.equals("/api/devis-transit") || chemin.equals("/api/devis-transit/")) return true;
            if (chemin.equals("/api/auth/login") || chemin.equals("/api/auth/login/")) return true;
            return false;
        }

        // Toutes les autres méthodes/routes privées
        return false;
    }
}