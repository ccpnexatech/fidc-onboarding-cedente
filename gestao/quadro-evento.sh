#!/usr/bin/env bash
# Traduz um evento do GitHub Actions em movimentos do quadro (ADR-0007).
#   branch tipo/<nº>-descricao criada      → In progress
#   PR aberto ou pronto com Closes #N      → Review
#   issue aberta ou reaberta               → Todo
#   issue fechada                          → Done
# uso: gestao/quadro-evento.sh <nome do evento> <arquivo JSON do evento>
# QUADRO_DRY_RUN=1 só imprime "<issue>|<status>|<motivo>", sem chamar o GitHub.
set -euo pipefail
cd "$(dirname "$0")/.."

evento="$1"
payload="$2"

mover() {
  if [[ -n "${QUADRO_DRY_RUN:-}" ]]; then
    echo "$1|$2|$3"
  else
    bash gestao/quadro.sh "$1" "$2" "$3"
  fi
}

case "$evento" in
  create)
    [[ "$(jq -r .ref_type "$payload")" == "branch" ]] || exit 0
    branch=$(jq -r .ref "$payload")
    if [[ "$branch" =~ ^[a-z]+/([0-9]+)- ]]; then
      mover "${BASH_REMATCH[1]}" "In progress" "branch $branch"
    fi
    ;;
  pull_request)
    acao=$(jq -r .action "$payload")
    [[ "$acao" =~ ^(opened|reopened|ready_for_review)$ ]] || exit 0
    [[ "$(jq -r .pull_request.draft "$payload")" == "true" ]] && exit 0
    pr=$(jq -r .pull_request.number "$payload")
    issues=$(jq -r '.pull_request.body // ""' "$payload" |
      grep -oiE '\b(close[sd]?|fix(e[sd])?|resolve[sd]?) #[0-9]+' | grep -oE '[0-9]+$' | sort -un || true)
    for issue in $issues; do mover "$issue" "Review" "PR #$pr"; done
    ;;
  issues)
    acao=$(jq -r .action "$payload")
    issue=$(jq -r .issue.number "$payload")
    case "$acao" in
      opened) mover "$issue" "Todo" "issue aberta" ;;
      reopened) mover "$issue" "Todo" "issue reaberta" ;;
      closed)
        if [[ "$(jq -r .issue.state_reason "$payload")" == "not_planned" ]]; then
          mover "$issue" "Done" "fechada como não planejada"
        else
          mover "$issue" "Done" "issue fechada"
        fi
        ;;
    esac
    ;;
esac
