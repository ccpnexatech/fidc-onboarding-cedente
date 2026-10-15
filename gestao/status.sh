#!/usr/bin/env bash
# Coleta os dados da semana no GitHub e no repositório e imprime o status report (gestao/status.py).
# uso: gestao/status.sh [AAAA-MM-DD]   (padrão: hoje em Brasília; período = 7 dias antes)
set -euo pipefail
cd "$(dirname "$0")/.."

owner="${OWNER:-ccpnexatech}"
project_number="${PROJECT_NUMBER:-1}"
repo="${REPO:-ccpnexatech/fidc-onboarding-cedente}"
data="${1:-$(TZ=America/Sao_Paulo date +%F)}"
desde=$(date -d "$data -7 days" +%F)

projeto() {
  if [[ -n "${PROJECT_TOKEN:-}" ]]; then GH_TOKEN="$PROJECT_TOKEN" gh "$@"; else gh "$@"; fi
}

mergeados=$(gh pr list --repo "$repo" --state merged --search "merged:>=$desde" --limit 200 --json number,title,body)
abertos=$(gh pr list --repo "$repo" --state open --limit 200 --json number,createdAt)
itens=$(projeto project item-list "$project_number" --owner "$owner" --limit 500 --format json \
  --jq '[.items[] | select(.content.type == "Issue") | {number: .content.number, title: .title, status: (.status // "")}]')
ci_main=$(gh run list --repo "$repo" --workflow check --branch main --limit 1 --json conclusion --jq '.[0].conclusion // ""')
adrs=$({ grep -l '^- \*\*Status:\*\* proposta' decisoes/[0-9]*.md || true; } | xargs -r -n1 basename | cut -c1-4 | jq -R . | jq -sc .)
premissas=$(awk -F'|' '/^\| PR-[0-9]+ \|/ && $6 ~ /a validar/ { gsub(/ /, "", $2); print $2 }' premissas.md | jq -R . | jq -sc .)

jq -n --arg data "$data" --arg desde "$desde" --arg ciMain "$ci_main" \
  --argjson mergeados "$mergeados" --argjson abertos "$abertos" --argjson itens "$itens" \
  --argjson adrsEmProposta "$adrs" --argjson premissasAValidar "$premissas" \
  '{data: $data, desde: $desde, ciMain: $ciMain, mergeados: $mergeados, abertos: $abertos, itens: $itens,
    adrsEmProposta: $adrsEmProposta, premissasAValidar: $premissasAValidar}' |
  python3 -I gestao/status.py
