# État de l'application — AutoPrime

> Rapport sur l'avancement du projet : ce qui est fait, en cours, et pas encore commencé.
> Dernière mise à jour : Octobre 2026

---

## ⚡ Nouveautés Octobre 2026

| Innovation | Statut | Détail |
|-----------|--------|--------|
| API REST complète | ✅ Terminé | 5 contrôleurs (`/api/vehicules`, `/api/contact`, `/api/devis-transit`, `/api/services`, `/api/avis`) + services métier + seed automatique |
| Branchement front ↔ API | ✅ Terminé | `src/config/api.ts` + hook `useVehicules` (repli local si serveur éteint) |
| Admin ↔ API (véhicules) | ✅ Terminé | Hook CRUD `useAdminVehicules` : créer/modifier/supprimer depuis l'admin se répercute immédiatement sur le site public ; badge Serveur/Local ; miroir localStorage conservé hors ligne |
| Formulaires publics → API | ✅ Terminé | Contact → `POST /api/contact` (remplace Formspree), Transit → `POST /api/devis-transit` ; confirmations et messages d'erreur gérés |
| Boîtes admin ← API | ✅ Terminé | Hooks `useMessages` / `useDevis` : lecture, changement de statut (PATCH) et suppression (DELETE) directement en base ; badge Serveur/Local |
| Authentification 3 rôles | ✅ Terminé | Site public libre ; connexion admin (`/admin/connexion`) ; rôle **admin** = contenu, rôle **dev** = contenu + informations entreprise + design. Jeton Bearer contrôlé par l'API (`AuthFilter`) |
| Mise en ligne | ✅ Prêt | Profil `prod` Spring Boot, build front en même origine, config nginx + systemd + sauvegardes + guide pas à pas dans `deploy/` |
| Photos réelles | ✅ Terminé | 11 photos libres (Wikimedia) dans `public/images/vehicules/` — plus aucune URL externe inventée |
| Compteur d'avancement | — | Site public + admin complet ; voir Roadmap pour les finitions |

---

## 🔐 Accès à l'administration (3 rôles)

| Rôle | Identifiant par défaut | Mot de passe par défaut | Accès |
|------|------------------------|------------------------|-------|
| **Visiteur (client)** | — | — | Tout le site public, formulaires contact/devis |
| **Administrateur** | `admin` | `AutoPrime2026` | Tableau de bord, véhicules, location, demandes, messages, devis, services |
| **Développeur** | `dev` | `AutoPrime2026Dev` | Tout l'admin + Apparence du site + Informations de l'entreprise + Contenu du site |

- Page de connexion : **`/admin/connexion`** (toute visite de `/admin` sans session y redirige).
- Le jeton est stocké dans `localStorage` (`admin:session`) et envoyé en `Authorization: Bearer …`.
- Toutes les lectures sensibles (messages, devis) et toutes les écritures sont refusées sans jeton (401 JSON).
- Les écrans design/infos sont masqués pour l'admin et une URL directe (`/admin/apparence`) le renvoie au tableau de bord.
- Session valable **12 h** ; un redémarrage de l'API déconnecte tout le monde.

**Changer les identifiants avant la mise en ligne** dans `autoprime-api/src/main/resources/application.properties`, ou par variables d'environnement :

```bash
ADMIN_IDENTIFIANT=... ADMIN_MOT_DE_PASSE=... DEV_IDENTIFIANT=... DEV_MOT_DE_PASSE=...
```

---

## 1. Résumé

| Métrique | Valeur |
|----------|--------|
| Pages créées | 2 / 6 |
| Composants créés | 4 |
| Dépendances production | 3 (react, react-dom, react-router-dom) |
| Avancement estimé | ~20% |

---

## 2. Statut des fonctionnalités

### Navigation

| Fonctionnalité | Statut | Détail |
|---------------|--------|--------|
| Navbar sticky | Terminé | Fixed, effet blur au scroll |
| Menu hamburger mobile | Terminé | Ouverture/fermeture avec animation |
| Liens navigation | Terminé | Utilisent `<Link>` de react-router-dom |
| Footer 4 colonnes | Terminé | Logo, liens, contact, horaires |
| Routing | Terminé | BrowserRouter + Routes dans App.tsx |

### Pages

| Page | Statut | Détail |
|------|--------|--------|
| Accueil (`/`) | Partiel | Hero + 3 cartes expertise. Manque : véhicules vedette, pourquoi nous choisir, témoignages, CTA |
| Vente (`/vente`) | Pas encore fait | — |
| Location (`/location`) | Pas encore fait | — |
| Transit (`/transit`) | Pas encore fait | — |
| Services (`/services`) | Pas encore fait | — |
| Contact (`/contact`) | En cours | Header + coordonnées en cours |

### Composants

| Composant | Statut | Détail |
|-----------|--------|--------|
| `Navbar.tsx` | Terminé | Navigation complète avec mobile |
| `Footer.tsx` | Terminé | 4 colonnes, responsive |
| `VehicleCard.tsx` | Code présent | Non intégré dans les pages |
| `SectionTitle.tsx` | Code présent | Non intégré dans les pages |

### Données

| Fichier | Statut | Détail |
|---------|--------|--------|
| `vehicle.ts` | Présent | 8 véhicules. URLs d'images externes fausses |
| `services.ts` | Présent | 3 domaines + 4 valeurs |
| `testimonials.ts` | Présent | 3 témoignages |

### Types

| Fichier | Statut | Détail |
|---------|--------|--------|
| `vehicule.ts` | Présent | Interface Vehicule complète |
| `avis.ts` | Présent | Interface Avis |
| `index.ts` | Présent | Exports groupés |

---

## 3. Statut des pages détaillé

### Page Accueil — Partiellement terminé

| Section | Statut |
|---------|--------|
| Hero (image + titre + CTA) | Terminé |
| Domaines d'expertise (3 cartes) | Terminé |
| Véhicules en vedette (onglets + grille) | Pas encore fait |
| Pourquoi nous choisir (4 valeurs) | Pas encore fait |
| Témoignages clients (3 avis) | Pas encore fait |
| Bannière CTA | Pas encore fait |

### Page Contact — En cours

| Section | Statut |
|---------|--------|
| Header (breadcrumb + titre) | En cours |
| Coordonnées (adresse, tel, email, horaires) | En cours |
| Carte placeholder | En cours |
| Formulaire de contact | En cours |
| Message de confirmation | En cours |

---

## 4. Problèmes connus

| Problème | Priorité | Détail |
|----------|----------|--------|
| URLs d'images véhicules fausses | Haute | Les images dans `vehicle.ts` sont des URLs externes inventées |
| Pas d'images dans `public/` | Haute | Les images spécifiées dans le cahier des charges ne sont pas encore ajoutées |
| Fichiers non utilisés | Moyenne | `VehicleCard.tsx`, `SectionTitle.tsx`, `data/services.ts`, `data/testimonials.ts` existent mais ne sont pas importés |
| Favicon bascule | Basse | Le favicon utilise le logo AutoPrime (ok) |
| Page `Acceuil.tsx` mal orthographié | Basse | Devrait être `Accueil.tsx` |
| Page `Contacte.tsx` mal orthographié | Basse | Devrait être `Contact.tsx` |

---

## 5. Ce qui n'est pas encore fait

### Frontend

- [ ] Pages Vente, Location, Transit, Services
- [ ] Composant VehicleModal (fenêtre de détail)
- [ ] Filtres de recherche (Vente + Location)
- [ ] Pagination
- [ ] Formulaires (Contact + Transit devis)
- [ ] Animations (Ken Burns hero, hover cartes)
- [ ] Responsive complet (testé sur tous les breakpoints)
- [ ] Accessibilité (aria-labels, navigation clavier)
- [ ] SEO (meta tags pour chaque page)
- [ ] Lazy loading images

### Backend

- [ ] API REST (Node.js + Express)
- [ ] Base de données (PostgreSQL + Prisma)
- [ ] Interface d'administration
- [ ] Envoi d'emails (Nodemailer)
- [ ] Authentification JWT

### Déploiement

- [x] Configuration production : profil `prod` Spring Boot (`application-prod.properties` — secrets obligatoires, base hors dossier applicatif, erreurs serveur masquées)
- [x] Build front « même origine » : `pnpm build:prod` (`VITE_API_URL=/`) → le navigateur appelle `/api/...` sur le domaine du site, plus aucun CORS à configurer
- [x] Fichiers de déploiement dans `deploy/` : `nginx/autoprime.conf` (cache, compression, en-têtes de sécurité, limitation des connexions admin), `systemd/autoprime-api.service` (redémarrage auto, durcissement), `autoprime.env.example` (secrets)
- [x] Sauvegardes automatiques : `deploy/backup-autoprime.sh` (SQLite + images, rotation 30 jours)
- [x] Mise à jour en 1 commande : `deploy/maj-autoprime.sh user@domaine`
- [x] Guide pas à pas : `deploy/README-DEPLOIEMENT.md` (serveur → build → API → nginx → HTTPS → pare-feu → sauvegardes)
- [ ] Nom de domaine + VPS chez le client (DNS, HTTPS certbot, pare-feu)
- [ ] Renseigner les vraies coordonnées dans `autoprime-web/.env` (téléphone, WhatsApp, email, adresse)

---

## 6. Fichiers de déploiement

| Fichier | Rôle |
|---------|------|
| `deploy/README-DEPLOIEMENT.md` | Guide complet, 8 étapes + checklist + dépannage |
| `deploy/nginx/autoprime.conf` | Configuration nginx (site + proxy API) |
| `deploy/systemd/autoprime-api.service` | Service systemd de l'API |
| `deploy/autoprime.env.example` | Modèle de fichier de secrets (`chmod 600`) |
| `deploy/backup-autoprime.sh` | Sauvegarde base + images |
| `deploy/maj-autoprime.sh` | Rebuild + envoi + redémarrage |

---

*État de l'application — AutoPrime — Version 1.0*
