package com.autoprime.auth;

import com.autoprime.ApiTestSupport;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * API /api/auth : ouverture et fermeture de session, compte technique `dev`,
 * création de comptes et changement de mot de passe.
 */
class AuthApiTest extends ApiTestSupport {

    /** Compte créé par le compte technique, avec son mot de passe généré. */
    private record CompteTest(Long id, String identifiant, String motDePasse, String token) {
    }

    private CompteTest creerVendeur(String identifiant) throws Exception {
        String reponse = mockMvc.perform(post("/api/auth/comptes")
                        .header("Authorization", bearer(tokenDev()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corps(Map.of(
                                "nom", "Vendeur " + identifiant,
                                "identifiant", identifiant,
                                "role", "vendeur"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.compte.role").value("vendeur"))
                .andExpect(jsonPath("$.compte.identifiant").value(identifiant))
                .andReturn().getResponse().getContentAsString();

        String motDePasse = json.readTree(reponse).get("motDePasse").asText();
        Long id = json.readTree(reponse).at("/compte/id").asLong();
        String token = json.readTree(connexion(identifiant, motDePasse)).get("token").asText();
        return new CompteTest(id, identifiant, motDePasse, token);
    }

    @Test
    @DisplayName("le compte technique `dev` ouvre une session et reçoit un jeton")
    void connexionDev() throws Exception {
        String reponse = connexion(IDENTIFIANT_DEV, MOT_DE_PASSE_DEV);

        assertEquals(64, json.readTree(reponse).get("token").asText().length());
        mockMvc.perform(get("/api/auth/moi").header("Authorization", bearer(json.readTree(reponse).get("token").asText())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.identifiant").value(IDENTIFIANT_DEV))
                .andExpect(jsonPath("$.role").value("dev"));
    }

    @Test
    @DisplayName("un mauvais mot de passe est refusé")
    void mauvaisMotDePasse() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corps(Map.of("identifiant", IDENTIFIANT_DEV, "motDePasse", "mauvais"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("la session courante exige un jeton")
    void moiSansJeton() throws Exception {
        mockMvc.perform(get("/api/auth/moi"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("la déconnexion invalide le jeton")
    void deconnexion() throws Exception {
        String token = tokenDev();

        mockMvc.perform(post("/api/auth/logout").header("Authorization", bearer(token)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/auth/moi").header("Authorization", bearer(token)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("un vendeur créé par `dev` peut se connecter mais pas gérer les comptes")
    void compteVendeur() throws Exception {
        CompteTest vendeur = creerVendeur("vendeur1");

        assertEquals(12, vendeur.motDePasse().length());

        mockMvc.perform(get("/api/auth/moi").header("Authorization", bearer(vendeur.token())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("vendeur"));

        mockMvc.perform(get("/api/auth/comptes").header("Authorization", bearer(vendeur.token())))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/auth/comptes")
                        .header("Authorization", bearer(vendeur.token()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corps(Map.of("nom", "Intrus", "identifiant", "intrus", "role", "vendeur"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("`dev` liste, réinitialise et désactive les comptes")
    void gestionDesComptes() throws Exception {
        String token = tokenDev();
        CompteTest vendeur = creerVendeur("vendeur2");

        mockMvc.perform(get("/api/auth/comptes").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        mockMvc.perform(post("/api/auth/comptes/{id}/mot-de-passe", vendeur.id())
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.motDePasse").isNotEmpty());

        // La réinitialisation ferme les sessions du compte.
        mockMvc.perform(get("/api/auth/moi").header("Authorization", bearer(vendeur.token())))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(patch("/api/auth/comptes/{id}/actif", vendeur.id())
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"actif\":false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.actif").value(false));

        mockMvc.perform(delete("/api/auth/comptes/{id}", vendeur.id())
                        .header("Authorization", bearer(token)))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("un rôle inconnu est refusé à la création")
    void roleInvalide() throws Exception {
        mockMvc.perform(post("/api/auth/comptes")
                        .header("Authorization", bearer(tokenDev()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corps(Map.of("nom", "Super", "identifiant", "super1", "role", "superadmin"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erreur").exists());
    }

    @Test
    @DisplayName("changer son mot de passe ferme les sessions et impose le nouveau")
    void changementDeMotDePasse() throws Exception {
        CompteTest vendeur = creerVendeur("vendeur3");

        mockMvc.perform(post("/api/auth/mot-de-passe")
                        .header("Authorization", bearer(vendeur.token()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corps(Map.of(
                                "ancienMotDePasse", vendeur.motDePasse(),
                                "nouveauMotDePasse", "NouveauMotDePasse2026"))))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/auth/moi").header("Authorization", bearer(vendeur.token())))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corps(Map.of(
                                "identifiant", vendeur.identifiant(),
                                "motDePasse", "NouveauMotDePasse2026"))))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("un mot de passe trop court est refusé")
    void motDePasseTropCourt() throws Exception {
        CompteTest vendeur = creerVendeur("vendeur4");

        mockMvc.perform(post("/api/auth/mot-de-passe")
                        .header("Authorization", bearer(vendeur.token()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corps(Map.of(
                                "ancienMotDePasse", vendeur.motDePasse(),
                                "nouveauMotDePasse", "court"))))
                .andExpect(status().isBadRequest());
    }
}
