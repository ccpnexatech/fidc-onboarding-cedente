#!/usr/bin/env bash
# Lead time por história/tarefa a partir do GitHub e do Git (.claude/rules/gestao.md).
# Início = primeiro commit do PR que fecha a issue (proxy de "entrou em In progress"; ver metricas.md).
# Review = abertura do PR. Fim = merge do PR.
set -euo pipefail

repo="${REPO:-ccpnexatech/fidc-onboarding-cedente}"

dias() { # diferença em dias (1 casa) entre dois instantes ISO 8601
  python3 -I -c 'import sys,datetime as d;f=lambda s:d.datetime.fromisoformat(s.replace("Z","+00:00"));print(f"{(f(sys.argv[2])-f(sys.argv[1])).total_seconds()/86400:.1f}".replace(".",","))' "$1" "$2"
}

prs=$(gh pr list --repo "$repo" --state all --limit 200 --json number,body,createdAt,mergedAt)

echo "| Issue | Título | PR | Início (1º commit) | PR aberto | Merge | Início → PR (dias) | Lead time (dias) |"
echo "|---|---|---|---|---|---|---|---|"
gh issue list --repo "$repo" --state all --limit 200 --json number,title,labels \
  --jq '.[] | select([.labels[].name] | any(. == "historia" or . == "tarefa")) | "\(.number)\t\(.title)"' |
  sort -n | while IFS=$'\t' read -r numero titulo; do
    pr=$(jq -r --arg n "$numero" '[.[] | select(.body | test("Closes #" + $n + "\\b"))] | first | if . == null then "" else "\(.number)\t\(.createdAt)\t\(.mergedAt // "")" end' <<< "$prs")
    if [[ -z "$pr" ]]; then
      echo "| #$numero | $titulo | — | — | — | — | — | — |"
      continue
    fi
    IFS=$'\t' read -r pr_numero aberto merge <<< "$pr"
    inicio=$(gh pr view "$pr_numero" --repo "$repo" --json commits --jq '[.commits[].committedDate] | min')
    ate_pr=$(dias "$inicio" "$aberto")
    if [[ -n "$merge" ]]; then lead=$(dias "$inicio" "$merge"); merge_dia=${merge:0:16}; else lead="pendente"; merge_dia="—"; fi
    echo "| #$numero | $titulo | #$pr_numero | ${inicio:0:16} | ${aberto:0:16} | $merge_dia | $ate_pr | $lead |"
  done
