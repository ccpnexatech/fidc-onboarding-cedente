#!/usr/bin/env bash
# Move um card do GitHub Project e registra a mudança como comentário na issue (ADR-0007).
# A API do GitHub não guarda o histórico de colunas; o comentário é a fonte do "entrou em In progress".
# uso: gestao/quadro.sh <nº da issue> <Todo|In progress|Review|Done> [motivo]
# No Actions: PROJECT_TOKEN move o card (projeto de usuário não aceita o GITHUB_TOKEN); GH_TOKEN comenta.
set -euo pipefail
cd "$(dirname "$0")/.."

owner="${OWNER:-ccpnexatech}"
project_number="${PROJECT_NUMBER:-1}"
repo="${REPO:-ccpnexatech/fidc-onboarding-cedente}"
wip_limite=2
issue="$1"
status="$2"
motivo="${3:-}"

if [[ -n "${GITHUB_ACTIONS:-}" && -z "${PROJECT_TOKEN:-}" ]]; then
  echo "::warning::Secret PROJECT_TOKEN ausente: card #$issue não foi movido para $status (ADR-0007)."
  exit 0
fi

projeto() {
  if [[ -n "${PROJECT_TOKEN:-}" ]]; then GH_TOKEN="$PROJECT_TOKEN" gh "$@"; else gh "$@"; fi
}

project_id=$(projeto project view "$project_number" --owner "$owner" --format json --jq .id)
field=$(projeto project field-list "$project_number" --owner "$owner" --format json --jq '.fields[] | select(.name == "Status")')
field_id=$(jq -r .id <<< "$field")
option_id=$(jq -r --arg status "$status" '.options[] | select(.name == $status) | .id' <<< "$field")
[[ -n "$option_id" ]] || { echo "status inválido: $status"; exit 1; }

item=$(projeto project item-add "$project_number" --owner "$owner" --url "https://github.com/$repo/issues/$issue" --format json --jq .id)
anterior=$(projeto api graphql -f id="$item" \
  -f query='query($id: ID!) { node(id: $id) { ... on ProjectV2Item { fieldValueByName(name: "Status") { ... on ProjectV2ItemFieldSingleSelectValue { name } } } } }' \
  --jq '.data.node.fieldValueByName.name // "sem coluna"')

if [[ "$anterior" == "$status" ]]; then
  echo "#$issue já está em $status"
  exit 0
fi

projeto project item-edit --id "$item" --project-id "$project_id" --field-id "$field_id" --single-select-option-id "$option_id" > /dev/null

corpo="<!-- quadro: $status -->
Quadro: $anterior → **$status**${motivo:+ ($motivo)}."

if [[ "$status" == "In progress" ]]; then
  em_andamento=$(projeto project item-list "$project_number" --owner "$owner" --limit 500 --format json --jq '[.items[] | select(.status == "In progress")] | length')
  if (( em_andamento > wip_limite )); then
    corpo+="
WIP estourado: $em_andamento itens em In progress (limite $wip_limite)."
    [[ -n "${GITHUB_ACTIONS:-}" ]] && echo "::warning::WIP estourado: $em_andamento itens em In progress (limite $wip_limite)."
  fi
fi

gh issue comment "$issue" --repo "$repo" --body "$corpo" > /dev/null
echo "#$issue: $anterior -> $status"
