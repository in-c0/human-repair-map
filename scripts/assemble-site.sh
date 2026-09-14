#!/usr/bin/env bash
# Assemble the public site into _site/. Used by deploy.yml (on push to main) and
# live-data.yml (nightly). Only what belongs on the site is copied; design notes,
# records/ and the README stay out.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf _site
mkdir -p _site/content/art _site/reconstruction _site/data _site/graph
cp index.html _site/index.html
cp content/*.js content/*.css _site/content/
cp content/art/*.jpg _site/content/art/
cp og.svg _site/og.svg
cp reconstruction/index.html _site/reconstruction/index.html
cp data/cns-delivery.json _site/data/cns-delivery.json
# The machine-readable graph: bulk exports, the JSON Schemas, and the generated
# live data (activity.json, feed.json) when present.
cp -r public/graph/. _site/graph/
echo "Assembled:"; find _site -type f | sort
