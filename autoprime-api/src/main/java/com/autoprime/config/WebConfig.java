package com.autoprime.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * CORS global : autorise le front Vite à appeler l'API pendant le développement.
 * Les origines sont lues depuis application.properties (clé "cors.allowed-origins").
 *
 * La source est un bean {@link CorsConfigurationSource} : elle est utilisée par le
 * CorsFilter de Spring Security (SecurityConfig), qui s'exécute avant l'AuthFilter.
 * C'est ce qui garantit que les réponses 401/403 écrites par les filtres (et donc
 * jamais vues par le DispatcherServlet) portent bien Access-Control-Allow-Origin
 * et restent lisibles par le navigateur.
 */
@Configuration
public class WebConfig {

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    @Primary
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setMaxAge(1800L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
