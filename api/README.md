# P2 · API de remessa de recebíveis

Regras: `.claude/rules/arquitetura.md`, `api.md`, `testes.md`.

Construído a partir de `docs/discovery/`. Stack: ADR-0002 (NestJS, TypeScript, Postgres opcional).

Pronto quando: Swagger público no ar, coleção Postman verde no CI e SQL gerando o relatório de divergências.

| Item | Status |
|---|---|
| `openapi.yaml` (`POST /remessas`, `GET /remessas/{id}`, `GET /remessas/{id}/rejeicoes`, `Idempotency-Key`) | feito |
| Mock aplicando as regras do P1 | a fazer |
| Coleção Postman (15+ casos) rodando via Newman no CI | a fazer |
| SQL de conciliação remessa × custódia | a fazer |
| Diagrama de sequência e "melhorias propostas" | a fazer |
