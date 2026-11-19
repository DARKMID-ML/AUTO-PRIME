# AGENTS.md — Instructions pour assistants IA

> Ce document guide les assistants IA (opencode, Copilot, etc.) pour travailler efficacement sur le projet AutoPrime.

---

## Commandes du projet

| Commande | Rôle |
|----------|------|
| `pnpm install` | Installer les dépendances |
| `pnpm dev` | Lancer le serveur de dev (Vite) |
| `pnpm build` | Build de production (tsc + vite build) |
| `pnpm lint` | Vérifier le code avec ESLint |
| `pnpm preview` | Prévisualiser le build de production |
| `pnpm exa:search "…"` | Recherche web via Exa (`EXA_API_KEY` dans `super-auto/.env`) |

**Toutes les commandes front doivent être lancées depuis `super-auto/`.**

**Backend** (depuis `super-auto-api/`, requis JDK 17+) :

| Commande | Rôle |
|----------|------|
| `./mvnw spring-boot:run` | Lancer l'API (port 8080, SQLite `super-auto.db`) |
| `./mvnw test` | Lancer les tests |
| `./mvnw package` | Build du jar |

> Le front fonctionne aussi **sans backend** : les hooks (`useVehicules`, `useMessages`, `useDevis`, `useAdminVehicules`) replient sur les données locales / localStorage si l'API est éteinte.

---

## Fichiers à ne jamais pousser

Le `.gitignore` **racine** exclut : `.env`, `*.db` (`super-auto.db`), `.idea/`, `.vscode/`, `.freebuff/`, `node_modules/`, `dist/`, `target/`, `*.log`.

- `super-auto/.env.example` est le modèle à versionner ; `super-auto/.env` reste local (config `VITE_*` par client).
- Ne jamais forcer l'ajout de ces fichiers (`git add -f`).

---

## Conventions de code

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Composants React | PascalCase, `.tsx` | `VehicleCard.tsx` |
| Pages | PascalCase, `.tsx` | `Acceuil.tsx`, `Contact.tsx` |
| Hooks | camelCase, `use` prefix | `use-mobile.ts` |
| Types/Interfaces | PascalCase | `Vehicule`, `Avis` |
| Variables/fonctions | camelCase | `handleSubmit`, `isMenuOpen` |
| CSS classes | Tailwind utilities | `className="bg-brand-red text-white"` |
| Fichiers données | camelCase | `vehicle.ts`, `services.ts` |

---

## Stack technique

| Technologie | Version | Rôle |
|-------------|---------|------|
| React | 19.x | Framework UI |
| TypeScript | 6.x | Typage statique |
| Vite | 8.x | Build tool + dev server |
| Tailwind CSS | 4.x | CSS utility-first |
| React Router DOM | 7.x | Routing SPA |

---

## Structure du projet

```
AutoPrime/
├── .gitignore                    # Racine : fichiers à ne jamais pousser
├── AGENTS.md                     # Ce fichier
├── README.md                     # Point d'entrée documentation
├── CAHIER_DES_CHARGES_SUPER_AUTO.md
│
├── super-auto/                   # Front React
│   ├── src/
│   │   ├── components/           # Navbar, Footer, VehicleCard + variants navbars/ & footers/
│   │   ├── pages/                # Pages publiques (Acceuil, Vente, Location, Transit, Services, Contact, MesDemandes, VehiculeDetails)
│   │   ├── pages/admin/          # Espace admin (dashboard, CRUD, messages, devis, demande…)
│   │   ├── pages/home/           # 3 variantes d'accueil (HomeSignature, HomeAtelier, HomeCatalogue)
│   │   ├── config/               # ⭐ site.ts, api.ts, auth.ts, theme.ts… (config unique)
│   │   ├── data/                 # Données statiques (repli hors ligne)
│   │   ├── hooks/                # useVehicules, useMessages, useDevis, useAdminVehicules…
│   │   ├── store/                # demandes (persistance localStorage)
│   │   ├── types/  utils/        # Interfaces TypeScript + helpers
│   │   ├── App.tsx               # Routes
│   │   ├── main.tsx              # Point d'entrée
│   │   └── index.css             # Thème Tailwind (couleurs custom)
│   ├── public/                   # Assets statiques (logo, images/vehicules/)
│   ├── doc/                      # Documentation
│   └── index.html                # HTML entry point
│
└── super-auto-api/               # Backend Spring Boot 3 + SQLite
    ├── mvnw                      # Maven wrapper
    ├── pom.xml
    └── src/main/java/com/superauto/   # controllers, services, entities, dto, mapper…
```

---

## Erreurs connues à éviter

1. **Ne pas utiliser `<a href>` pour la navigation interne** — utiliser `<Link to>` de react-router-dom
2. **Ne pas oublier `return`** dans les composants React
3. **Ne pas oublier `e.preventDefault()`** dans les formulaires
4. **Ne pas créer de classes Tailwind dynamiques** (`bg-${color}`) — elles ne fonctionnent pas
5. **Ne pas oublier le responsive** — toujours tester `md:` et `lg:` breakpoints
6. **Les imports doivent utiliser `@/`** pour les alias (ex: `@/components/...`)
7. **Ne jamais supprimer des fichiers** sans vérifier qu'ils ne sont pas importés ailleurs
8. **Respecter la charte graphique** — couleurs custom dans `index.css` (brand-red, brand-blue, etc.)

---

## Fichiers de données

Les données statiques sont dans `super-auto/src/data/` — elles servent de **repli hors ligne** et de seed du backend (`DataSeeder`) :

- `vehicle.ts` — 8 véhicules (5 Vente, 3 Location), images locales `public/images/vehicules/`
- `services.ts` — Domaines d'expertise + valeurs
- `testimonials.ts` — Témoignages clients (avis)
- `location.ts` — Flotte/locations (admin)
- `inbox.ts` — Boîte de réception (admin)

La source de vérité est désormais l'API : `GET/POST/PUT/DELETE /api/vehicules`, `/api/contact`, `/api/devis-transit`, `/api/services`, `/api/avis`, `/api/auth` (voir `super-auto-api/GUIDE.md`).

---

## Cahier des charges

Le fichier `CAHIER_DES_CHARGES_SUPER_AUTO.md` (racine) contient toutes les spécifications fonctionnelles. C'est la **référence principale** pour le contenu et le comportement des pages.

---

*Dernière mise à jour : Octobre 2026*
