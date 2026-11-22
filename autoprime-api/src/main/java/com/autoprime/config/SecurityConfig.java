package com.autoprime.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final AuthFilter authFilter;

    public SecurityConfig(AuthFilter authFilter) {
        this.authFilter = authFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, CorsConfigurationSource corsSource) throws Exception {
        http
                // CORS déjà géré par WebConfig, mais nécessaire ici pour les réponses 401/403
                .cors(cors -> cors.configurationSource(corsSource))
                // Pas de CSRF (API stateless, tokens dans l'en-tête Authorization)
                .csrf(csrf -> csrf.disable())
                // Pas de session HTTP (JWT stateless)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Gestion des exceptions : 401 pour non authentifié, 403 pour non autorisé
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(401);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"erreur\":\"Authentification requise.\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(403);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"erreur\":\"Accès refusé.\"}");
                        })
                )
                // AUCUNE règle d'autorisation ici : l'AuthFilter gère TOUTE l'autorisation
                // sur les routes /api/**. On autorise tout pour laisser passer le filtre,
                // l'AuthFilter décidera si le token est requis/valide.
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                )
                // Ajout du filtre JWT avant le filtre standard
                .addFilterBefore(authFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}