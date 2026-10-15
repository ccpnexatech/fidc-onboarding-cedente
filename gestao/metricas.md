# Métricas de fluxo (P1 e P2)

Regra: `.claude/rules/gestao.md`. Os números vêm do Git e do GitHub, gerados por `gestao/metricas.sh`. Nenhum número é estimativa.

```bash
bash gestao/metricas.sh   # regenera a tabela abaixo
```

## Lead time por item (gerado em 2026-10-15, depois dos merges)

| Issue | Título | PR | Início (1º commit) | PR aberto | Merge | Início → PR (dias) | Lead time (dias) |
|---|---|---|---|---|---|---|---|
| #6 | P1 · Discovery: AS-IS, regras, histórias e backlog | #18 | 2026-10-14T20:45 | 2026-10-14T20:46 | 2026-10-15T14:03 | 0,0 | 0,7 |
| #7 | HU-01 · Enviar remessa pela API | #23 | 2026-10-14T21:01 | 2026-10-14T21:01 | 2026-10-15T14:03 | 0,0 | 0,7 |
| #8 | HU-02 · Reenviar sem duplicar a cessão | #23 | 2026-10-14T21:01 | 2026-10-14T21:01 | 2026-10-15T14:03 | 0,0 | 0,7 |
| #9 | HU-03 · Barrar título inválido na origem | #24 | 2026-10-14T21:04 | 2026-10-14T21:04 | 2026-10-15T14:03 | 0,0 | 0,7 |
| #10 | HU-04 · Barrar sacado inadimplente | #24 | 2026-10-14T21:04 | 2026-10-14T21:04 | 2026-10-15T14:03 | 0,0 | 0,7 |
| #11 | HU-05 · Garantir a taxa mínima | #24 | 2026-10-14T21:04 | 2026-10-14T21:04 | 2026-10-15T14:03 | 0,0 | 0,7 |
| #12 | HU-06 · Respeitar os limites de concentração | #25 | 2026-10-14T21:07 | 2026-10-14T21:07 | 2026-10-15T14:03 | 0,0 | 0,7 |
| #13 | HU-07 · Impedir cessão em duplicidade | #24 | 2026-10-14T21:04 | 2026-10-14T21:04 | 2026-10-15T14:03 | 0,0 | 0,7 |
| #14 | HU-08 · Manter o prazo médio da carteira | #25 | 2026-10-14T21:07 | 2026-10-14T21:07 | 2026-10-15T14:03 | 0,0 | 0,7 |
| #15 | HU-09 · Consultar as rejeições | #24 | 2026-10-14T21:04 | 2026-10-14T21:04 | 2026-10-15T14:03 | 0,0 | 0,7 |
| #16 | HU-10 · Consultar a remessa | #23 | 2026-10-14T21:01 | 2026-10-14T21:01 | 2026-10-15T14:03 | 0,0 | 0,7 |
| #17 | HU-11 · Conciliar remessa e custódia | #27 | 2026-10-14T21:13 | 2026-10-14T21:13 | 2026-10-15T14:04 | 0,0 | 0,7 |
| #19 | P2 · Contrato OpenAPI da API de remessa | #22 | 2026-10-14T20:49 | 2026-10-14T20:49 | 2026-10-15T14:03 | 0,0 | 0,7 |
| #20 | P2 · Homologação: coleção Postman e Newman no CI | #26 | 2026-10-14T21:10 | 2026-10-14T21:10 | 2026-10-15T14:04 | 0,0 | 0,7 |
| #21 | P3 · Gestão: status report, métricas de fluxo e tradução en | #28 | 2026-10-14T21:20 | 2026-10-14T21:20 | 2026-10-15T14:04 | 0,0 | 0,7 |

Horários em UTC.

## Leitura

- **Throughput:** 15 itens (11 histórias e 4 tarefas) entregues em 8 PRs de código e documentação (#18, #22 a #28), mais 3 PRs de ADR (#3 a #5).
- **Lead time:** 0,7 dia (cerca de 17 horas) para todos os itens. A construção levou minutos por PR, e quase todo o tempo foi espera em Review. Os 11 PRs foram mergeados em sequência em 2026-10-15, entre 14:03 e 14:04 UTC. Por isso o lead time é igual em todos os itens: ele mede a espera pela revisão da pilha inteira, não o fluxo de cada história.
- **Gargalo:** a revisão. Com uma pessoa só revisando e PRs empilhados, nenhum item chega a Done antes do último da pilha. PRs independentes, abertos direto contra a `main`, deixariam cada história fechar no seu tempo.
- **Lote grande:** o PR #24 fechou 5 issues de uma vez. Lote grande acelera a construção, mas atrasa a revisão e esconde o lead time individual. Nas próximas entregas, o ideal é um PR por história.
- **WIP:** o limite de 2 em In progress foi respeitado na maior parte do tempo. A exceção foi o PR #24: as 5 histórias foram feitas juntas, mas só #9 e #15 estiveram marcadas em In progress.

## Limitação do dado (e a correção)

A regra define lead time como **merge − entrada em In progress**. A API do GitHub Projects não guarda o histórico de colunas: a linha do tempo da issue não traz mudança de status de um Project v2 movido por API. Testei em 2026-10-14 e a consulta voltou vazia.

- **Até aqui:** a entrada em In progress foi aproximada pelo **primeiro commit do PR**. Como cada PR foi construído e commitado de uma vez, o primeiro commit coincide com a abertura do PR. Por isso a coluna "Início → PR" dá 0,0, mesmo havendo trabalho antes do commit. O número subestima o tempo de construção.
- **Daqui em diante** ([ADR-0007](../decisoes/0007-automacao-do-fluxo.md)): cada mudança de coluna vira um comentário na issue, feito pelo workflow `quadro` ou pelo `quadro.sh`. O `metricas.sh` lê o início do lead time nesta ordem:
  1. o comentário na issue;
  2. a linha em `gestao/quadro.csv`, o registro manual até 2026-10-15;
  3. o primeiro commit do PR, só como último recurso.
  - A coluna "Fonte do início" diz qual das três foi usada.
