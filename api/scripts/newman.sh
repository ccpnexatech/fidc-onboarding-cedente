#!/usr/bin/env bash
# Sobe o mock recém-compilado, roda a coleção de homologação e derruba o mock.
set -euo pipefail
cd "$(dirname "$0")/.."

PORT="${PORT:-3000}"
npm run -s build
REFERENCE_DATE=2026-10-14 PORT="$PORT" node dist/main.js > /tmp/fidc-mock-newman.log 2>&1 &
mock=$!
trap 'kill "$mock" 2>/dev/null || true' EXIT

for _ in $(seq 1 40); do
  curl -sf "http://localhost:$PORT/openapi.yaml" > /dev/null && break
  sleep 0.25
done

npx newman run postman/fidc-remessa.postman_collection.json \
  --env-var "baseUrl=http://localhost:$PORT" \
  --reporters cli,junit --reporter-junit-export reports/newman.xml
