# P3 · Gestão da entrega

Regra: `.claude/rules/gestao.md`.

- **Quadro:** [GitHub Project](https://github.com/users/ccpnexatech/projects/1) vinculado ao repo (Todo → In progress → Review → Done, WIP 2). Ver ADR-0001.
- **Mover card:** `gestao/quadro.sh <issue> <status>`. O script registra a mudança em `quadro.csv`, porque a API não guarda o histórico de colunas.
- **Status reports semanais:** em `status/AAAA-MM-DD.md` ([2026-10-14](status/2026-10-14.md)).
- **Métricas de fluxo:** lead time por história em [`metricas.md`](metricas.md), geradas por `metricas.sh` a partir do Git e do GitHub.

| Item | Status |
|---|---|
| Quadro com colunas e issues HU-01 a HU-11 | feito |
| Status report 2026-10-14 | feito |
| Métricas (lead time pendente dos merges) | feito |
