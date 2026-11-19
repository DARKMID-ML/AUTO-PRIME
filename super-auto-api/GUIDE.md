# 🛠️ GUIDE — Finir le backend AutoPrime (Spring Boot + SQLite)

> **État actuel du projet :** entités, DTOs, mappers, repositories et config CORS sont prêts.
> Ce guide te montre comment construire le reste **seul** : services, contrôleurs, seed, auth, front.
>
> **Prérequis :** Java 17 installé (déjà le cas). Aucun Maven à installer : le wrapper `./mvnw` se charge tout seul.

---

## 0. Commandes de base

```bash
cd super-auto-api
./mvnw spring-boot:run          # lancer l'API sur http://localhost:8080
./mvnw compile                  # vérifier que ça compile
./mvnw package                  # générer le .jar dans target/
java -jar target/*.jar          # lancer le .jar
```

- Base de données : fichier `super-auto.db` (créé automatiquement au premier lancement).
- Pour **reset** la BDD : supprimer `super-auto.db` et relancer (les tables sont recréées par `ddl-auto: update`).
- Le port est dans `src/main/resources/application.properties` (8080).
- CORS : les origines du front sont dans le même fichier, clé `cors.allowed-origins`.

---

## 1. Les 3 règles du projet (à ne pas casser)

1. **L'entité ne sort jamais du backend** → toujours mapper vers le DTO avant de répondre
   (les mappers dans `mapper/` sont déjà écrits : `VehiculeMapper.toDTO(...)`, etc.).
2. **Le JSON parle français** → les champs JSON sont `marque`, `annee`, `prix`…
   exactement ceux du type TS `Vehicule`. Le front n'a aucune traduction à faire.
3. **Le contrôleur ne touche jamais la base directement** → Contrôleur → Service → Repository.

---

## 2. La couche Service (métier)

Crée `src/main/java/com/superauto/service/VehiculeService.java` :

```java
package com.superauto.service;

import com.superauto.dto.VehiculeDTO;
import com.superauto.entity.Vehicule;
import com.superauto.mapper.VehiculeMapper;
import com.superauto.repository.VehiculeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehiculeService {

    private final VehiculeRepository repository;

    public VehiculeService(VehiculeRepository repository) {
        this.repository = repository;   // injection par constructeur (standard Spring)
    }

    public List<VehiculeDTO> findAll(String service) {
        List<Vehicule> vehicules = (service == null || service.isBlank())
                ? repository.findAll()
                : repository.findByServiceIgnoreCase(service);
        return VehiculeMapper.toDTO(vehicules);
    }

    public VehiculeDTO findById(Long id) {
        return repository.findById(id)
                .map(VehiculeMapper::toDTO)
                .orElseThrow(() -> new NoSuchElementException("Véhicule " + id + " introuvable"));
    }
}
```

Répète le schéma pour `ContactService`, `DevisTransitService`, `ServiceService`, `AvisService`.

> 💡 Astuce : les méthodes de filtre sont **déjà déclarées** dans `repository/VehiculeRepository.java`
> (`findByServiceIgnoreCase`, `findByCarburantIgnoreCase`, `findByMarqueContainingIgnoreCaseOrModelContainingIgnoreCase`…).
> Spring Data les implémente automatiquement.

---

## 3. Les contrôleurs REST (les endpoints du cahier des charges)

### 3.1 Véhicules — `controller/VehiculeController.java`

```java
package com.superauto.controller;

import com.superauto.dto.VehiculeDTO;
import com.superauto.service.VehiculeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin   // le CORS global est déjà géré par config/WebConfig.java, pas besoin ici
public class VehiculeController {

    private final VehiculeService service;

    public VehiculeController(VehiculeService service) {
        this.service = service;
    }

    // GET /api/vehicles?service=Vente
    @GetMapping
    public List<VehiculeDTO> getAll(@RequestParam(required = false) String service) {
        return service.findAll(service);
    }

    // GET /api/vehicles/42
    @GetMapping("/{id}")
    public VehiculeDTO getOne(@PathVariable Long id) {
        return service.findById(id);
    }
}
```

### 3.2 Endpoints à créer (cahier §5.4)

| Méthode | URL | Corps | Réponse | Rôle |
|---|---|---|---|---|
| GET | `/api/vehicles` | — | `List<VehiculeDTO>` | Liste (+ `?service=Vente`) |
| GET | `/api/vehicles/{id}` | — | `VehiculeDTO` | Détail |
| POST | `/api/vehicles` | `VehiculeDTO` | `VehiculeDTO` | Créer (admin) |
| PUT | `/api/vehicles/{id}` | `VehiculeDTO` | `VehiculeDTO` | Modifier (admin) |
| DELETE | `/api/vehicles/{id}` | — | 204 | Supprimer (admin) |
| POST | `/api/contact` | `ContactRequest` | `{ success, message }` | Formulaire contact |
| POST | `/api/transit/quote` | `DevisTransitRequest` | `{ success, message }` | Devis transit |
| GET | `/api/services` | — | `List<ServiceDTO>` | Les 6 services |
| GET | `/api/avis` | — | `List<AvisDTO>` | Témoignages |

### 3.3 POST avec validation — `controller/ContactController.java`

```java
@PostMapping("/api/contact")
public ResponseEntity<?> envoyer(@Valid @RequestBody ContactRequest request, BindingResult result) {
    if (result.hasErrors()) {
        String erreur = result.getAllErrors().get(0).getDefaultMessage();
        return ResponseEntity.badRequest().body(Map.of("success", false, "message", erreur));
    }
    contactService.enregistrer(request);            // repository.save(ContactMapper.toEntity(request))
    return ResponseEntity.ok(Map.of("success", true, "message", "Message envoyé !"));
}
```

- `@Valid` déclenche les annotations `@NotBlank` / `@Email` déjà posées sur les DTO de requête.
- `MappingJackson2HttpMessageConverter` sérialise les DTO automatiquement → **aucun `@ResponseBody` à ajouter**.

### 3.4 Gérer les erreurs proprement

Crée `controller/GlobalExceptionHandler.java` :

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, Object>> introuvable(NoSuchElementException e) {
        return ResponseEntity.status(404).body(Map.of("success", false, "message", e.getMessage()));
    }
}
```

---

## 4. Seeder la base (les 12 véhicules actuels)

Crée `config/SeedData.java` — un `CommandLineRunner` qui remplit la base au premier lancement :

```java
@Component
public class SeedData implements CommandLineRunner {
    private final VehiculeRepository vehicules;
    private final ServiceRepository services;

    public SeedData(VehiculeRepository vehicules, ServiceRepository services) {
        this.vehicules = vehicules;
        this.services = services;
    }

    @Override
    public void run(String... args) {
        if (vehicules.count() > 0) return;   // déjà seedé : on n'écrase rien

        Vehicule v = new Vehicule();
        v.setMarque("Tesla");
        v.setModel("Model S");
        v.setAnnee(2020);
        // ... copier les 12 objets de super-auto/src/data/vehicle.ts
        vehicules.save(v);
    }
}
```

> Les données à copier sont dans `super-auto/src/data/vehicle.ts` (12 véhicules),
> `super-auto/src/data/services.ts` (6 services) et `super-auto/src/data/testimonials.ts` (3 avis).
> Le test `if (count() > 0) return;` évite d'importer à chaque démarrage.

---

## 5. Tester sans le front

```bash
curl http://localhost:8080/api/vehicles
curl http://localhost:8080/api/vehicles/1

curl -X POST http://localhost:8080/api/contact \
  -H "Content-Type: application/json" \
  -d '{"nom":"Amadou","email":"a@mail.ml","sujet":"Achat de véhicule","message":"Bonjour"}'

curl -X POST http://localhost:8080/api/transit/quote \
  -H "Content-Type: application/json" \
  -d '{"nom":"Ibrahim","telephone":"+223 70 00 00 00","vehicule":"Toyota Hilux 2024","pays":"france"}'
```

---

## 6. Brancher le front React (quand l'API fonctionne)

1. **Variables d'environnement** : crée `super-auto/.env`
   ```
   VITE_API_URL=http://localhost:8080
   ```
2. **Client HTTP** : crée `super-auto/src/api/client.ts`
   ```ts
   const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

   export async function apiGet<T>(path: string): Promise<T> {
     const res = await fetch(`${BASE}${path}`);
     if (!res.ok) throw new Error(`Erreur ${res.status}`);
     return res.json() as Promise<T>;
   }

   export async function apiPost<T>(path: string, body: unknown): Promise<T> {
     const res = await fetch(`${BASE}${path}`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(body),
     });
     if (!res.ok) throw new Error(`Erreur ${res.status}`);
     return res.json() as Promise<T>;
   }
   ```
3. **Remplacer les données statiques** :
   - `Acceuil.tsx`, `Vente.tsx`, `Location.tsx` : remplacer
     `import { featuredVehicules } from "../data/vehicle"` par un `useEffect` + `apiGet("/api/vehicles")`.
     Ajoute un hook `useVehicles(service?)` avec états `loading` / `error` pour ne pas casser l'UI.
   - `Contact.tsx` : remplacer Formspree par `apiPost("/api/contact", valeurs)`.
   - `Transit.tsx` : remplacer la confirmation locale par `apiPost("/api/transit/quote", valeurs)`.
   - `Services.tsx` et témoignages : `apiGet("/api/services")` et `apiGet("/api/avis")` (optionnel, données statiques OK).
4. **Ne pas oublier** : `e.preventDefault()` dans les `onSubmit`, et afficher le message d'erreur
   renvoyé par l'API (les `@NotBlank` répondent 400 avec le premier message en français).

---

## 7. Auth JWT (routes admin)

Ordre conseillé :

1. `spring-boot-starter-security` + `jjwt` (io.jsonwebtoken) dans `pom.xml`.
2. Entité `Admin` (id, email, motDePasse hashé avec BCrypt).
3. `POST /api/auth/login` → vérifie les identités → renvoie un JWT (expiration 24h, cf. cahier §5.5).
4. Filtre JWT qui vérifie le header `Authorization: Bearer <token>` sur `/api/**` sauf
   les routes publiques (`GET /api/vehicles`, `GET /api/services`, `GET /api/avis`,
   `POST /api/contact`, `POST /api/transit/quote`).
5. Endpoint admin **désactivé à la création** : une migration `001-admin.sql` ou un
   `ApplicationRunner` qui crée un admin depuis des variables d'env (`ADMIN_EMAIL`, `ADMIN_PASSWORD`).

---

## 8. Aller plus loin (fonctionnalités du cahier)

| Fonctionnalité | Comment |
|---|---|
| **Upload d'images** | Endpoint `POST /api/uploads` avec `MultipartFile` → stocker dans `uploads/` et servir via `spring.web.resources.static-locations` ; stocker l'URL dans `vehicules.image` |
| **Emails** | `spring-boot-starter-mail` + `JavaMailSender` ; envoyer un mail à `contact@autoprime.com` à chaque nouveau `Contact` / `DevisTransit` (dans le service, après `save`) |
| **Interface admin** | Pages `/admin` dans le front React (protégées côté API par le JWT), ou Spring Data REST |
| **Enums** | Remplacer `String statut` par `enum StatutVehicule { DISPONIBLE, RESERVE, VENDU, NOUVEAU }` + un `Converter` pour garder les valeurs FR dans le JSON |
| **Migrations** | Passer de `ddl-auto: update` à Flyway (`db/migration/V1__init.sql`) avant la mise en production |

---

## 9. Ordre de travail recommandé

- [x] 1. Projet Maven + wrapper + SQLite
- [x] 2. Entités, DTOs, mappers, repositories, CORS
- [ ] 3. Services (`VehiculeService`, `ContactService`, `DevisTransitService`…)
- [ ] 4. Contrôleurs publics : `GET /api/vehicles`, `POST /api/contact`, `POST /api/transit/quote`
- [ ] 5. Seed des données (12 véhicules, 6 services, 3 avis)
- [ ] 6. Branchement du front (§6) → disparition de Formspree
- [ ] 7. CRUD admin (`POST/PUT/DELETE /api/vehicles`) + upload images
- [ ] 8. Auth JWT (§7)
- [ ] 9. Emails de notification
- [ ] 10. Interface d'administration

---

## Dépannage

| Symptôme | Cause / solution |
|---|---|
| `Address already in use` | Le port 8080 est pris → changer `server.port` dans `application.properties` ou lancer avec `./mvnw spring-boot:run -Dspring-boot.run.arguments=--server.port=8090` |
| `SQLITE_ERROR: no such table` | Supprimer `super-auto.db` et relancer (Hibernate recrée les tables) |
| CORS bloquant côté navigateur | Ajouter l'origin du front dans `cors.allowed-origins` (`application.properties`) |
| `404` sur `/api/vehicles` | Le contrôleur n'existe pas encore → étape 3 |
| Changement de champ non pris | `ddl-auto: update` n'**altère pas** les colonnes existantes → supprimer `super-auto.db` en dev |
| Le wrapper échoue | Vérifier la connexion internet (Maven télécharge les dépendances au premier `./mvnw`) |

---

*Guide créé avec la foundation : entités / DTOs / mappers. Le reste est à toi.* 🚀
