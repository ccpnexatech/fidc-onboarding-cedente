# P3 · Gestão da entrega

Regra: `.claude/rules/gestao.md`.

- **Quadro:** [GitHub Project](https://github.com/users/ccpnexatech/projects/1) vinculado ao repo (Todo → In progress → Review → Done, WIP 2). Ver ADR-0001.
- **Card automático** ([ADR-0007](../decisoes/0007-automacao-do-fluxo.md)): o workflow `quadro` move o card sozinho.
  - branch `tipo/<nº>-descricao` criada → In progress;
  - PR com `Closes #N` → Review;
  - issue fechada → Done;
  - issue aberta → Todo.
  - Cada mudança vira um comentário na issue, e esse comentário é o histórico de colunas que a API não guarda.
- **Mover à mão** (exceção): `gestao/quadro.sh <issue> <status> [motivo]`, que também comenta na issue. O `quadro.csv` é o registro manual até 2026-10-15, mantido como histórico.
- **Status reports semanais:** em `status/AAAA-MM-DD.md`.
  - Toda segunda às 08:00, o workflow `semanal` roda `gestao/semanal.sh` e abre um PR com o status e a tabela de métricas.
  - Revisar o PR é a parte do Caio: os riscos que o script acha vêm dos dados, e os riscos de negócio entram à mão.
  - Sob demanda: `gh workflow run semanal` ou `bash gestao/semanal.sh [AAAA-MM-DD]`.
- **Métricas de fluxo:** lead time por história, em horas, em [`metricas.md`](metricas.md). A tabela é gerada por `metricas.sh` a partir do Git e do GitHub, só entre os marcadores do arquivo.

| Item | Status |
|---|---|
| Quadro com colunas e issues HU-01 a HU-11 | feito |
| Status reports 2026-10-14 e 2026-10-15 | feito |
| Métricas com lead time real (horas) | feito |
| Quadro automático, validação de PR, rotina semanal e Pages (ADR-0007, #30 a #33) | feito |
