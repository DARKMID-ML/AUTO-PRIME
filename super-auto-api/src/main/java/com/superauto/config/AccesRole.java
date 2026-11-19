package com.superauto.config;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Contrôle d'accès par rôle, posé par AuthFilter dans `auth.role`.
 *
 * `dev` est le compte technique du mainteneur : il a tous les droits.
 * `admin` est le responsable du site client.
 * `vendeur` est un employé : catalogue et demandes, pas la configuration.
 */
public final class AccesRole {

    private AccesRole() {
    }

    public static String role(HttpServletRequest request) {
        Object valeur = request.getAttribute("auth.role");
        return valeur instanceof String role ? role : null;
    }

    public static boolean estDev(HttpServletRequest request) {
        return "dev".equals(role(request));
    }

    public static boolean estAdminOuDev(HttpServletRequest request) {
        String role = role(request);
        return "admin".equals(role) || "dev".equals(role);
    }
}
