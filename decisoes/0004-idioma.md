# ADR-0004 · Idioma: pt-BR principal, en auxiliar

- **Status:** aceita
- **Data:** 2026-10-14
- **Issue:** —

## Problema

O portfólio mira vagas no Brasil e no exterior. O domínio (FIDC, cedente, sacado, CVM 175) é brasileiro e perde precisão quando traduzido; o leitor estrangeiro precisa entender o trabalho sem saber português. É preciso escolher o idioma sem travar o fluxo de entrega.

## Opções

1. **pt-BR principal, en auxiliar traduzido ao fim de cada entrega** (recomendada). Fiel ao domínio e ao mercado-alvo principal; o inglês chega sem bloquear. Contra: o inglês fica defasado enquanto uma entrega está aberta.
2. **Tudo em inglês.** Alcança o público externo. Contra: termos regulatórios brasileiros ficam artificiais e o leitor brasileiro, que é o principal, perde.
3. **Bilíngue em paralelo em todo PR.** Os dois idiomas sempre em dia. Contra: dobra o custo de cada mudança e trava o fluxo.

## Decisão

Opção 1. pt-BR é o idioma principal; en é auxiliar, traduzido ao fim de cada entrega, sem bloquear o fluxo. Termos de domínio ficam em pt-BR no texto e em inglês no código, com glossário em `docs/glossario.md`.

O público-alvo é misto, com vagas no Brasil e no exterior.

## Consequências

- A documentação nasce em pt-BR; a tradução para en é uma tarefa no fim de cada entrega (P1, P2, P3), não um critério do PR.
- Código e payload em inglês camelCase; caminhos da API em pt-BR (`.claude/rules/api.md`).
- `docs/glossario.md` é a ponte entre os dois idiomas e precisa ser atualizado sempre que surgir um termo de domínio novo.
