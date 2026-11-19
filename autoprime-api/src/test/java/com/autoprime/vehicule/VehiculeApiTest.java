package com.autoprime.vehicule;

import com.autoprime.ApiTestSupport;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * API /api/vehicules : catalogue public, écriture réservée aux comptes
 * connectés, validation des corps et filtre par service.
 */
class VehiculeApiTest extends ApiTestSupport {

    private static Map<String, Object> vehicule(String marque, String model, int annee, String service) {
        Map<String, Object> corps = new LinkedHashMap<>();
        corps.put("marque", marque);
        corps.put("model", model);
        corps.put("annee", annee);
        corps.put("service", service);
        corps.put("prix", "10 000 €");
        return corps;
    }

    private long creer(String token, Map<String, Object> corps) throws Exception {
        String reponse = mockMvc.perform(post("/api/vehicules")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corps(corps)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return json.readTree(reponse).get("id").asLong();
    }

    @Test
    @DisplayName("le catalogue est public et vide au départ")
    void cataloguePublicEtVide() throws Exception {
        mockMvc.perform(get("/api/vehicules"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("une création sans session renvoie 401")
    void creationSansSession() throws Exception {
        mockMvc.perform(post("/api/vehicules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corps(vehicule("Toyota", "Hilux", 2024, "Vente"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("création puis lecture de la fiche")
    void creationPuisLecture() throws Exception {
        long id = creer(tokenDev(), vehicule("Toyota", "Hilux", 2024, "Vente"));

        mockMvc.perform(get("/api/vehicules/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.marque").value("Toyota"))
                .andExpect(jsonPath("$.model").value("Hilux"))
                .andExpect(jsonPath("$.annee").value(2024));
    }

    @Test
    @DisplayName("un corps invalide est refusé en 400 avec un message clair")
    void corpsInvalide() throws Exception {
        mockMvc.perform(post("/api/vehicules")
                        .header("Authorization", bearer(tokenDev()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"model\":\"Sans marque\",\"annee\":2024}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erreur").value("La marque est obligatoire"));
    }

    @Test
    @DisplayName("le filtre ?service= ignore la casse")
    void filtreParService() throws Exception {
        String token = tokenDev();
        creer(token, vehicule("Toyota", "Hilux", 2024, "Vente"));
        creer(token, vehicule("Hyundai", "Tucson", 2023, "Location"));

        mockMvc.perform(get("/api/vehicules").param("service", "location"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].model").value("Tucson"));
    }

    @Test
    @DisplayName("la mise à jour remplace les champs")
    void miseAJour() throws Exception {
        String token = tokenDev();
        long id = creer(token, vehicule("BMW", "X5", 2021, "Vente"));

        Map<String, Object> maj = vehicule("BMW", "X5 xDrive", 2022, "Vente");
        maj.put("prix", "55 000 €");

        mockMvc.perform(put("/api/vehicules/{id}", id)
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corps(maj)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.model").value("X5 xDrive"))
                .andExpect(jsonPath("$.annee").value(2022))
                .andExpect(jsonPath("$.prix").value("55 000 €"));
    }

    @Test
    @DisplayName("identifiant inconnu : 404 en lecture, mise à jour et suppression")
    void identifiantInconnu() throws Exception {
        String token = tokenDev();

        mockMvc.perform(get("/api/vehicules/{id}", 9999))
                .andExpect(status().isNotFound());

        mockMvc.perform(put("/api/vehicules/{id}", 9999)
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corps(vehicule("Audi", "A4", 2020, "Vente"))))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/vehicules/{id}", 9999)
                        .header("Authorization", bearer(token)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("la suppression renvoie 204 puis la fiche disparaît")
    void suppression() throws Exception {
        String token = tokenDev();
        long id = creer(token, vehicule("Ford", "Ranger", 2024, "Vente"));

        mockMvc.perform(delete("/api/vehicules/{id}", id)
                        .header("Authorization", bearer(token)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/vehicules/{id}", id))
                .andExpect(status().isNotFound());
    }
}
