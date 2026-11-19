# 🚀 Guide de mise en ligne — AutoPrime

> Déploiement de référence : **1 serveur Linux (Ubuntu 22.04 / 24.04) + nom de domaine**,
> nginx sert le site et relaie l'API, l'API Spring Boot tourne en service systemd.
> Aucun frais supplémentaire : un VPS à 5–10 €/mois suffit.

---

## 📋 Ce qu'il faut

| Côté client | Côté serveur |
|---|---|
| Nom de domaine (ex. `autoprime.ml`) pointant vers l'IP du serveur | Ubuntu 22.04+ (ou Debian 12) |
| Java 17+, Node 20+ et pnpm (pour construire) | Nginx |
| Les identifiants admin et dev choisis | Un nom de domaine + DNS (A) configuré |
| Les vraies coordonnées (`.env` du front) | Ports 80 et 443 ouverts |

> Sur un hébergeur mutualisé (o2switch, Hostinger…) qui ne permet pas systemd,
> le guide s'applique à un VPS. Sur un mutualisé, l'API devra tourner en
> « JAR + service panel » avec les mêmes variables d'environnement.

---

## 1️⃣ Préparer le serveur

```bash
# Connexion root
ssh root@IP_DU_SERVEUR

apt update && apt upgrade -y
apt install -y nginx sqlite3 curl unzip git

# Java 17 (pour l'API)
apt install -y openjdk-17-jre-headless

# Créer l'utilisateur dédié à l'API (le site ne tourne pas en root)
adduser --system --group --home /opt/autoprime autoprime

# Dossiers de travail
mkdir -p /opt/autoprime /var/lib/autoprime /var/www/autoprime /etc/autoprime /var/backups/autoprime
chown -R autoprime:autoprime /opt/autoprime /var/lib/autoprime
chmod 750 /var/lib/autoprime
```

---

## 2️⃣ Construire les deux artefacts

### Front (site Vite)

Sur votre machine (ou sur le serveur) :

```bash
cd autoprime-web

# 1. Renseigner les vraies coordonnées du client
nano .env          # VITE_SITE_NOM, VITE_TELEPHONE, VITE_EMAIL, VITE_ADRESSE_*…

# 2. Build de production (API en même origine → behind nginx)
pnpm install --frozen-lockfile
pnpm build:prod   # = VITE_API_URL=/ tsc -b && vite build
```

Le résultat est dans `autoprime-web/dist/`.

> **Pourquoi `VITE_API_URL=/` ?** Le navigateur appelle `/api/...` sur le même
> domaine que le site : pas de CORS, pas de configuration supplémentaire.
> Pour une API sur un autre domaine : `VITE_API_URL=https://api.exemple.com pnpm build`.

### API (Spring Boot)

```bash
cd autoprime-api
./mvnw -DskipTests package
```

Le résultat est dans `autoprime-api/target/autoprime-api-0.1.0-SNAPSHOT.jar`.

---

## 3️⃣ Installer l'API sur le serveur

```bash
# Envoyer le jar
scp autoprime-api/target/autoprime-api-0.1.0-SNAPSHOT.jar root@IP:/opt/autoprime/autoprime-api.jar

# Secrets : partir du modèle fourni
scp deploy/autoprime.env.example root@IP:/etc/autoprime/api.env
ssh root@IP
nano /etc/autoprime/api.env      # ⚠️ OBLIGATOIRE : mots de passe, domaine, chemins
chmod 600 /etc/autoprime/api.env
chown root:root /etc/autoprime/api.env

# Service systemd
cp deploy/systemd/autoprime-api.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now autoprime-api
systemctl status autoprime-api

# Vérification
curl http://127.0.0.1:8080/api/vehicules
```

> L'API écoute sur `127.0.0.1:8080` (interne) : elle n'est **jamais** exposée
> directement sur Internet, seul nginx y accède.

---

## 4️⃣ Installer le site (nginx)

```bash
# Envoyer le build
scp -r autoprime-web/dist/* root@IP:/var/www/autoprime/

# Configuration nginx
cp deploy/nginx/autoprime.conf /etc/nginx/sites-available/autoprime
sed -i 's/autoprime.example.com/LE_VRAI_DOMAINE.fr/g' /etc/nginx/sites-available/autoprime
ln -s /etc/nginx/sites-available/autoprime /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

---

## 5️⃣ Activer HTTPS (obligatoire pour les mots de passe)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d LE_VRAI_DOMAINE.fr -d www.LE_VRAI_DOMAINE.fr
# Certbot installe le renouvellement automatique (cron systemd)
certbot renew --dry-run
```

---

## 6️⃣ Pare-feu

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

---

## 7️⃣ Sauvegardes automatiques

```bash
cp deploy/backup-autoprime.sh /opt/autoprime/
chmod +x /opt/autoprime/backup-autoprime.sh

# Une sauvegarde par jour à 3h17
crontab -e
#Ajouter :
17 3 * * * /opt/autoprime/backup-autoprime.sh
```

Les sauvegardes (base + images) sont conservées 30 jours dans `/var/backups/autoprime`.
👉 **À faire aussi hors du serveur** : copie vers Google Drive / une autre machine.

---

## 8️⃣ Mettre à jour le site plus tard

```bash
# Sur votre machine
cd autoprime-web && pnpm build:prod
cd ../autoprime-api && ./mvnw -DskipTests package

# Sur le serveur
scp -r autoprime-web/dist/* root@IP:/var/www/autoprime/
scp autoprime-api/target/autoprime-api-0.1.0-SNAPSHOT.jar root@IP:/opt/autoprime/autoprime-api.jar
ssh root@IP "systemctl restart autoprime-api"
```

---

## 🧪 Tester la configuration de production en local (avant le serveur)

```bash
cd autoprime-api
./mvnw -DskipTests package

# Lancer le jar exactement comme sur le serveur
DB_PATH=/tmp/autoprime-test.db \
PORT=8090 \
CORS_ORIGINS=http://localhost:4173 \
ADMIN_IDENTIFIANT=admin ADMIN_MOT_DE_PASSE=MdpTestAdmin \
DEV_IDENTIFIANT=dev DEV_MOT_DE_PASSE=MdpTestDev \
java -jar target/autoprime-api-0.1.0-SNAPSHOT.jar --spring.profiles.active=prod
```

Vérifications :

```bash
curl http://localhost:8090/api/vehicules                       # 200 (public)
curl http://localhost:8090/api/contact                         # 401 (protégé)
curl -X POST http://localhost:8090/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"identifiant":"dev","motDePasse":"MdpTestDev"}'       # jeton
```

> Sans `ADMIN_MOT_DE_PASSE` / `DEV_MOT_DE_PASSE`, l'API **refuse de démarrer**
> (`Could not resolve placeholder`) : aucune chance d'oublier les secrets en production.

Côté site, la même topologie que nginx se teste en local :

```bash
cd autoprime-web
pnpm build:prod     # API en même origine
pnpm preview        # http://localhost:4173 → /api est relayé vers :8080
```

---

## ✅ Checklist avant d'annoncer le site en ligne

- [ ] Les vraies coordonnées sont dans `autoprime-web/.env` (téléphone, WhatsApp, email, adresse)
- [ ] Mots de passe admin/dev changés dans `/etc/autoprime/api.env`
- [ ] HTTPS actif (cadran 🔒 dans le navigateur)
- [ ] `http://` redirige vers `https://`
- [ ] Connexion admin testée : `/admin/connexion`
- [ ] Un message de test envoyé depuis `/contact` → visible dans `/admin/messages`
- [ ] `systemctl status autoprime-api` → *active (running)*
- [ ] Sauvegarde automatique vérifiée (`/var/backups/autoprime`)
- [ ] Un test sur téléphone (le menu burger, les formulaires)

---

## 🔧 Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| Page blanche, 404 sur `/vente` | Le `try_files` nginx manque ou est mal placé | Vérifier `location / { try_files $uri $uri/ /index.html; }` |
| 502 Bad Gateway | L'API est arrêtée | `systemctl status autoprime-api` puis `journalctl -u autoprime-api -n 50` |
| « Identifiant ou mot de passe incorrect » alors que c'est juste | Les sessions sont invalidées à chaque redémarrage de l'API | C'est normal : se reconnecter |
| 401 sur les messages | Jeton expiré (> 12 h) | Se reconnecter dans `/admin/connexion` |
| L'API démarre pas | Variable d'environnement manquante | `journalctl -u autoprime-api -n 50` — `ADMIN_MOT_DE_PASSE` et `DEV_MOT_DE_PASSE` sont obligatoires en prod |
| Photos ne s'affichent pas | Le build n'a pas été copié en entier | Le dossier `public/` est copié par Vite : vérifier que `dist/images/` existe avant l'envoi |

---

## 🔐 Sécurité — l'essentiel

- [ ] Mots de passe admin et dev **différents et longs**
- [ ] `/etc/autoprime/api.env` en `chmod 600`
- [ ] L'API n'est pas exposée en dehors de `127.0.0.1`
- [ ] HTTPS actif (les mots de passe transitent chiffrés)
- [ ] Sauvegardes automatiques testées
- [ ] `server_tokens off` (déjà dans la config nginx)
