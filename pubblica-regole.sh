#!/bin/bash
# Pubblica firestore.rules su Firebase inserendo gli UID dei gestori al posto del segnaposto.
# Gli UID non stanno nel repository (il codice resta generico): si leggono da
#   - la variabile d'ambiente GESTORI_UID ("uid1,uid2"), oppure
#   - il file .gestori accanto a questo script (un UID per riga, # per i commenti; escluso da git).
# Uso:  ./pubblica-regole.sh ID-PROGETTO-FIREBASE
# Serve lo strumento Firebase (firebase login già fatto).
set -euo pipefail
cd "$(dirname "$0")"

PROGETTO="${1:-${FIREBASE_PROJECT_ID:-}}"
[ -n "$PROGETTO" ] || { echo "Indica l'ID del progetto Firebase: ./pubblica-regole.sh ID-PROGETTO" >&2; exit 1; }

ELENCO="${GESTORI_UID:-}"
if [ -z "$ELENCO" ] && [ -f .gestori ]; then
  ELENCO=$(grep -v '^[[:space:]]*#' .gestori | tr '\n' ',')
fi

LISTA=""
IFS=',' read -ra UIDS <<< "$ELENCO"
for u in "${UIDS[@]}"; do
  u=$(echo "$u" | tr -d '[:space:]')
  [ -z "$u" ] && continue
  [[ "$u" =~ ^[A-Za-z0-9]{10,128}$ ]] || { echo "UID non valido: $u" >&2; exit 1; }
  LISTA="${LISTA:+$LISTA, }'$u'"
done
[ -n "$LISTA" ] || { echo "Nessun UID gestore: imposta GESTORI_UID o crea il file .gestori" >&2; exit 1; }

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
sed "s/'INCOLLA-QUI-IL-TUO-UID'/$LISTA/" firestore.rules > "$TMP/firestore.rules"
grep -q "INCOLLA-QUI" "$TMP/firestore.rules" && { echo "Segnaposto non trovato in firestore.rules" >&2; exit 1; }
printf '{"firestore":{"rules":"firestore.rules"}}\n' > "$TMP/firebase.json"

echo "Pubblico le regole su $PROGETTO con $(echo "$LISTA" | tr ',' '\n' | wc -l | tr -d ' ') gestore/i."
(cd "$TMP" && firebase deploy --only firestore:rules --project "$PROGETTO" --non-interactive)
