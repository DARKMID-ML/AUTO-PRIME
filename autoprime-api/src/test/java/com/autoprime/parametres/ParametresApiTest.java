package com.autoprime.parametres;

import com.autoprime.ApiTestSupport;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * API /api/site/parametres : lecture publique (le site vitrine applique les
 * réglages à tous les visiteurs), écriture réservée aux comptes admin/dev.
 */
class ParametresApiTest extends ApiTestSupport {

    @Test
    @DisplayName("la lecture est publique et vide au départ")
    void lecturePublique() throws Exception {
        mockMvc.perform(get("/api/site/parametres"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isMap())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("l'écriture exige une session")
    void ecritureReservee() throws Exception {
        mockMvc.perform(put("/api/site/parametres")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corps(Map.of("theme", "atelier"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("un réglage enregistré est relu tel quel")
    void enregistrementPuisRelecture() throws Exception {
        String pages = "{\"mes-demandes\":true,\"vente\":false}";

        mockMvc.perform(put("/api/site/parametres")
                        .header("Authorization", bearer(tokenDev()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corps(Map.of("theme", "atelier", "pages", pages))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.theme").value("atelier"))
                .andExpect(jsonPath("$.pages").value(pages));

        mockMvc.perform(get("/api/site/parametres"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.theme").value("atelier"))
                .andExpect(jsonPath("$.pages").value(pages));
    }

    @Test
    @DisplayName("une clé inconnue est refusée en 400")
    void cleInconnue() throws Exception {
        mockMvc.perform(put("/api/site/parametres")
                        .header("Authorization", bearer(tokenDev()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corps(Map.of("inconnu", "valeur"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erreur").value("Réglage inconnu : inconnu"));
    }

    @Test
    @DisplayName("une valeur nulle supprime le réglage")
    void suppressionParValeurNulle() throws Exception {
        String token = tokenDev();

        mockMvc.perform(put("/api/site/parametres")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corps(Map.of("theme", "atelier"))))
                .andExpect(status().isOk());

        Map<String, String> corpsSuppression = new HashMap<>();
        corpsSuppression.put("theme", null);

        mockMvc.perform(put("/api/site/parametres")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corps(corpsSuppression)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.theme").doesNotExist());

        mockMvc.perform(get("/api/site/parametres"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.theme").doesNotExist());
    }
}
