# 📘 AutoPrime (SUPER-AUTO-1) — PRD & TRD

> **Stack** : Spring Boot 3.5 + Java 17 + React 19 + Vite + Tailwind  
> **Domaine** : Service automobile (véhicules, réparations, pièces)  
> **Statut** : En cours

---

## 1. PRD

### Objectifs
- API REST pour gestion de véhicules, réparations, pièces
- Base de données SQLite (léger, fichier unique)
- Interface admin React

### User Stories
| # | En tant que… | Je veux… | Afin de… |
|---|---|---|---|
| 1 | Mechanic | voir la liste des véhicules | planifier des réparations |
| 2 | Mechanic | créer une réparation | suivre l’historique |
| 3 | Admin | gérer les pièces | suivre le stock |
| 4 | Manager | voir le coût total | analyser la rentabilité |

### Priorité : **P0**

---

## 2. TRD

### Backend
- **Framework** : Spring Boot 3.5.7
- **Langage** : Java 17
- **Build** : Maven
- **ORM** : JPA / Hibernate
- **DB** : SQLite
- **API** : REST + Swagger/OpenAPI

### Frontend
- **Framework** : React 19
- **Build** : Vite
- **UI** : Tailwind CSS + React Router 7
- **Auth** : JWT (à implémenter)

### Endpoints (extrait)
```
GET    /api/vehicles
POST   /api/vehicles
GET    /api/vehicles/{id}/repairs
POST   /api/repairs
GET    /api/parts
```

---

## 3. AppFlow — Vehicle Repair Flow

```
1. Client → GET /api/vehicles
2. Backend → SQLite query → JSON list
3. Client → select vehicle → GET /api/repairs/vehicle/{id}
4. Client → add repair → POST /api/repairs
5. Backend → validate → persist → return created repair
```

---

## 4. Design UI/UX

### Wireframe — Vehicle List

```
┌─────────────────────────────────────┐
│  Toolbar : Search | Add Vehicle     │
├─────────────────────────────────────┤
│  Card grid : VehicleCard x N        │
│  [Image | Marque | Modèle | KM |    │
│   Statut | Actions]                  │
└─────────────────────────────────────┘
```

---

## 5. Schéma Backend

```
Vehicule
├── id
├── marque
├── modele
├── annee
├── kilometrage
└── repairs → List<Repair>

Repair
├── id
├── description
├── date
├── cout
├── statut (Open/Done/Canceled)
└── vehicule → Vehicule

Piece
├── id
├── nom
├── ref
├── prix
└── repairs → List<Repair> (ManyToMany)
```

---

## 6. Plan d’Implémentation — Sprint 1 semaine

| Jour | Tâche | Status |
|---|---|---|
| J1-2 | Entités + Repository SQLite | ☐ |
| J3 | REST controllers | ☐ |
| J4 | Swagger/OpenAPI + tests | ☐ |
| J5 | Docker + docker-compose | ☐ |

### Frontend Sprint

| Jour | Tâche | Status |
|---|---|---|
| J1 | Vite + Tailwind + Router setup | ☐ |
| J2-3 | Vehicle list + cards | ☐ |
| J4 | Repair CRUD | ☐ |
| J5 | Auth + protected routes | ☐ |
