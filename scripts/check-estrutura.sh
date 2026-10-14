#!/usr/bin/env bash
# Valida a estrutura mínima do repositório e o formato das ADRs.
set -euo pipefail

falhas=0

falhar() {
  echo "FALHA: $1"
  falhas=$((falhas + 1))
}

for arquivo in CLAUDE.md README.md premissas.md docs/glossario.md decisoes/README.md \
  .claude/rules/requisitos.md .claude/rules/arquitetura.md .claude/rules/api.md \
  .claude/rules/testes.md .claude/rules/gestao.md .claude/rules/adr.md .claude/rules/diario.md; do
  [[ -f "$arquivo" ]] || falhar "arquivo obrigatório ausente: $arquivo"
done

for adr in decisoes/[0-9][0-9][0-9][0-9]-*.md; do
  [[ -e "$adr" ]] || continue
  nome=$(basename "$adr")
  [[ "$nome" =~ ^[0-9]{4}-[a-z0-9-]+\.md$ ]] || falhar "nome de ADR fora do padrão: $nome"
  for secao in "## Problema" "## Opções" "## Decisão" "## Consequências"; do
    grep -q "^$secao" "$adr" || falhar "$nome sem a seção '$secao'"
  done
  grep -q "${nome%%-*}" decisoes/README.md || falhar "$nome não está no índice decisoes/README.md"
done

for entrada in diario/[0-9]*.md; do
  [[ -e "$entrada" ]] || continue
  for secao in "## Hipótese" "## Descoberta" "## Próxima dúvida"; do
    grep -q "^$secao" "$entrada" || falhar "$(basename "$entrada") sem a seção '$secao'"
  done
done

if (( falhas > 0 )); then
  echo "$falhas falha(s)."
  exit 1
fi
echo "Estrutura OK."
