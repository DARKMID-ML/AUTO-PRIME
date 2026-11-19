# AutoPrime

Site web vitrine + catalogue automobile pour **AutoPrime** (Bamako, Mali).

---

## Liens rapides

| Document | Description |
|----------|-------------|
| [Documentation principale](super-auto/doc/README.md) | Vue d'ensemble complète du projet |
| [Paramétrage du template](super-auto/doc/PARAMETRAGE-TEMPLATE.md) | ⭐ Rebrander le site pour un nouveau client |
| [Backend Spring Boot](super-auto-api/GUIDE.md) | API REST (entités/DTOs/mappers faits + guide pour finir) |
| [Architecture technique](super-auto/doc/ARCHITECTURE.md) | Structure du code et flux de données |
| [Guide d'installation](super-auto/doc/GUIDE-INSTALLATION.md) | Installer et lancer le projet |
| [Guide de modification](super-auto/doc/GUIDE-DEMODIFICATION.md) | Scénarios "je veux..." |
| [État de l'application](super-auto/doc/ETAT-APP.md) | Ce qui est fait, en cours, à faire |
| [Roadmap](super-auto/doc/ROADMAP.md) | Feuille de route du projet |
| [Glossaire](super-auto/doc/GLOSSAIRE.md) | Termes techniques expliqués |
| [Dépannage](super-auto/doc/DEPANNAGE.md) | Erreurs courantes et solutions |
| [Charte graphique](super-auto/doc/CHARTE-GRAPHIQUE.md) | Couleurs, polices, design |

---

## Commandes rapides

```bash
# ── Front (depuis super-auto/) ──
pnpm install
pnpm dev        # serveur de développement (http://localhost:5173)
pnpm build      # build de production
pnpm lint       # ESLint

# ── Backend (depuis super-auto-api/, JDK 17+) ──
./mvnw spring-boot:run   # API REST sur http://localhost:8080
```

> Le site reste fonctionnel sans backend : les hooks replient sur les données locales.

---

## Fichiers non poussés sur Git

Le `.gitignore` racine exclut `.env`, `*.db` (`super-auto.db`), `.idea/`, `.vscode/`, `.freebuff/`, `node_modules/`, `dist/`, `target/`. Seul `super-auto/.env.example` est versionné.

---

*AutoPrime — Site web automobile au Mali*
