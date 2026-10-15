#!/usr/bin/env bash
# Valida as convenções do CLAUDE.md num PR: Conventional Commits em pt-BR no título e nos commits,
# e o corpo com O que / Por que / Como validei e a issue ligada.
# uso: scripts/check-pr.sh [nº do PR]          (sem número: o PR da branch atual)
#      scripts/check-pr.sh --arquivos <título> <arquivo do corpo> <arquivo com um commit por linha>
set -euo pipefail

tipos='feat|fix|refactor|docs|test|chore|ci'
falhas=0

falhar() {
  echo "FALHA: $1"
  [[ -n "${GITHUB_ACTIONS:-}" ]] && echo "::error::$1"
  falhas=$((falhas + 1))
}

checar_mensagem() { # <origem> <mensagem>
  local origem="$1" mensagem="$2"
  if [[ ! "$mensagem" =~ ^($tipos)(\([a-z0-9-]+\))?!?:\ (.+)$ ]]; then
    falhar "$origem fora do padrão 'tipo: descrição' (tipos: ${tipos//|/ }): \"$mensagem\""
    return
  fi
  local descricao="${BASH_REMATCH[3]}"
  [[ "${descricao:0:1}" =~ [[:upper:]] ]] && falhar "$origem começa com maiúscula: \"$mensagem\""
  [[ "$descricao" == *. ]] && falhar "$origem termina com ponto: \"$mensagem\""
  return 0
}

if [[ "${1:-}" == "--arquivos" ]]; then
  titulo="$2"
  corpo=$(cat "$3")
  commits=$(cat "$4")
else
  dados=$(gh pr view ${1:+"$1"} --json title,body,commits)
  titulo=$(jq -r .title <<< "$dados")
  corpo=$(jq -r '.body // ""' <<< "$dados")
  commits=$(jq -r '.commits[].messageHeadline' <<< "$dados")
fi

checar_mensagem "título do PR" "$titulo"

while IFS= read -r commit; do
  [[ -z "$commit" || "$commit" == Merge\ * ]] && continue
  checar_mensagem "commit" "$commit"
done <<< "$commits"

for secao in "## O que" "## Por que" "## Como validei"; do
  grep -q "^$secao" <<< "$corpo" || falhar "corpo do PR sem a seção '$secao' (.github/pull_request_template.md)"
done
grep -qiE '\b(close[sd]?|fix(e[sd])?|resolve[sd]?|refs) #[0-9]+|^sem issue: .+' <<< "$corpo" ||
  falhar "corpo do PR sem 'Closes #N' ('Refs #N' quando não fecha; 'Sem issue: <motivo>' quando não há issue)"

if (( falhas > 0 )); then
  echo "$falhas falha(s) no formato do PR."
  exit 1
fi
echo "PR no formato."
