# AutoPrime

Site web vitrine + catalogue automobile pour **AutoPrime** (Bamako, Mali).

---

## Liens rapides

| Document | Description |
|----------|-------------|
| [Documentation principale](autoprime-web/doc/README.md) | Vue d'ensemble complète du projet |
| [Paramétrage du template](autoprime-web/doc/PARAMETRAGE-TEMPLATE.md) | ⭐ Rebrander le site pour un nouveau client |
| [Backend Spring Boot](autoprime-api/GUIDE.md) | API REST (entités/DTOs/mappers faits + guide pour finir) |
| [Architecture technique](autoprime-web/doc/ARCHITECTURE.md) | Structure du code et flux de données |
| [Guide d'installation](autoprime-web/doc/GUIDE-INSTALLATION.md) | Installer et lancer le projet |
| [Guide de modification](autoprime-web/doc/GUIDE-DEMODIFICATION.md) | Scénarios "je veux..." |
| [État de l'application](autoprime-web/doc/ETAT-APP.md) | Ce qui est fait, en cours, à faire |
| [Roadmap](autoprime-web/doc/ROADMAP.md) | Feuille de route du projet |
| [Glossaire](autoprime-web/doc/GLOSSAIRE.md) | Termes techniques expliqués |
| [Dépannage](autoprime-web/doc/DEPANNAGE.md) | Erreurs courantes et solutions |
| [Charte graphique](autoprime-web/doc/CHARTE-GRAPHIQUE.md) | Couleurs, polices, design |

---

## Commandes rapides

```bash
# ── Front (depuis autoprime-web/) ──
pnpm install
pnpm dev        # serveur de développement (http://localhost:5173)
pnpm build      # build de production
pnpm lint       # ESLint

# ── Backend (depuis autoprime-api/, JDK 17+) ──
./mvnw spring-boot:run   # API REST sur http://localhost:8080
```

> Le site reste fonctionnel sans backend : les hooks replient sur les données locales.

---

## Fichiers non poussés sur Git

Le `.gitignore` racine exclut `.env`, `*.db` (`autoprime.db`), `.idea/`, `.vscode/`, `.freebuff/`, `node_modules/`, `dist/`, `target/`. Seul `autoprime-web/.env.example` est versionné.

---

*AutoPrime — Site web automobile au Mali*
