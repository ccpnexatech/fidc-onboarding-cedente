# Métricas de fluxo

Lead time por história e tarefa, calculado a partir do quadro, do Git e do GitHub por `gestao/metricas.sh`. Nenhum número é estimado. Convenções em [`.claude/rules/gestao.md`](../.claude/rules/gestao.md).

```bash
bash gestao/metricas.sh   # regenera a tabela abaixo
```

## Lead time por item

<!-- metricas:inicio -->
_Gerado em 2026-10-15 por `gestao/metricas.sh`._

| Issue | Título | PR | Início | Fonte do início | PR aberto | Merge | Início → PR (h) | Lead time (h) |
|---|---|---|---|---|---|---|---|---|
| #6 | P1 · Discovery: AS-IS, regras, histórias e backlog | #18 | 2026-10-14T20:45 | 1º commit | 2026-10-14T20:46 | 2026-10-15T14:03 | 0,0 | 17,3 |
| #7 | HU-01 · Enviar remessa pela API | #23 | 2026-10-14T21:01 | 1º commit | 2026-10-14T21:01 | 2026-10-15T14:03 | 0,0 | 17,0 |
| #8 | HU-02 · Reenviar sem duplicar a cessão | #23 | 2026-10-14T21:01 | 1º commit | 2026-10-14T21:01 | 2026-10-15T14:03 | 0,0 | 17,0 |
| #9 | HU-03 · Barrar título inválido na origem | #24 | 2026-10-14T21:04 | 1º commit | 2026-10-14T21:04 | 2026-10-15T14:03 | 0,0 | 17,0 |
| #10 | HU-04 · Barrar sacado inadimplente | #24 | 2026-10-14T21:04 | 1º commit | 2026-10-14T21:04 | 2026-10-15T14:03 | 0,0 | 17,0 |
| #11 | HU-05 · Garantir a taxa mínima | #24 | 2026-10-14T21:04 | 1º commit | 2026-10-14T21:04 | 2026-10-15T14:03 | 0,0 | 17,0 |
| #12 | HU-06 · Respeitar os limites de concentração | #25 | 2026-10-14T21:07 | 1º commit | 2026-10-14T21:07 | 2026-10-15T14:03 | 0,0 | 16,9 |
| #13 | HU-07 · Impedir cessão em duplicidade | #24 | 2026-10-14T21:04 | 1º commit | 2026-10-14T21:04 | 2026-10-15T14:03 | 0,0 | 17,0 |
| #14 | HU-08 · Manter o prazo médio da carteira | #25 | 2026-10-14T21:07 | 1º commit | 2026-10-14T21:07 | 2026-10-15T14:03 | 0,0 | 16,9 |
| #15 | HU-09 · Consultar as rejeições | #24 | 2026-10-14T21:04 | 1º commit | 2026-10-14T21:04 | 2026-10-15T14:03 | 0,0 | 17,0 |
| #16 | HU-10 · Consultar a remessa | #23 | 2026-10-14T21:01 | 1º commit | 2026-10-14T21:01 | 2026-10-15T14:03 | 0,0 | 17,0 |
| #17 | HU-11 · Conciliar remessa e custódia | #27 | 2026-10-14T21:13 | 1º commit | 2026-10-14T21:13 | 2026-10-15T14:04 | 0,0 | 16,8 |
| #19 | P2 · Contrato OpenAPI da API de remessa | #22 | 2026-10-14T20:49 | 1º commit | 2026-10-14T20:49 | 2026-10-15T14:03 | 0,0 | 17,2 |
| #20 | P2 · Homologação: coleção Postman e Newman no CI | #26 | 2026-10-14T21:10 | 1º commit | 2026-10-14T21:10 | 2026-10-15T14:04 | 0,0 | 16,9 |
| #21 | P3 · Gestão: status report, métricas de fluxo e tradução en | #28 | 2026-10-14T21:20 | 1º commit | 2026-10-14T21:20 | 2026-10-15T14:04 | 0,0 | 16,7 |
| #30 | P3 · Quadro automático: card segue branch, PR e merge | #34 | 2026-10-15T17:38 | quadro.csv | 2026-10-15T17:41 | 2026-10-15T17:45 | 0,1 | 0,1 |
| #31 | P3 · CI valida PR, commits e ADRs pendentes | #35 | 2026-10-15T17:46 | comentário | 2026-10-15T17:48 | 2026-10-15T17:52 | 0,0 | 0,1 |
| #32 | P3 · Status report e métricas semanais automáticos | #36 | 2026-10-15T17:52 | comentário | 2026-10-15T17:56 | 2026-10-15T18:00 | 0,1 | 0,1 |
| #33 | P3 · Publicar site e referência da API no GitHub Pages | — | — | — | — | — | — | — |
| #38 | Quadro falha em PR sem issue ligada | #39 | 2026-10-15T18:06 | comentário | 2026-10-15T18:07 | 2026-10-15T18:11 | 0,0 | 0,1 |
<!-- metricas:fim -->

Horários em UTC.

## Leitura

- **Throughput:** 15 itens (11 histórias e 4 tarefas) entregues em 8 PRs de código e documentação (#18, #22 a #28), além de 3 PRs de ADR (#3 a #5).
- **Lead time de P1 e P2:** cerca de 17 horas, igual para todos os itens. A construção levou minutos por PR; o restante foi espera em Review.
  - Os 11 PRs empilhados foram mergeados em sequência em 2026-10-15, entre 14:03 e 14:04 UTC.
  - Por isso o número mede a espera pela revisão da pilha inteira, não o fluxo de cada história.
- **Gargalo:** revisão. Com um único revisor e PRs empilhados, nenhum item chega a Done antes do último da pilha. PRs independentes, abertos contra a `main`, permitem que cada história feche no seu tempo. Esse padrão foi adotado a partir de #30, com lead time abaixo de 1 hora.
- **Tamanho do lote:** o PR #24 fechou 5 issues de uma vez. Lote grande acelera a construção, mas atrasa a revisão e oculta o lead time individual. Padrão adotado: um PR por história.
- **WIP:** o limite de 2 itens em In progress foi respeitado, exceto no PR #24. As 5 histórias foram desenvolvidas juntas, mas só #9 e #15 estavam marcadas em In progress.
- **Unidade:** horas desde 2026-10-15. Em dias com uma casa decimal, itens de poucos minutos apareciam como zero.

## Fonte do início do lead time

A regra define lead time como **merge − entrada em In progress**. A API do GitHub Projects não guarda o histórico de colunas: a linha do tempo da issue não registra mudança de status de um Project v2 feita por API (verificado em 2026-10-14).

- **Até 2026-10-15 (P1 e P2):** a entrada em In progress é aproximada pelo **primeiro commit do PR**. Como cada PR foi commitado de uma vez, o primeiro commit coincide com a abertura do PR.
  - Por isso a coluna "Início → PR" fica próxima de zero.
  - O número subestima o tempo de construção.
- **A partir de 2026-10-15** ([ADR-0007](../decisoes/0007-automacao-do-fluxo.md)): cada mudança de coluna gera um comentário na issue, feito pelo workflow `quadro` ou pelo `quadro.sh`. O `metricas.sh` lê o início nesta ordem:
  1. comentário na issue;
  2. linha em `gestao/quadro.csv`;
  3. primeiro commit do PR, como último recurso.
  - A coluna "Fonte do início" indica qual foi usada.
