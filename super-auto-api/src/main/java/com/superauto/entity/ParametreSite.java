package com.superauto.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Réglage du site, stocké côté serveur.
 *
 * Une ligne par réglage (`theme`, `logo`, `entreprise`, `services`, `entetes`,
 * `temoignages`, `engagements`, `domaines`). La valeur est le JSON produit par
 * le front, conservé tel quel : le serveur n'a pas à connaître sa structure.
 *
 * Ces réglages sont publics en lecture (le site vitrine doit les appliquer à
 * tous les visiteurs) et réservés aux comptes connectés en écriture.
 */
@Entity
@Table(name = "parametres_site")
public class ParametreSite {

    @Id
    @Column(length = 64)
    private String cle;

    @Column(length = 1000000)
    private String valeur;

    public ParametreSite() {
    }

    public ParametreSite(String cle, String valeur) {
        this.cle = cle;
        this.valeur = valeur;
    }

    public String getCle() { return cle; }
    public void setCle(String cle) { this.cle = cle; }

    public String getValeur() { return valeur; }
    public void setValeur(String valeur) { this.valeur = valeur; }
}
