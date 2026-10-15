# Gestão da entrega

Acompanhamento do fluxo de trabalho: quadro, métricas e status reports. Os números vêm do quadro e do Git, nunca de estimativa. Convenções em [`.claude/rules/gestao.md`](../.claude/rules/gestao.md).

## Quadro

[GitHub Project](https://github.com/users/ccpnexatech/projects/1) vinculado ao repositório, com colunas Todo → In progress → Review → Done e WIP de 2 itens ([ADR-0001](../decisoes/0001-quadro-github-projects.md)).

O workflow `quadro` move os cards automaticamente ([ADR-0007](../decisoes/0007-automacao-do-fluxo.md)):

| Evento | Coluna |
|---|---|
| Issue aberta ou reaberta | Todo |
| Branch `tipo/<nº>-descricao` criada | In progress |
| PR aberto com `Closes #N` | Review |
| Issue fechada | Done |

Cada mudança gera um comentário na issue. Esse comentário é o histórico de colunas, que a API do GitHub Projects não armazena, e serve de base para o lead time. Passar de 2 itens em In progress gera um aviso.

Para mover um card manualmente: `gestao/quadro.sh <issue> <coluna> [motivo]`. O registro também vai para a issue. O arquivo `quadro.csv` guarda os movimentos manuais feitos até 2026-10-15.

## Métricas de fluxo

[`metricas.md`](metricas.md) traz o lead time por item, em horas, gerado por `metricas.sh`. O início é a entrada em In progress, lido nesta ordem de preferência:
1. comentário do quadro;
2. `quadro.csv`;
3. primeiro commit do PR.

O fim é o merge.

## Status reports

Um por semana, em [`status/`](status/), com três seções: Feito, Riscos (com dono e ação) e Próximo.

- Toda segunda-feira às 08:00 (Brasília), o workflow `semanal` executa `semanal.sh` e abre um PR com o relatório e a tabela de métricas atualizada.
- Os riscos gerados vêm dos dados:
  - CI vermelho;
  - WIP acima do limite;
  - PR parado há mais de 3 dias;
  - ADR em `proposta`;
  - premissa a validar.
- Riscos de negócio são acrescentados na revisão do PR.
- Execução sob demanda: `gh workflow run semanal` ou `bash gestao/semanal.sh [AAAA-MM-DD]`.

## Scripts

| Script | Função |
|---|---|
| `quadro.sh` | Move um card e registra a mudança na issue. |
| `quadro-evento.sh` | Converte eventos do GitHub Actions em movimentos do quadro. |
| `metricas.sh` | Gera a tabela de lead time. |
| `status.sh` / `status.py` | Coletam os dados da semana e montam o status report. |
| `semanal.sh` | Gera o status, atualiza a tabela de métricas e o menu do site. |
