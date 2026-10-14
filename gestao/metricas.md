# Métricas de fluxo (P1 e P2)

Regra: `.claude/rules/gestao.md`. Os números vêm do Git e do GitHub, gerados por `gestao/metricas.sh`. Nenhum número é estimativa.

```bash
bash gestao/metricas.sh   # regenera a tabela abaixo; rodar de novo depois dos merges
```

## Lead time por item (gerado em 2026-10-14, antes dos merges)

| Issue | Título | PR | Início (1º commit) | PR aberto | Merge | Início → PR (dias) | Lead time (dias) |
|---|---|---|---|---|---|---|---|
| #6 | P1 · Discovery: AS-IS, regras, histórias e backlog | #18 | 2026-10-14T20:45 | 2026-10-14T20:46 | — | 0,0 | pendente |
| #19 | P2 · Contrato OpenAPI da API de remessa | #22 | 2026-10-14T20:49 | 2026-10-14T20:49 | — | 0,0 | pendente |
| #7 | HU-01 · Enviar remessa pela API | #23 | 2026-10-14T21:01 | 2026-10-14T21:01 | — | 0,0 | pendente |
| #8 | HU-02 · Reenviar sem duplicar a cessão | #23 | 2026-10-14T21:01 | 2026-10-14T21:01 | — | 0,0 | pendente |
| #16 | HU-10 · Consultar a remessa | #23 | 2026-10-14T21:01 | 2026-10-14T21:01 | — | 0,0 | pendente |
| #9 | HU-03 · Barrar título inválido na origem | #24 | 2026-10-14T21:04 | 2026-10-14T21:04 | — | 0,0 | pendente |
| #10 | HU-04 · Barrar sacado inadimplente | #24 | 2026-10-14T21:04 | 2026-10-14T21:04 | — | 0,0 | pendente |
| #11 | HU-05 · Garantir a taxa mínima | #24 | 2026-10-14T21:04 | 2026-10-14T21:04 | — | 0,0 | pendente |
| #13 | HU-07 · Impedir cessão em duplicidade | #24 | 2026-10-14T21:04 | 2026-10-14T21:04 | — | 0,0 | pendente |
| #15 | HU-09 · Consultar as rejeições | #24 | 2026-10-14T21:04 | 2026-10-14T21:04 | — | 0,0 | pendente |
| #12 | HU-06 · Respeitar os limites de concentração | #25 | 2026-10-14T21:07 | 2026-10-14T21:07 | — | 0,0 | pendente |
| #14 | HU-08 · Manter o prazo médio da carteira | #25 | 2026-10-14T21:07 | 2026-10-14T21:07 | — | 0,0 | pendente |
| #20 | P2 · Homologação: coleção Postman e Newman no CI | #26 | 2026-10-14T21:10 | 2026-10-14T21:10 | — | 0,0 | pendente |
| #17 | HU-11 · Conciliar remessa e custódia | #27 | 2026-10-14T21:13 | 2026-10-14T21:13 | — | 0,0 | pendente |
| #21 | P3 · Gestão: status report, métricas de fluxo e tradução en | este PR | — | — | — | — | — |

Horários em UTC.

## Leitura

- **Throughput:** 14 itens (11 histórias e 3 tarefas) chegaram a Review em uma sessão, em 7 PRs empilhados (#18, #22 a #27).
- **Lead time:** pendente. Todos os PRs estão esperando revisão e merge do Caio. O tempo em Review vai dominar o lead time, porque a construção levou minutos e a revisão ainda não começou. Isso é o esperado em um fluxo com uma pessoa só revisando, e é o principal gargalo a observar.
- **Lote grande:** o PR #24 fechou 5 issues de uma vez. Lote grande acelera a construção, mas atrasa a revisão e esconde o lead time individual. Nas próximas entregas, o ideal é um PR por história.
- **WIP:** o limite de 2 em In progress foi respeitado na maior parte do tempo. A exceção foi o PR #24: as 5 histórias foram feitas juntas, mas só #9 e #15 estiveram marcadas em In progress.

## Limitação do dado (e a correção)

A regra define lead time como **merge − entrada em In progress**. A API do GitHub Projects não guarda o histórico de colunas: a linha do tempo da issue não traz mudança de status de um Project v2 movido por API. Testei em 2026-10-14 e a consulta voltou vazia.

- **Até aqui:** a entrada em In progress foi aproximada pelo **primeiro commit do PR**. Como cada PR foi construído e commitado de uma vez, o primeiro commit coincide com a abertura do PR. Por isso a coluna "Início → PR" dá 0,0, mesmo havendo trabalho antes do commit. O número subestima o tempo de construção.
- **Daqui em diante:** cards movidos com `gestao/quadro.sh <issue> <status>` ficam registrados em `gestao/quadro.csv` (instante, issue, status). Esse log é a fonte da entrada em In progress, e o `metricas.sh` pode passar a lê-lo.
