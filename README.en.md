# fidc-onboarding-cedente

[![check](https://github.com/ccpnexatech/fidc-onboarding-cedente/actions/workflows/check.yml/badge.svg)](https://github.com/ccpnexatech/fidc-onboarding-cedente/actions/workflows/check.yml)
[![pages](https://github.com/ccpnexatech/fidc-onboarding-cedente/actions/workflows/pages.yml/badge.svg)](https://ccpnexatech.github.io/fidc-onboarding-cedente/)

Digital onboarding of receivables batches into a simulated Brazilian credit-receivables fund (FIDC): from requirements discovery to a certified API reconciled against the custodian.

**Docs:** [ccpnexatech.github.io/fidc-onboarding-cedente](https://ccpnexatech.github.io/fidc-onboarding-cedente/) · **API reference:** [site/api.html](https://ccpnexatech.github.io/fidc-onboarding-cedente/site/api.html) · **Board:** [GitHub Project](https://github.com/users/ccpnexatech/projects/1) · [Português](README.md)

> Portfolio project with a fictional scenario. No real originator, debtor or fund data is used. Public fund regulations are cited only as sources for the rules. Portuguese is the primary language ([ADR-0004](decisoes/0004-idioma.md)); this file is the English companion.

## Context

In a FIDC, an originator (*cedente*) sells receivables to the fund, and the fund manager checks each receivable's eligibility before the assignment. The reference process (AS-IS) is manual:
- the portfolio arrives as a spreadsheet by email;
- eligibility is checked by hand;
- rejections go back as free text;
- reconciliation with the custodian happens days later.

The result is concentration breaches found too late, receivables assigned twice, and rework between operations and IT.

This project replaces that flow with a batch API whose eligibility rules are explicit and traceable to the regulation, and documents every step of the business analysis work.

## Results

| Deliverable | Content | Location |
|---|---|---|
| **Discovery** | AS-IS with 9 failure points. 10 eligibility rules traced to CVM Resolution 175 and real fund regulations. 11 user stories with Gherkin acceptance criteria. RICE and MoSCoW backlog. | [`docs/discovery/`](docs/discovery/README.md), [rules in English](docs/en/business-rules.md) |
| **Contract** | OpenAPI 3.0 with 3 endpoints, `Idempotency-Key` idempotency and `application/problem+json` errors. | [`api/openapi.yaml`](api/openapi.yaml) |
| **Mock** | NestJS API that applies the 10 rules and validates every request against the contract itself. | [`api/`](api/README.md) |
| **Certification** | Postman collection with 29 cases and 63 assertions, run by Newman in CI. | [`api/postman/`](api/postman/README.md) |
| **Reconciliation** | Batch × custody SQL. Detects missing receivables, amount mismatches, duplicates and custody positions with no batch. | [`api/sql/`](api/sql/README.md) |
| **Delivery** | Board that moves on its own and weekly status report generated from the board and Git. | [`gestao/`](gestao/README.md) |
| **Decisions** | 7 ADRs with problem, options, decision and consequences. | [`decisoes/`](decisoes/README.md) |

## Traceability

Every rule is traceable from source to test:

```
source (CVM 175, fund regulation) → RN-NN → HU-NN (issue) → openapi.yaml
  → code (// RN-NN · source) → unit and integration tests → Postman case (HU-NN · RN-NN)
```

`make check` fails when:
- a rule is not covered by any story or certification case;
- a story has no Gherkin;
- the ADR index points to a missing file.

## API

| Method | Path | Description | Stories |
|---|---|---|---|
| `POST` | `/remessas` | Receives a batch and assesses each receivable. A retry with the same key returns the original response; a different body with the same key returns `409`. | HU-01, HU-02 |
| `GET` | `/remessas/{id}` | Returns the batch with accepted and rejected totals. | HU-10 |
| `GET` | `/remessas/{id}/rejeicoes` | Lists rejected receivables with the violated rule's code (for example `RN-02_RECEIVABLE_OVERDUE`). | HU-09 |

A rejected receivable does not fail the batch. Only an originator that is not enabled (RN-10) rejects the whole batch, with `422`. Paths are in Portuguese, the client's vocabulary; payload fields are in English.

## Stack

| Layer | Technology |
|---|---|
| API | Node.js 22+ (CI on Node.js 24), NestJS 11, TypeScript 5.9 |
| Validation | Ajv, against the `openapi.yaml` schema |
| Persistence | In memory (default) or PostgreSQL 16 |
| Tests | Jest, Supertest, Postman and Newman |
| Quality | ESLint, dependency-cruiser (layers), Redocly (contract lint), mermaid-cli (diagrams) |
| Docs | Docsify and Redoc, published on GitHub Pages |
| Automation | GitHub Actions and GitHub Projects |

## Running locally

Requirements: Node.js 22 or later, Docker with Compose, Python 3 and `make`.

```bash
make setup        # install dependencies and start PostgreSQL with the schema applied
make api          # mock at http://localhost:3000, Swagger UI at http://localhost:3000/docs
make newman       # run the certification collection against the mock
make conciliacao  # run the reconciliation SQL and compare it with the expected result
make check        # structure, traceability, lint, types, layers, tests and OpenAPI lint
make diagramas    # render the Mermaid diagrams
make docs         # documentation at http://localhost:8000/site/
```

To persist batches in PostgreSQL instead of memory:

```bash
BATCH_REPOSITORY=postgres DATABASE_URL=postgresql://fidc:fidc@localhost:55432/fidc make api
```

## Quality and automation

| Workflow | Trigger | Purpose |
|---|---|---|
| `check` | PR and push to `main` | Structure and traceability, automation tests, ESLint, types, layers, 73 tests (including PostgreSQL), reconciliation SQL, diagram rendering and Newman certification. |
| `pr` | PR | Conventional Commits in title and commits. Required PR sections and a linked issue. |
| `quadro` | Branch, PR and issue | Moves the board card and records the change on the issue for lead time. |
| `semanal` | Mondays, 08:00 (Brasília) | Generates the status report and metrics and opens a PR for review. |
| `pages` | Push to `main` | Publishes the docs and the API reference. |

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

The full glossary is in [`docs/glossario.md`](docs/glossario.md).

## Assumptions and limitations

- The fund is simulated: reference net asset value of BRL 50 million, CDI at 14.90% p.a., reference date 2026-10-14.
- Assumptions about fund operations are listed in [`premissas.md`](premissas.md), each with a validation method. Six are pending validation with FIDC practitioners.
- What the mock simplifies compared with production (concurrency, authentication, economic group, receivables registry) is listed in [`api/README.md`](api/README.md#melhorias-propostas).
