# ÉTAT DU CODE & PLAN BACKEND — AutoPrime

**Date :** 24 Novembre 2026  
**Périmètre :** Frontend public + espace admin + suivi client (terminés) + Backend (`autoprime-api/` Spring Boot + SQLite : API REST, auth 3 rôles, seed, sécurité, observabilité et tests terminés ; reste emails, upload images, Flyway/PostgreSQL → [GUIDE](../../autoprime-api/GUIDE.md))  
**Référence :** `CAHIER_DES_CHARGES_AUTOPRIME.md` (racine du projet)

---

## PARTIE 1 — ÉTAT DU FRONTEND ✅

### 1.1 Stack

| Techno | Version | Rôle |
|--------|---------|------|
| React | 19.x | UI |
| TypeScript | 6.x | Typage statique |
| Vite | 8.x | Build + dev server |
| Tailwind CSS | 4.x | Styles (thème custom dans `src/index.css`) |
| React Router DOM | 7.x | Routing SPA |
| @formspree/react | 3.x | Envoi du formulaire Contact |

### 1.2 Commandes (depuis `autoprime-web/`)

> ⚠️ Le shell intégré de VS Code ne trouve pas node. Ajouter d'abord :

```bash
export PATH="$HOME/.nvm/versions/node/v24.19.0/bin:$PATH"
pnpm install   # installer les dépendances
pnpm dev       # serveur de dev
pnpm lint      # ESLint
pnpm build     # tsc + vite build
```

**Dernière vérification :** `tsc -b` = 0 erreur, `vite build` = OK ✅, `pnpm lint` = 2 erreurs **préexistantes** (`@/components/ui/badge.tsx` et `button.tsx`, règle `react-refresh/only-export-components`) — hors périmètre.

### 1.3 Routes

**Site public** (`PublicLayout`)

| Route | Fichier | État |
|-------|---------|------|
| `/` | `src/pages/Acceuil.tsx` | ✅ (Hero, Expertise) |
| `/vente` | `src/pages/Vente.tsx` | ✅ Filtres (Marque, Année, Carburant, Localisation), tri, pagination, modale |
| `/location` | `src/pages/Location.tsx` | ✅ Filtres (Type+compteur, Places, Options) brouillon→appliqué, tri, modale |
| `/transit` | `src/pages/Transit.tsx` | ✅ Hero, 5 étapes, formulaire devis, avantages, CTA |
| `/services` | `src/pages/Services.tsx` | ✅ Grille 6 services, stats, CTA |
| `/contact` | `src/pages/Contact.tsx` | ✅ Coordonnées + formulaire Formspree |
| `/mes-demandes` | `src/pages/MesDemandes.tsx` | ✅ Suivi client : recherche nom + téléphone, statuts, motif de refus, signalement de sinistre |
| `/vehicule/:id` | `src/pages/VehiculeDetails.tsx` | ✅ Fiche détaillée + CTA de demande |

**Espace admin** (`AdminLayout`)

| Route | Fichier | État |
|-------|---------|------|
| `/admin/connexion` | `src/pages/admin/AdminConnexion.tsx` | ✅ Connexion (rôles admin / dev, jeton Bearer) |
| `/admin` | `src/pages/admin/AdminDashboard.tsx` | ✅ Stats globales |
| `/admin/vehicules` | `src/pages/admin/AdminVehicules.tsx` | ✅ CRUD complet |
| `/admin/location` | `src/pages/admin/AdminLocation.tsx` (+ `FlotteTab`, `LocationsTab`, `LocationModals`, `ModaleLocation`, `locationShared`) | ✅ Flotte + locations en cours (prolongement, statut) |
| `/admin/demandes` | `src/pages/admin/AdminDemandes.tsx` (+ `CarteDemande`, `CarteSinistre`) | ✅ Validation/refus des demandes de location & d'essai, traitement des sinistres |
| `/admin/messages` | `src/pages/admin/AdminMessages.tsx` | ✅ Messages contact |
| `/admin/devis` | `src/pages/admin/AdminDevis.tsx` | ✅ Devis transit |
| `/admin/services` | `src/pages/admin/AdminServices.tsx` | ✅ CRUD services |
| `/admin/apparence` | `src/pages/admin/AdminAppearance.tsx` | ✅ Layout d'accueil, navbar, footer (rôle dev) |
| `/admin/entreprise` | `src/pages/admin/AdminEntreprise.tsx` | ✅ Infos entreprise (rôle dev) |
| `/admin/contenu` | `src/pages/admin/AdminContenu.tsx` | ✅ Textes du site (rôle dev) |

Les routes sont déclarées dans `src/App.tsx`. La Navbar (`src/components/Navbar.tsx`) pointe vers les 8 pages publiques ; le menu latéral de `AdminLayout.tsx` liste les 10 entrées admin, dont 3 réservées au rôle **dev**.

### 1.4 Composants réutilisables (`src/components/`)

| Composant | Rôle |
|-----------|------|
| `Navbar.tsx` | Fixe, effet blur au scroll, menu hamburger mobile, 6 liens |
| `Footer.tsx` | 4 colonnes (logo, liens, contact, horaires) |
| `VehicleCard.tsx` | Carte véhicule : badge statut, année•localisation, vente→km•carburant / location→places•clim, bouton DÉTAILS |
| `VehicleModal.tsx` | Modale détail **adaptative** : galerie, caractéristiques rapides, prix (« Tarif journalier » si location), CTA (« DEMANDER UNE LOCATION » si location sinon « DEMANDER UN ESSAI »), tableau + clim, tags équipements. Fermeture clic extérieur + Échap, actions masquées si statut « Vendu » |
| `SectionTitle.tsx` | Titre de section centré |
| `JustificatifsInput.tsx` | Sélection libre des justificatifs (cases à cocher) + fichier / lien par document |
| `JustificatifsListe.tsx` | Affichage des justificatifs reçus (chips + aperçu image agrandi) |
| `DemandeModal.tsx` | Formulaire de demande de location (dates, jours calculés, permis obligatoire) ou d'essai |
| `SinistreModal.tsx` | Déclaration d'un problème sur un véhicule loué (gravité mineure/majeure, date, description, justificatifs) |

### 1.5 Données & types

| Fichier | Contenu |
|---------|---------|
| `src/data/vehicle.ts` | `featuredVehicules` — 8 véhicules (5 Vente, 3 Location), images locales `public/images/vehicules/` |
| `src/data/services.ts` | 6 services, 4 statistiques, domaines d'expertise, pourquoi-nous-choisir |
| `src/data/testimonials.ts` | Témoignages clients (alignés sur l'entité `Avis`) |
| `src/data/location.ts` | Flotte + locations (repli hors ligne) |
| `src/data/inbox.ts` | Boîte de réception (repli hors ligne) |
| `src/types/vehicule.ts` | Interface `Vehicule` (champs `carburant` et `localisation` **ajoutés** pour les filtres) |
| `src/types/avis.ts` | Interface `Avis` |
| `src/types/demandes.ts` | `DemandeLocation`, `DemandeEssai`, `Sinistre`, `Justificatif`, `StatutDemande`, `StatutSinistre`, `StoreDemandes` (alignés sur les entités Java) |
| `src/store/demandes.ts` | Hook `useDemandes()` : écritures via `apiEnvoyer` (POST/PATCH), miroir localStorage `sa:demandes`, actions `ajouterLocation/ajouterEssai/ajouterSinistre`, `statuerDemande`, `statuerSinistre`. Refus serveur (400/403…) → erreur remontée à l'écran, rien n'est enregistré ; serveur injoignable seulement → repli local |
| `src/types/index.ts` | Ré-exports |

### 1.6 Parcours métier « demandes » (localStorage, en attendant l'API)

1. **Client** — depuis la modale véhicule (`VehicleModal`) : « DEMANDER UNE LOCATION » (page Location) ou « DEMANDER UN ESSAI » (page Vente) → `DemandeModal` → justificatifs choisis librement, permis obligatoire pour une location.
2. **Admin** — `/admin/demandes` (3 onglets Locations / Essais / Sinistres) : *Valider* ou *Refuser avec motif* ; pour une location validée, *Ouvrir la location* écrit une entrée dans `admin:locations`.
3. **Client** — `/mes-demandes` : recherche par nom + téléphone, statut à jour, motif de refus affiché.
4. **Sinistre** — bouton « Signaler un problème » sur une location validée → `SinistreModal` → côté admin *Mettre en examen* puis *Décider* (accepter/refuser avec réponse au client), affichée sur `/mes-demandes`.

### 1.7 Points d'attention / reste à faire sur le front

1. **Images véhicules** : ✅ résolu — 11 photos locales dans `public/images/vehicules/` (utilisées par `data/vehicle.ts` et le seed backend).
2. **Placeholders télécoms** : vérifier que les numéros affichés (VehicleModal, Contact) sont bien ceux de `src/config/entreprise.ts`.
3. **Formulaire Transit** : ✅ branché → `POST /api/devis-transit` (via `apiSend`).
4. **Formulaire Contact** : ✅ branché → `POST /api/contact` (Formspree retiré, repli conservé dans `SITE.formspreeContact`).
5. **`src/pages/Transite.tsx`** : ✅ supprimé — remplacé par `Transit.tsx`.
6. **Accueil** : ✅ 3 variantes complètes construites (`HomeSignature` par défaut, `HomeAtelier`, `HomeCatalogue`) commutées par `useSiteLayout`.
7. **Thème sombre** et vues grille/liste (boutons visuels) non fonctionnels — optionnels selon le cahier.
8. **Données admin** : véhicules, messages, devis, demandes location/essai et sinistres sont **branchés à l'API** (miroir localStorage conservé hors ligne). Restent en localStorage : flotte/locations (`admin:locations`, `admin:flotte`), apparence/contenu du site. Les justificatifs joints sont des noms de fichiers/liens (ou un aperçu data URL), pas des uploads serveur.
9. **Auth admin** : ✅ — `/admin/connexion` + `AuthFilter` côté API (jeton Bearer, session 12 h, rôles admin/dev). La page « Suivi client » reste volontairement publique.


---

## PARTIE 2 — PLAN BACKEND 🚧 (API + auth + demandes/sinistres faits ; reste emails, upload, BDD)

### 2.1 Objectifs (§5.1 du cahier)

- **Centraliser les données** (véhicules, services, témoignages) — remplacer `src/data/*.ts`
- **Recevoir et stocker** les demandes de contact et de devis transit
- **Fournir une API** pour que le front récupère les données dynamiquement
- **Offrir une interface d'administration** (CRUD sans toucher au code)
- **Envoyer des emails** de notification à chaque demande

### 2.2 Stack retenue (décision : Spring Boot)

> ⚠️ Le cahier proposait Node/Express/Prisma. La stack réellement choisie est
> **Spring Boot 3 (Java 17) + SQLite + JPA** dans `autoprime-api/` — entités, DTOs,
mappers et repositories sont créés (noms de champs FR alignés sur le front).
> Le guide pour finir le reste : [`autoprime-api/GUIDE.md`](../../autoprime-api/GUIDE.md).

Stack initialement prévue dans le cahier (§5.2, non retenue) :

| Techno | Rôle |
|--------|------|
| **Node.js + Express** | Framework API (même langage que le front) |
| **PostgreSQL** | Base de données |
| **Prisma** | ORM (typage TypeScript partagé) |
| **JWT** | Auth admin (sessions 24h) |
| **Nodemailer** | Emails de notification |
| **Multer** | Upload d'images véhicules |

*Alternatives : Strapi (CMS headless) ou Supabase (BaaS PostgreSQL).*

### 2.3 Modèle de données (§5.3)

**Table `vehicles`** — mapping avec l'interface `Vehicule` du front :

| Colonne (BDD) | Type | Champ front actuel |
|---------------|------|--------------------|
| id | PK auto | `id` |
| brand / model / year | texte/nombre | `marque` / `model` / `annee` |
| type | enum `sale` \| `rental` | `service` ("Vente"/"Location") ⚠️ mapping à faire |
| status | enum `available`\|`reserved`\|`sold`\|`new` | `statut` ⚠️ mapping (valeurs FR actuelles) |
| location | texte | `localisation` |
| km / fuel / transmission | nullable | `km` / `carburant` / `transmission` |
| seats / ac | nombre / bool | `places` / `climatisation` ("Oui"/"Non" ⚠️) |
| image / description | texte | `image` / `description` |
| features | JSON | `atouts` (liste séparée par des virgules ⚠️) |
| exteriorColor / interiorColor | texte | `peinture` / `interieur` |
| price / category | texte | `prix` / `category` |
| createdAt / updatedAt | dates | — |

**Table `contacts`** : id, name, email, phone, subject, message, status (`new`/`read`/`archived`), createdAt

**Table `transit_quotes`** : id, name, phone, email, vehicleType, origin (`france`/`usa`/`dubai`/...), message, status (`new`/`contacted`/`archived`), createdAt

**Tables `locations` / `demande_locations` / `essais` / `sinistres`** : le cahier ne les détaille pas, elles sont imposées par les parcours du front (§1.6). Champs attendus : client, téléphone, email, véhicule, dates (début/fin pour une location, date pour un essai), statut, motif de refus, justificatifs (upload multipart), et pour les sinistres : date de l'incident, immatriculation, gravité, description, statut, réponse au client.

**Table `services`** (optionnelle) : id, title, description, icon, image, link, color, order

> ⚠️ **Décision à prendre** : soit on garde les valeurs FR du front et on les stocke telles quelles, soit on migre vers les enums EN du cahier + fonctions de mapping côté front. Préférer les enums EN + mapping (plus propre pour l'admin multilingue futur).

### 2.4 API Endpoints (§5.4)

| Méthode | Route | Usage | État |
|---------|-------|-------|------|
| GET | `/api/vehicules` | Liste du catalogue (seed `DataSeeder`) | ✅ |
| GET | `/api/vehicules/:id` | Détail | ✅ |
| POST/PUT/DELETE | `/api/vehicules[/:id]` | CRUD (admin + vendeur) | ✅ |
| GET/POST/PATCH/DELETE | `/api/contact[/:id][/statut]` | Messages (lecture/écriture : vendeur+ ; suppression : admin/dev) | ✅ |
| GET/POST/PATCH/DELETE | `/api/devis-transit[/:id][/statut]` | Devis transit (`new`/`contacted`/`archived`) | ✅ |
| GET/POST/PUT/DELETE | `/api/services[/:id]` | CRUD services | ✅ |
| GET/POST/PUT/DELETE | `/api/avis[/:id]` | Témoignages clients | ✅ |
| POST `/api/auth/login` · POST `/api/auth/logout` · GET `/api/auth/moi` · POST `/api/auth/mot-de-passe` · GET/POST/PATCH/DELETE `/api/auth/comptes[/:id]` | Session admin (jeton 12 h, BCrypt, limite de tentatives) | ✅ |
| GET | `/api/site/parametres` | Paramètres du site (public) | ✅ |
| GET/POST | `/api/demandes/location` | `{ client, telephone, vehicule, dateDebut, dateFin, justificatifs[] }` | ✅ POST public, GET connecté |
| GET/POST | `/api/demandes/essai` | `{ client, telephone, vehicule, dateEssai, message, justificatifs[] }` | ✅ POST public, GET connecté |
| PATCH | `/api/demandes/location/:id/statut` · `/api/demandes/essai/:id/statut` | `{ statut: validee \| refusee, motifRefus }` | ✅ |
| POST | `/api/demandes/:id/ouvrir-location` | Transforme une demande validée en location | ⬜ à faire (module flotte/locations) |
| GET/POST | `/api/sinistres` | `{ client, telephone, vehicule, dateIncident, gravite, description, justificatifs[] }` | ✅ POST public, GET connecté |
| PATCH | `/api/sinistres/:id/statut` | `{ statut: recue \| en_examen \| acceptee \| refusee, decision }` | ✅ |

### 2.5 Interface d'administration (§5.5)

- Dashboard : stats (nb véhicules, messages, devis)
- Véhicules : liste + recherche/filtres, CRUD (admin + vendeur), upload images, changement de statut
- Services : CRUD, réorganisation (admin + dev)
- Messages contact : liste, lu/non-lu, archivage (vendeur+) ; suppression (admin/dev)
- Devis transit : liste, statut Nouveau/Contacté/Archivé (vendeur+) ; suppression (admin/dev)
- Demandes clients : validation/refus des demandes de location et d'essai (avec motif de refus), traitement des sinistres (mise en examen puis décision)
- Comptes : création, réinitialisation mot de passe, activation/désactivation, suppression (admin/dev)
- Paramètres du site : lecture publique, écriture (admin/dev)
- Sécurité : jeton Bearer stateless, session 12 h, limite de tentatives de connexion (5 / 15 min), BCrypt, migration automatique SHA-256 → BCrypt

### 2.6 Intégration front — réalisée

1. `src/config/api.ts` : client unique (`apiGet` / `apiSend` / `apiDelete`), base URL `VITE_API_URL` (repli `http://localhost:8081`), ajout automatique du jeton `Authorization: Bearer …` si une session admin existe.
2. Hooks : `useVehicules` (catalogue public), `useAdminVehicules` (CRUD), `useMessages`, `useDevis` — **API d'abord, repli localStorage/localData** si le serveur est éteint (badge Serveur/Local).
3. `Contact.tsx` → `POST /api/contact` ; `Transit.tsx` → `POST /api/devis-transit` (Formspree retiré).
4. ✅ Branché : véhicules, services, avis, messages, devis, contact, auth, paramètres du site.
5. ⬜ Reste à brancher : demandes de location/essai/sinistres (§2.4), uploads d'images.
6. Config locale : `autoprime-web/.env` → `VITE_API_URL` (modèle versionné : `.env.example`).
7. Espace admin : **chargement à la demande** (`lazy` + `Suspense`) — le visiteur du site public ne télécharge jamais le code de l'admin.

### 2.7 Roadmap backend proposée

| # | Étape | Livrable |
|---|-------|----------|
| 1 | ✅ Fait : repo `autoprime-api/` : Spring Boot + SQLite (JPA) | serveur + schéma + entités/DTOs/mappers |
| 2 | ✅ Fait : seed (`DataSeeder` : véhicules, services, avis) | tables remplies |
| 3 | ✅ Fait : endpoints publics (`/api/vehicules`, `/api/services`, `/api/avis`, `/api/site/parametres`) | GET fonctionnels |
| 4 | ✅ Fait : endpoints écriture (`/api/contact`, `/api/devis-transit`) + validation | POST fonctionnels |
| 5 | ✅ Fait : auth 3 rôles + CRUD + gestion des comptes + limite de tentatives + BCrypt + migration SHA-256 | sécurité complète |
| 6 | ✅ Fait : intégration front (§2.6) + retrait de Formspree + code-splitting admin | front connecté |
| 7 | ✅ Fait : observabilité (Prometheus + Grafana + Loki) + Swagger (désactivé en prod) | monitoring |
| 8 | ✅ Fait : tests API (27 tests MockMvc, tous verts) | socle de tests |
| 9 | ✅ Fait : endpoints demandes (location, essai) + sinistres (§2.4) + branchement du store front | flux métier branché |
| 10 | ⬜ À faire : emails de notification (demande reçue, décision, sinistre) | emails |
| 11 | ⬜ À faire : upload d'images véhicules (endpoint `MultipartFile`) | upload |
| 12 | ⬜ À faire : migrations Flyway + PostgreSQL en production | BDD |

> L'interface admin du front est déjà réalisée (§1.3, routes `/admin/*`) : elle n'attend plus que les endpoints de demande/sinistre (§2.4).

### 2.8 Hors périmètre (exclus du cahier)

- Paiement en ligne, espace client / authentification publique, multilingue.
