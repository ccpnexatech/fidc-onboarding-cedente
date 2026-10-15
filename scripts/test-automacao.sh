#!/usr/bin/env bash
# Testa os scripts de automação do fluxo (ADR-0007) com eventos simulados, sem chamar o GitHub.
set -euo pipefail
cd "$(dirname "$0")/.."

falhas=0
temporario=$(mktemp -d)
trap 'rm -rf "$temporario"' EXIT

esperar() { # <nome do caso> <saída esperada> <saída obtida>
  if [[ "$2" == "$3" ]]; then
    echo "ok   $1"
  else
    echo "FALHA $1"
    echo "  esperado: $(tr '\n' ';' <<< "$2")"
    echo "  obtido:   $(tr '\n' ';' <<< "$3")"
    falhas=$((falhas + 1))
  fi
}

quadro() { # <evento> <payload JSON>
  echo "$2" > "$temporario/evento.json"
  QUADRO_DRY_RUN=1 bash gestao/quadro-evento.sh "$1" "$temporario/evento.json"
}

esperar "branch tipo/<nº>-descricao vai para In progress" "30|In progress|branch ci/30-quadro" \
  "$(quadro create '{"ref_type":"branch","ref":"ci/30-quadro"}')"
esperar "branch fora do padrão não move card" "" \
  "$(quadro create '{"ref_type":"branch","ref":"rascunho"}')"
esperar "tag não move card" "" \
  "$(quadro create '{"ref_type":"tag","ref":"v1/30-x"}')"
esperar "PR com Closes de duas issues vai para Review" "7|Review|PR #23
8|Review|PR #23" \
  "$(quadro pull_request '{"action":"opened","pull_request":{"number":23,"draft":false,"body":"## O que\nx\n\nCloses #7\ncloses #8\nRefs #21"}}')"
esperar "PR em rascunho não move card" "" \
  "$(quadro pull_request '{"action":"opened","pull_request":{"number":24,"draft":true,"body":"Closes #9"}}')"
esperar "PR pronto para revisão vai para Review" "9|Review|PR #24" \
  "$(quadro pull_request '{"action":"ready_for_review","pull_request":{"number":24,"draft":false,"body":"Fixes #9"}}')"
esperar "PR sem corpo não quebra" "" \
  "$(quadro pull_request '{"action":"opened","pull_request":{"number":25,"draft":false,"body":null}}')"
esperar "issue aberta vai para Todo" "31|Todo|issue aberta" \
  "$(quadro issues '{"action":"opened","issue":{"number":31}}')"
esperar "issue fechada vai para Done" "31|Done|issue fechada" \
  "$(quadro issues '{"action":"closed","issue":{"number":31,"state_reason":"completed"}}')"
esperar "issue não planejada vai para Done com motivo" "31|Done|fechada como não planejada" \
  "$(quadro issues '{"action":"closed","issue":{"number":31,"state_reason":"not_planned"}}')"

if (( falhas > 0 )); then
  echo "$falhas teste(s) de automação falharam."
  exit 1
fi
echo "Automação OK."
