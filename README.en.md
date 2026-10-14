# fidc-onboarding-cedente

Digital onboarding of receivables originators (*cedentes*) into a simulated Brazilian credit-receivables fund (FIDC), from discovery to a certified API.

This repository documents end-to-end **business analysis** work:
1. frame the problem;
2. turn fund rules into testable user stories;
3. write the API contract;
4. certify the integration;
5. reconcile the data.

Every relevant decision is recorded in `decisoes/` (ADRs).

> Fictional scenario inspired by how FIDC managers operate. No real originator, debtor or fund data is used. Public fund regulations (in `docs/fontes/`) are cited only as sources; this project is not any manager's system.

Portuguese is the primary language (ADR-0004); this file is the English companion. Domain terms stay in Portuguese in the docs and in English in the code; see the glossary below.

## The problem

Today (simulated AS-IS):
1. the originator emails a spreadsheet with its receivables;
2. the fund manager checks eligibility by hand and emails the rejections back as free text;
3. only later is the batch reconciled against the custodian.

The outcome is rework, concentration limits found too late, receivables assigned twice, and reconciliation done with spreadsheet lookups.

## Deliverables

| Phase | Deliverable | Folder | Status |
|---|---|---|---|
| P1 | Discovery: AS-IS, eligibility rules, user stories in Gherkin, RICE/MoSCoW backlog | `docs/discovery/` | done |
| P2 | Batch API (OpenAPI), NestJS mock, Postman/Newman certification in CI, reconciliation SQL | `api/` | done |
| P3 | Delivery board (GitHub Projects), status report, flow metrics | `gestao/` | done |

## In five minutes

1. **AS-IS and failure points:** `docs/discovery/as-is.md`.
2. **Business rules and their sources:** [`docs/en/business-rules.md`](docs/en/business-rules.md). There are 10 rules, each traced to CVM Resolution 175 or to a real fund regulation, with the stable rejection code the API returns.
3. **Why those sources:**
   - ADR-0005: the regulator's rule is the floor and the fund's regulation can only tighten it;
   - ADR-0006: the BMA fund regulation is the base, with rules from Solis funds added on top.
4. **Contract:** `api/openapi.yaml` (Swagger UI at `/docs` via `make api`).
5. **Evidence:** 29 Postman certification cases (`api/postman/`) and 73 automated tests in CI.
6. **Reconciliation:** `api/sql/` reports receivables missing in custody, amount mismatches, duplicates and custody positions with no accepted batch.
7. **Delivery management:** GitHub Project board, status report and flow metrics in `gestao/`.

## Traceability

```
source (CVM 175 / fund regulation) → RN-NN (rule) → HU-NN (story, issue) → contract (openapi.yaml)
  → code (// RN-NN · source) → unit and integration tests → Postman case (HU-NN · RN-NN · case)
```

`make check` fails when:
- a rule is not covered by any story or certification case;
- a story has no Gherkin;
- the ADR index points to a missing file.

## Glossary

| Portuguese | Code | Meaning |
|---|---|---|
| FIDC | `fund` | Brazilian receivables investment fund. |
| Cedente | `assignor` | Company that sells (assigns) its receivables to the fund. |
| Sacado | `debtor` | Who pays the receivable (the originator's customer). |
| Remessa | `batch` | Batch of receivables sent for analysis and assignment. |
| Cessão | `assignment` | Transfer of the receivable to the fund. |
| Duplicata | `TRADE_BILL` / `SERVICE_BILL` | Brazilian trade bill, issued from an invoice (NF-e). |
| PL | `netAssetValue` | Fund net asset value, the base for concentration limits. |
| Custódia | `custodian` | Entity that holds and controls the fund's receivables. |
| Conciliação | `reconciliation` | Matching accepted receivables against the custodian's position. |

## Commands

```bash
make setup        # install dependencies and start Postgres (docker compose)
make check        # structure, traceability, ESLint, types, layers, tests and OpenAPI lint
make api          # start the mock at http://localhost:3000 (Swagger at /docs)
make newman       # Postman certification run against the mock
make conciliacao  # reconciliation SQL against Postgres
make docs         # documentation site at http://localhost:8000/site/
```
