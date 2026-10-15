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
  if grep -q '^- \*\*Status:\*\* proposta' "$adr"; then
    echo "AVISO: $nome em proposta: falta o raciocínio do Caio na seção Decisão"
    [[ -n "${GITHUB_ACTIONS:-}" ]] && echo "::warning file=$adr,title=ADR em proposta::Falta o raciocínio do Caio na seção Decisão (.claude/rules/adr.md)."
  fi
done

for entrada in diario/[0-9]*.md; do
  [[ -e "$entrada" ]] || continue
  for secao in "## Hipótese" "## Descoberta" "## Próxima dúvida"; do
    grep -q "^$secao" "$entrada" || falhar "$(basename "$entrada") sem a seção '$secao'"
  done
done

regras=docs/discovery/regras.md
historias=docs/discovery/historias.md
if [[ -f "$regras" && -f "$historias" ]]; then
  for regra in $(grep -oE '^## RN-[0-9]{2}' "$regras" | cut -c4-); do
    grep -qE "\| HU-[0-9]{2} .*${regra}" "$historias" || falhar "$regra não aparece em nenhuma história"
  done
  for historia in $(grep -oE '^## HU-[0-9]{2}' "$historias" | cut -c4-); do
    sed -n "/^## ${historia} /,/^## HU-/p" "$historias" | grep -q '```gherkin' || falhar "$historia sem critérios em Gherkin"
  done
fi

for link in $(grep -oE '\]\([0-9]{4}-[a-z0-9-]+\.md\)' decisoes/README.md | tr -d '()]'); do
  [[ -f "decisoes/$link" ]] || falhar "índice aponta para ADR inexistente: $link"
done

colecao=api/postman/fidc-remessa.postman_collection.json
if [[ -f "$colecao" ]]; then
  nomeados=$(grep -cE '^      "name": "HU-[0-9]{2} · ' "$colecao" || true)
  (( nomeados >= 15 )) || falhar "coleção Postman com menos de 15 casos nomeados HU-NN · ... ($nomeados)"
  for regra in $(grep -oE '^## RN-[0-9]{2}' "$regras" | cut -c4-); do
    grep -qE "\"name\": \"HU-[0-9]{2} · .*${regra}" "$colecao" || falhar "$regra sem caso na coleção Postman"
  done
fi

if (( falhas > 0 )); then
  echo "$falhas falha(s)."
  exit 1
fi
echo "Estrutura OK."
