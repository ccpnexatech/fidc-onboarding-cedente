# ADR-0001 · Quadro de entrega no GitHub Projects em vez de Jira

- **Status:** aceita
- **Data:** 2026-10-14
- **Issue:** —

## Problema

O P3 precisa de um quadro real, com histórico, WIP e lead time, para provar acompanhamento de entregas. O plano inicial previa Jira; o fluxo do repositório usa issues e PRs do GitHub. Dois quadros dariam retrabalho, e um quadro separado do código enfraquece a rastreabilidade história → PR → merge.

## Opções

1. **GitHub Projects** (recomendada). Público, vinculado às issues e aos PRs, automatizável pelo `gh`. Contra: não prova Jira diretamente; a vaga aceita "Jira ou similares".
2. **Jira.** Atende ao pé da letra. Contra: quadro público limitado no plano gratuito, separado do repo, fora do alcance da automação do projeto.
3. **Os dois.** GitHub no dia a dia, épicos espelhados no Jira. Contra: manter dois quadros.

## Decisão

GitHub Projects.

Escolhi o GitHub Projects para centralizar a ferramenta de trabalho no GitHub. Também pesaram o custo zero, o escopo pequeno do projeto e a facilidade de uso.

O que aceito perder: a prova direta de Jira. Jira é mais uma ferramenta de controle; sei me adaptar a qualquer ferramenta e não vejo isso como impedimento.

## Consequências

- O fluxo de trabalho do CLAUDE.md (issue → branch → PR → card) vale sem adaptação.
- WIP 2 e as colunas Todo → In progress → Review → Done são configuradas no Project.
- Para o Q6 do PDI, a prova de Jira fica para outro momento (por exemplo, a certificação ou um quadro espelho pontual), se for necessária.
