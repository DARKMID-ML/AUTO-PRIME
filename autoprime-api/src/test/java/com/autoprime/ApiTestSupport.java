package com.autoprime;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Socle des tests d'API.
 *
 * L'application entière est démarrée (contrôleurs, filtre d'authentification,
 * JPA) sur la base H2 en mémoire du profil `test`. Chaque test tourne dans une
 * transaction annulée à la fin : aucune donnée ne fuit d'un test à l'autre.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public abstract class ApiTestSupport {

    /** Compte technique défini dans `application-test.properties`. */
    protected static final String IDENTIFIANT_DEV = "dev";
    protected static final String MOT_DE_PASSE_DEV = "DevTest2026";

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper json;

    /** Ouvre une session et renvoie le corps JSON de la réponse. */
    protected String connexion(String identifiant, String motDePasse) throws Exception {
        return mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corps(Map.of("identifiant", identifiant, "motDePasse", motDePasse))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
    }

    /** Jeton d'une session du compte technique `dev`. */
    protected String tokenDev() throws Exception {
        return json.readTree(connexion(IDENTIFIANT_DEV, MOT_DE_PASSE_DEV)).get("token").asText();
    }

    protected String bearer(String token) {
        return "Bearer " + token;
    }

    /** Sérialise un corps de requête en JSON. */
    protected String corps(Object valeur) throws Exception {
        return json.writeValueAsString(valeur);
    }
}
