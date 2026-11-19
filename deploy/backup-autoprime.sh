#!/usr/bin/env bash
# ==================================================================
#  Sauvegarde AutoPrime : base SQLite + images du site
#  Usage : sudo ./backup-autoprime.sh [dossier-destination]
#  Cron :  17 3 * * * /opt/autoprime/backup-autoprime.sh
# ==================================================================
set -euo pipefail

DB="${DB_PATH:-/var/lib/autoprime/super-auto.db}"
SITE="${SITE_DIR:-/var/www/autoprime}"
DEST="${1:-/var/backups/autoprime}"
HORODATAGE="$(date +%Y-%m-%d_%H%M)"

if [ ! -f "$DB" ]; then
    echo "❌ Base introuvable : $DB" >&2
    exit 1
fi

mkdir -p "$DEST"

# Sauvegarde SQLite cohérente (sans arrêter l'API)
sqlite3 "$DB" ".backup '$DEST/autoprime-$HORODATAGE.db'"

# Images (photos véhicules, logo…) si le dossier existe
if [ -d "$SITE/images" ]; then
    tar czf "$DEST/images-$HORODATAGE.tar.gz" -C "$SITE" images
fi

# Conservation : 30 jours
find "$DEST" -type f -mtime +30 -delete

echo "✅ Sauvegarde terminée : $DEST/autoprime-$HORODATAGE.db"
ls -lh "$DEST" | tail -5
