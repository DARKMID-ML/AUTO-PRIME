package com.autoprime.contact;

import com.autoprime.ApiTestSupport;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * API /api/contact : dépôt public d'un message, lecture et traitement
 * réservés aux comptes connectés.
 */
class ContactApiTest extends ApiTestSupport {

    private long envoyer(String message) throws Exception {
        String reponse = mockMvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corps(Map.of(
                                "nom", "Awa Traoré",
                                "email", "awa@example.com",
                                "telephone", "+223 70 00 00 00",
                                "sujet", "Achat de véhicule",
                                "message", message))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return json.readTree(reponse).get("id").asLong();
    }

    @Test
    @DisplayName("le formulaire public crée un message au statut « new »")
    void formulairePublic() throws Exception {
        mockMvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corps(Map.of(
                                "nom", "Awa Traoré",
                                "email", "awa@example.com",
                                "message", "Bonjour, je cherche un 4x4."))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.statut").value("new"))
                .andExpect(jsonPath("$.nom").value("Awa Traoré"))
                .andExpect(jsonPath("$.createdAt").isNotEmpty());
    }

    @Test
    @DisplayName("la boîte de réception exige une session")
    void lectureReservee() throws Exception {
        mockMvc.perform(get("/api/contact"))
                .andExpect(status().isUnauthorized());

        envoyer("Premier message");

        mockMvc.perform(get("/api/contact").header("Authorization", bearer(tokenDev())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].message").value("Premier message"));
    }

    @Test
    @DisplayName("le statut d'un message peut passer à « read »")
    void changementDeStatut() throws Exception {
        String token = tokenDev();
        long id = envoyer("Message à traiter");

        mockMvc.perform(patch("/api/contact/{id}/statut", id)
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"statut\":\"read\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("read"));
    }

    @Test
    @DisplayName("statut ou identifiant inconnu : 404")
    void identifiantInconnu() throws Exception {
        String token = tokenDev();

        mockMvc.perform(patch("/api/contact/{id}/statut", 9999)
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"statut\":\"read\"}"))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/contact/{id}", 9999)
                        .header("Authorization", bearer(token)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("la suppression retire le message de la boîte")
    void suppression() throws Exception {
        String token = tokenDev();
        long id = envoyer("Message à supprimer");

        mockMvc.perform(delete("/api/contact/{id}", id)
                        .header("Authorization", bearer(token)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/contact/{id}", id)
                        .header("Authorization", bearer(token)))
                .andExpect(status().isNotFound());
    }
}
