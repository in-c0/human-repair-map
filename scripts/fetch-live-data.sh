#!/usr/bin/env bash
# Generated live data (who is working on this, what changed) is deployed, not committed.
# Before a deploy, carry the current copies over from the live site so a records change
# does not wipe them; the nightly workflow regenerates them from scratch.
set -uo pipefail
cd "$(dirname "$0")/.."
SITE="${HRM_SITE:-https://humanrepairmap.com}"
for f in activity.json feed.json; do
  if [ ! -s "public/graph/$f" ]; then
    if curl -fsSL --retry 2 "$SITE/graph/$f" -o "public/graph/$f.tmp" && node -e "JSON.parse(require('fs').readFileSync('public/graph/$f.tmp','utf8'))"; then
      mv "public/graph/$f.tmp" "public/graph/$f"; echo "carried over $f from $SITE"
    else
      rm -f "public/graph/$f.tmp"; echo "no live $f to carry over"
    fi
  fi
done
