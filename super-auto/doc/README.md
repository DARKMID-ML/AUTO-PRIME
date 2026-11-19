# AutoPrime — Documentation

> Documentation complète du projet **AutoPrime** — Site web vitrine + catalogue automobile.
> Dernière mise à jour : Octobre 2026

---

## 1. Vue d'ensemble

**AutoPrime** est une entreprise automobile basée à **Bamako, Mali** avec plus de 15 ans d'expérience. Le site web doit présenter :

- Un catalogue de véhicules (vente et location)
- Des services (transit, entretien, pièces détachées)
- Un formulaire de contact et de demande de devis transit
- Un site moderne, responsive et professionnel

---

## 2. Type de site

| Caractéristique | Détail |
|-----------------|--------|
| Type | SPA (Single Page Application) |
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS 4 |
| Routing | React Router DOM 7 |
| Pages | 8 publiques (Accueil, Vente, Location, Transit, Services, Contact, MesDemandes, Véhicule `/vehicule/:id`) + espace admin `/admin/*` |
| Backend | `super-auto-api/` — Spring Boot 3 + SQLite : API REST + auth terminées (voir [GUIDE](../../super-auto-api/GUIDE.md)) |
| Responsive | Mobile, Tablette, Desktop |

---

## 3. Stack technique

### Technologies de base

| Technologie | Version | Rôle |
|-------------|---------|------|
| **React** | 19.x | Framework UI |
| **TypeScript** | 6.x | Typage statique |
| **Vite** | 8.x | Build tool + dev server |
| **Tailwind CSS** | 4.x | CSS utility-first |
| **React Router DOM** | 7.x | Routing SPA |

### Outils

| Outil | Rôle |
|-------|------|
| **ESLint** | Linting du code |
| **pnpm** | Package manager |
| **Git** | Versioning |

### Icônes

| Bibliothèque | Usage |
|-------------|-------|
| **Material Symbols Outlined** | Icônes dans tout le site (via Google Fonts) |

---

## 4. Structure du projet

```
SUPER-AUTO/
├── .gitignore                          # Racine : .env, *.db, .idea/, .vscode/…
├── README.md                           # Point d'entrée documentation
├── AGENTS.md                           # Instructions assistants IA
├── CAHIER_DES_CHARGES_SUPER_AUTO.md    # Spécifications fonctionnelles
│
├── super-auto-api/                      # API Spring Boot (Java 17)
│   ├── src/main/resources/application.properties     # Config commune
│   ├── src/main/resources/application-prod.properties # Config production (secrets via env)
│   └── src/main/java/com/superauto/                # controller / service / repository / config
│
├── deploy/                              # 🚀 Mise en ligne (serveur Linux + nginx)
│   ├── README-DEPLOIEMENT.md           # ⭐ Guide pas à pas (8 étapes)
│   ├── nginx/autoprime.conf            # Configuration nginx (site + proxy API)
│   ├── systemd/autoprime-api.service   # Service systemd de l'API
│   ├── autoprime.env.example           # Secrets (chmod 600)
│   ├── backup-autoprime.sh             # Sauvegarde base + images
│   └── maj-autoprime.sh                # Mise à jour en 1 commande
│
├── super-auto/                         # Application React
│   ├── index.html                      # HTML entry point
│   ├── package.json                    # Dépendances (pnpm)
│   ├── vite.config.ts                  # Configuration Vite
│   ├── tsconfig.json                   # Configuration TypeScript
│   ├── eslint.config.js                # Configuration ESLint
│   ├── .env.example                    # ⭐ Modèle de config VITE_* (le .env reste local)
│   │
│   ├── public/                         # Assets statiques
│   │   ├── logo.svg  logo-invert.svg  logo.png  icons.svg
│   │   └── images/vehicules/           # 11 photos réelles (libres de droits)
│   │
│   ├── doc/                            # Documentation
│   │   ├── README.md                   # Ce fichier
│   │   ├── PARAMETRAGE-TEMPLATE.md     # ⭐ Rebrander le template pour un client
│   │   ├── ARCHITECTURE.md / GUIDE-INSTALLATION.md / GUIDE-DEMODIFICATION.md
│   │   ├── ETAT-APP.md / ETAT_DU_CODE.md / ROADMAP.md
│   │   ├── GLOSSAIRE.md / DEPANNAGE.md / CHARTE-GRAPHIQUE.md
│   │   └── guides/                     # Guides individuels (ajouter une page…)
│   │
│   └── src/
│       ├── main.tsx                    # Point d'entrée React
│       ├── App.tsx                     # Routes (public + /admin)
│       ├── index.css                   # Thème Tailwind (couleurs custom)
│       │
│       ├── config/                     # ⭐ Configuration unique
│       │   ├── site.ts                 # Identité du client
│       │   ├── api.ts                  # Client API (VITE_API_URL, jeton admin)
│       │   ├── auth.ts                 # Session admin (rôles admin / dev)
│       │   └── theme.ts nav.ts contenu.ts entreprise.ts headers.ts logo.ts
│       │
│       ├── components/                 # Composants réutilisables
│       │   ├── Navbar.tsx / Footer.tsx # Sélecteurs de variante selon le layout
│       │   ├── navbars/  footers/      # Variantes Signature, Editorial, Catalogue
│       │   ├── VehicleCard.tsx / VehicleModal.tsx
│       │   ├── PageHeader.tsx / SectionTitle.tsx / Reveal.tsx
│       │   ├── DemandeModal.tsx / SinistreModal.tsx
│       │   └── JustificatifsInput.tsx / JustificatifsListe.tsx
│       │
│       ├── pages/                      # Pages publiques
│       │   ├── Acceuil.tsx  Vente.tsx  Location.tsx  Transit.tsx
│       │   ├── Services.tsx  Contact.tsx  MesDemandes.tsx  VehiculeDetails.tsx
│       │   ├── home/                   # 3 variantes d'accueil (Signature, Editorial, Catalogue)
│       │   └── admin/                  # Espace admin (dashboard, CRUD, messages, devis…)
│       │
│       ├── data/                       # Données statiques (repli hors ligne + seed)
│       │   ├── vehicle.ts  services.ts  testimonials.ts  location.ts  inbox.ts
│       ├── hooks/                      # useVehicules, useMessages, useDevis, useAdminVehicules…
│       ├── store/demandes.ts           # Demandes clients (localStorage)
│       ├── types/                      # Interfaces TypeScript (vehicule, avis, demandes, admin)
│       └── utils/                      # format.ts, image.ts
│
└── super-auto-api/                     # Backend Spring Boot 3 + SQLite
    ├── mvnw / pom.xml / .gitignore
    └── src/main/java/com/superauto/    # controllers, services, entities, dto, mapper
```

---

## 5. Composants réutilisables

| Composant | Fichier | Rôle | Statut |
|-----------|---------|------|--------|
| `Navbar` | `components/Navbar.tsx` (+ `navbars/`) | Navigation sticky + menu mobile ; 3 variantes Signature / Editorial / Catalogue selon le layout | Terminé, intégré |
| `Footer` | `components/Footer.tsx` (+ `footers/`) | Pied de page ; 3 variantes selon le layout | Terminé, intégré |
| `VehicleCard` | `components/VehicleCard.tsx` | Carte véhicule (image + badge + infos) | Intégré (Vente, Location, accueil, détails, admin) |
| `SectionTitle` | `components/SectionTitle.tsx` | Titre centré de section | Intégré (ex. HomeSignature) |
| `PageHeader` | `components/PageHeader.tsx` | En-tête de page (breadcrumb + titre) | Intégré (7 pages) |
| `Reveal` | `components/Reveal.tsx` | Animation d'apparition au scroll | Intégré (accueil) |
| `VehicleModal` | `components/VehicleModal.tsx` | Modale détail véhicule (galerie, tarifs, CTA) | Terminé |
| `DemandeModal` / `SinistreModal` | `components/` | Demandes de location/essai + déclaration de sinistre | Terminé |
| `JustificatifsInput` / `JustificatifsListe` | `components/` | Pièces jointes des demandes (noms/liens) | Terminé |

---

## 6. Pages

**Site public** (routes dans `src/App.tsx`)

| Page | Route | Fichier | Statut |
|------|-------|---------|--------|
| Accueil | `/` | `pages/Acceuil.tsx` (+ `home/` 3 variantes) | ✅ |
| Vente | `/vente` | `pages/Vente.tsx` | ✅ Filtres, tri, modale |
| Location | `/location` | `pages/Location.tsx` | ✅ Filtres, tri, modale, demande |
| Transit | `/transit` | `pages/Transit.tsx` | ✅ 5 étapes + devis → `POST /api/devis-transit` |
| Services | `/services` | `pages/Services.tsx` | ✅ |
| Contact | `/contact` | `pages/Contact.tsx` | ✅ → `POST /api/contact` |
| Suivi client | `/mes-demandes` | `pages/MesDemandes.tsx` | ✅ Recherche nom + téléphone |
| Détail véhicule | `/vehicule/:id` | `pages/VehiculeDetails.tsx` | ✅ |

**Espace admin** (`/admin` + `/admin/connexion`, voir `pages/admin/`)

Tableau de bord, Véhicules, Location, Demandes, Messages, Devis, Services, Apparence, Entreprise, Contenu.

---

## 7. Données

Les données statiques sont dans `src/data/` — **repli hors ligne** (la source de vérité est l'API, seedée par `DataSeeder`) :

| Fichier | Contenu | Statut |
|---------|---------|--------|
| `vehicle.ts` | 8 véhicules (5 Vente, 3 Location) | ✅ Images locales `public/images/vehicules/` |
| `services.ts` | Services, stats, domaines d'expertise | ✅ |
| `testimonials.ts` | 3 témoignages clients | ✅ |
| `location.ts` | Flotte & locations en cours (admin) | ✅ miroir localStorage |
| `inbox.ts` | Boîte de réception (admin) | ✅ miroir localStorage |

---

## 8. Charte graphique résumée

| Couleur | Code | Usage |
|---------|------|-------|
| Bleu principal | #1E3A8A | Headers, liens |
| Bleu foncé | #0F172A | Footer, overlays |
| Rouge accent | #C41E3A | CTA, boutons principaux |
| Fond clair | #fff8f7 | Sections alternées |
| Surface | #FAFAFA | Cartes, inputs |

| Police | Usage |
|--------|-------|
| Epilogue | Titres (700-900) |
| Inter | Corps de texte (400-600) |
| Material Symbols | Icônes |

> Voir [Charte graphique complète](CHARTE-GRAPHIQUE.md)

---

## 9. Avancement actuel

- Site public (8 pages) : ✅ Terminé
- Espace admin (10 écrans) + connexion 3 rôles : ✅ Terminé
- Backend Spring Boot (API REST + auth + seed) : ✅ Terminé
- Branchement front ↔ API (avec repli local) : ✅ Terminé
- Demandes de location/essai/sinistres : 🚧 encore en localStorage (endpoints à prévoir)
- Emails de notification, déploiement : ⬜ Pas commencé

> Voir [État de l'application](ETAT-APP.md) pour le détail
> Voir [Roadmap](ROADMAP.md) pour la suite
> Voir [État du code & plan backend](ETAT_DU_CODE.md) pour le plan d'intégration

---

*Documentation AutoPrime — Version 1.0*
