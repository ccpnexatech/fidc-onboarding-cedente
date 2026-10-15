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
- **Status reports semanais:** em `status/AAAA-MM-DD.md` ([2026-10-14](status/2026-10-14.md)).
- **Métricas de fluxo:** lead time por história em [`metricas.md`](metricas.md), geradas por `metricas.sh` a partir do Git e do GitHub.

| Item | Status |
|---|---|
| Quadro com colunas e issues HU-01 a HU-11 | feito |
| Status report 2026-10-14 | feito |
| Métricas (lead time pendente dos merges) | feito |
