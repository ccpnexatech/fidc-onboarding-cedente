#!/usr/bin/env bash
# Move um card do GitHub Project e registra a mudança em gestao/quadro.csv.
# A API do GitHub não expõe o histórico de colunas; este log é a fonte do "entrou em In progress".
# uso: gestao/quadro.sh <nº da issue> <Todo|In progress|Review|Done>
set -euo pipefail
cd "$(dirname "$0")/.."

owner=ccpnexatech
project_number=1
repo=fidc-onboarding-cedente

project_id=$(gh project view "$project_number" --owner "$owner" --format json --jq .id)
field=$(gh project field-list "$project_number" --owner "$owner" --format json --jq '.fields[] | select(.name == "Status")')
field_id=$(jq -r .id <<< "$field")
option_id=$(jq -r --arg status "$2" '.options[] | select(.name == $status) | .id' <<< "$field")
[[ -n "$option_id" ]] || { echo "status inválido: $2"; exit 1; }

item=$(gh project item-add "$project_number" --owner "$owner" --url "https://github.com/$owner/$repo/issues/$1" --format json --jq .id)
gh project item-edit --id "$item" --project-id "$project_id" --field-id "$field_id" --single-select-option-id "$option_id" > /dev/null

[[ -f gestao/quadro.csv ]] || echo "instante,issue,status" > gestao/quadro.csv
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ),$1,$2" >> gestao/quadro.csv
echo "#$1 -> $2"
