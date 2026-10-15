# P2 · API de remessa de recebíveis

Regras: `.claude/rules/arquitetura.md`, `api.md`, `testes.md`.

Construído a partir de `docs/discovery/`. Stack: ADR-0002 (NestJS, TypeScript, Postgres opcional).

Pronto quando: Swagger no ar, coleção Postman verde no CI e SQL gerando o relatório de divergências.

| Item | Status |
|---|---|
| `openapi.yaml` (`POST /remessas`, `GET /remessas/{id}`, `GET /remessas/{id}/rejeicoes`, `Idempotency-Key`) | feito |
| Mock aplicando as regras do P1 (RN-01 a RN-10) | feito |
| Coleção Postman (29 casos) rodando via Newman no CI | feito |
| SQL de conciliação remessa × custódia | a fazer |
| Diagrama de sequência e "melhorias propostas" | a fazer |

## Como rodar

```bash
make setup   # instala as dependências da API
make api     # compila e sobe o mock em http://localhost:3000 (Swagger em /docs)
make check   # estrutura, ESLint, tipos, camadas, testes e lint do OpenAPI
```

Variáveis de ambiente:

| Variável | Padrão | Uso |
|---|---|---|
| `PORT` | `3000` | Porta HTTP. |
| `REFERENCE_DATE` | `2026-10-14` | Data de referência da cessão. Fixa por padrão para os testes serem reproduzíveis; `today` usa a data atual em São Paulo. |
| `FUND_NET_ASSET_VALUE` | `5000000000` | PL de referência em centavos (R$ 50 milhões). |
| `CDI_ANNUAL_RATE_BASIS_POINTS` | `1490` | CDI de referência (14,90% a.a.). |

## Arquitetura

```
src/
├── shared/        kernel: data de calendário, CNPJ/CPF, relógio, exceção de domínio; filtro problem+json e validação pelo contrato
├── eligibility/   regras RN-01 a RN-10, carteira simulada e calendário de dias úteis
│   ├── domain/            entidades, regras, avaliador, portas (repositórios) e use cases
│   └── infrastructure/    repositórios em memória, seed da carteira, feriados, parâmetros do fundo
└── batch/         remessa: envio, idempotência e consultas
    ├── domain/            entidade Batch, portas (repositórios, EligibilityGateway) e use cases
    └── infrastructure/    controller HTTP, repositórios em memória, adaptador para o módulo eligibility
```

- `domain/` não importa `infrastructure/`, framework nem o `domain` de outro módulo. O dependency-cruiser trava isso no `make check`.
- A composição fica só nos `*.module.ts`; o controller recebe os use cases prontos.
- O módulo `batch` fala com `eligibility` pela porta `EligibilityGateway` (`batch/domain/service`). O adaptador fica em `batch/infrastructure/service`.
- O corpo de `POST /remessas` é validado contra o schema `BatchRequest` do próprio `openapi.yaml` (Ajv), mais o dígito verificador de CNPJ e CPF. Mudar o payload exige mudar o contrato primeiro.
- Cada regra `RN-NN` é aplicada em um único ponto, marcado com `// RN-NN · <fonte>` (ADR-0003).

## Carteira simulada

A carteira inicial fica em `src/eligibility/infrastructure/seed/portfolio-seed.json`. Ela é gerada por `scripts/generate-portfolio-seed.py`, que usa o mesmo calendário de dias úteis do mock. Na data de referência 2026-10-14:

| Item | Valor | Usado em |
|---|---|---|
| Carteira a vencer | R$ 35.000.000,00, prazo médio de cerca de 74 dias úteis | RN-03 (HU-08) |
| Cedente `12345678000195` (Alfa) | ativo, R$ 300.000,00 na carteira, título `DM-2026-0001` | cedente padrão dos testes; RN-09 (HU-07) |
| Cedente `11222333000181` (Beta) | ativo, R$ 3.700.000,00 na carteira | RN-08 (HU-06) |
| Cedente `98765432000198` (Gama) | suspenso | RN-10 (HU-01) |
| Cedente `77888999000181` (Delta) | em análise | RN-10 |
| Sacado `55666777000181` e filial `55666777000262` | R$ 1.950.000,00 no grupo | RN-07 (HU-06) |
| Sacado `44555666000181` | R$ 1.000.000,00 | RN-07 (HU-06) |
| Sacado `22333444000181` | título vencido há 10 dias | RN-05 (HU-04) |
| Sacado `33444555000181` | título vencido há 20 dias | RN-05 (HU-04) |

Os títulos aceitos entram na carteira em memória. Remessas seguintes, no mesmo processo, enxergam a nova exposição. Reiniciar o mock volta à carteira inicial.

## Testes

- **Unit** (`src/**/*.spec.ts`): use cases e regras isolados, com as portas mockadas; um teste por cenário Gherkin.
- **Integration** (`test/*.spec.ts`): a aplicação Nest inteira, com repositórios em memória e sem mocks, via HTTP (supertest).
