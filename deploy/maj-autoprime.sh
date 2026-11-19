#!/usr/bin/env bash
# ==================================================================
#  Mise à jour d'une AutoPrime déjà en ligne (site + API)
#
#  Usage (depuis la machine locale, à la racine du projet) :
#     ./deploy/maj-autoprime.sh user@votre-domaine.fr
#
#  Le script :
#    1. construit le front (mode production, API en même origine)
#    2. construit le jar de l'API
#    3. envoie les deux artefacts sur le serveur
#    4. redémarre le service API et recharge nginx
# ==================================================================
set -euo pipefail

SERVEUR="${1:-}"
if [ -z "$SERVEUR" ]; then
    echo "❌ Usage : ./deploy/maj-autoprime.sh user@domaine.fr" >&2
    exit 1
fi

RACINE="$(cd "$(dirname "$0")/.." && pwd)"
FRONT="$RACINE/super-auto"
API="$RACINE/super-auto-api"

echo "▶ 1/4 Build du site (production)…"
cd "$FRONT"
pnpm install --frozen-lockfile
pnpm build:prod

echo "▶ 2/4 Build de l'API…"
cd "$API"
./mvnw -DskipTests package
JAR="$(ls -t target/super-auto-api-*.jar | head -1)"
echo "    → $JAR"

echo "▶ 3/4 Envoi au serveur…"
scp -r "$FRONT/dist/." "$SERVEUR:/var/www/autoprime/"
scp "$JAR" "$SERVEUR:/opt/autoprime/super-auto-api.jar"

echo "▶ 4/4 Redémarrage de l'API…"
ssh "$SERVEUR" "systemctl restart autoprime-api && sleep 3 && systemctl is-active autoprime-api"

echo "✅ Mise à jour terminée — teste https://$(echo "$SERVEUR" | cut -d@ -f2)/admin/connexion"
