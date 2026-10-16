# fidc-onboarding-cedente

**Novo por aqui? [Leia em 2 minutos](RESUMO.md):** o problema, o que foi feito e as decisões de negócio, sem jargão.

[![check](https://github.com/ccpnexatech/fidc-onboarding-cedente/actions/workflows/check.yml/badge.svg)](https://github.com/ccpnexatech/fidc-onboarding-cedente/actions/workflows/check.yml)
[![pages](https://github.com/ccpnexatech/fidc-onboarding-cedente/actions/workflows/pages.yml/badge.svg)](https://ccpnexatech.github.io/fidc-onboarding-cedente/)

Onboarding digital de remessas de recebíveis em um FIDC simulado: do levantamento de requisitos à API homologada e conciliada com a custódia.

**Documentação:** [ccpnexatech.github.io/fidc-onboarding-cedente](https://ccpnexatech.github.io/fidc-onboarding-cedente/) · **Referência da API:** [site/api.html](https://ccpnexatech.github.io/fidc-onboarding-cedente/site/api.html) · **Quadro:** [GitHub Project](https://github.com/users/ccpnexatech/projects/1) · [English](README.en.md)

> Projeto de portfólio com cenário fictício. Nenhum dado real de cedente, sacado ou fundo é utilizado. Regulamentos públicos são citados apenas como fonte das regras.

## Contexto

Em um FIDC, o cedente vende recebíveis ao fundo, e a gestora verifica a elegibilidade de cada título antes da cessão. O processo de referência (AS-IS) é manual:
- a carteira chega por planilha e e-mail;
- a validação é feita à mão;
- as rejeições voltam em texto livre;
- a conciliação com o custodiante acontece dias depois.

O resultado é risco de desenquadramento, cessão em duplicidade e retrabalho entre operação e TI.

Este projeto substitui esse fluxo por uma API de remessa com regras de elegibilidade explícitas, rastreáveis até a norma, e documenta cada etapa do trabalho de análise de negócios.

## Resultados

| Entrega | Conteúdo | Local |
|---|---|---|
| **Discovery** | Processo atual com 9 pontos de falha. 10 regras de elegibilidade ligadas à CVM 175 e a regulamentos reais. 11 histórias com critérios de aceite em Gherkin. Backlog priorizado por RICE e MoSCoW. | [`docs/discovery/`](docs/discovery/README.md) |
| **Contrato** | OpenAPI 3.0 com 3 endpoints, idempotência por `Idempotency-Key` e erros em `application/problem+json`. | [`api/openapi.yaml`](api/openapi.yaml) |
| **Mock** | API NestJS que aplica as 10 regras e valida cada requisição contra o próprio contrato. | [`api/`](api/README.md) |
| **Homologação** | Coleção Postman com 29 casos e 63 asserções, executada pelo Newman no CI. | [`api/postman/`](api/postman/README.md) |
| **Conciliação** | SQL remessa × custódia. Detecta título faltante, valor divergente, duplicidade e posição sem remessa. | [`api/sql/`](api/sql/README.md) |
| **Gestão** | Quadro com movimentação automática, lead time medido, status report semanal gerado do quadro e do Git. | [`gestao/`](gestao/README.md) |
| **Decisões** | 7 ADRs com problema, opções, decisão e consequências. | [`decisoes/`](decisoes/README.md) |

## Rastreabilidade

Cada regra é rastreável da fonte ao teste:

```
fonte (CVM 175, regulamento) → RN-NN → HU-NN (issue) → openapi.yaml
  → código (// RN-NN · fonte) → testes unitário e de integração → caso Postman (HU-NN · RN-NN)
```

O `make check` falha nestes casos:
- uma regra não está coberta por nenhuma história ou por nenhum caso da coleção;
- uma história não tem Gherkin;
- o índice de ADRs aponta para um arquivo inexistente.

## API

| Método | Caminho | Descrição | Histórias |
|---|---|---|---|
| `POST` | `/remessas` | Recebe uma remessa e avalia cada título. Reenvio com a mesma chave devolve a resposta original; corpo diferente com a mesma chave devolve `409`. | HU-01, HU-02 |
| `GET` | `/remessas/{id}` | Consulta a remessa e os totais aceitos e rejeitados. | HU-10 |
| `GET` | `/remessas/{id}/rejeicoes` | Lista os títulos rejeitados, com o código da regra violada (`RN-02_RECEIVABLE_OVERDUE`, por exemplo). | HU-09 |

A rejeição de um título não invalida a remessa. Apenas o cedente não habilitado (RN-10) rejeita o lote inteiro, com `422`.

## Stack

| Camada | Tecnologia |
|---|---|
| API | Node.js 22+ (CI em Node.js 24), NestJS 11, TypeScript 5.9 |
| Validação | Ajv, contra o schema do `openapi.yaml` |
| Persistência | Em memória (padrão) ou PostgreSQL 16 |
| Testes | Jest, Supertest, Postman e Newman |
| Qualidade | ESLint, dependency-cruiser (camadas), Redocly (lint do contrato), mermaid-cli (diagramas) |
| Documentação | Docsify e Redoc, publicados no GitHub Pages |
| Automação | GitHub Actions e GitHub Projects |

As escolhas estão registradas em [ADR-0002](decisoes/0002-stack-do-mock.md) e [ADR-0007](decisoes/0007-automacao-do-fluxo.md).

## Como executar

Pré-requisitos: Node.js 22 ou superior, Docker com Compose, Python 3 e `make`.

```bash
make setup        # instala as dependências e sobe o PostgreSQL com o schema aplicado
make api          # mock em http://localhost:3000, Swagger em http://localhost:3000/docs
make newman       # executa a coleção de homologação contra o mock
make conciliacao  # executa o SQL de conciliação e compara com o resultado esperado
make check        # estrutura, rastreabilidade, lint, tipos, camadas, testes e lint do OpenAPI
make diagramas    # renderiza os diagramas Mermaid
make docs         # documentação em http://localhost:8000/site/
```

O mock usa repositórios em memória por padrão. Para persistir no PostgreSQL:

```bash
BATCH_REPOSITORY=postgres DATABASE_URL=postgresql://fidc:fidc@localhost:55432/fidc make api
```

As demais variáveis de ambiente estão em [`api/README.md`](api/README.md#configuração).

## Estrutura

```
├── docs/
│   ├── discovery/    AS-IS, regras de negócio, histórias e backlog
│   ├── fontes/       CVM 175 (Anexo II) e regulamentos usados como fonte
│   ├── en/           tradução das regras de negócio
│   └── glossario.md  termos de domínio e nomes no código
├── api/
│   ├── openapi.yaml  contrato da API
│   ├── src/          mock NestJS (módulos batch, eligibility, shared)
│   ├── test/         testes de integração
│   ├── postman/      coleção de homologação
│   └── sql/          schema e conciliação remessa × custódia
├── gestao/           quadro, métricas de fluxo e status reports
├── decisoes/         ADRs
├── diario/           registro das sessões de trabalho
├── premissas.md      suposições sobre o fundo e como validá-las
└── site/             site de documentação
```

## Qualidade e automação

| Workflow | Gatilho | Função |
|---|---|---|
| `check` | PR e push na `main` | Estrutura e rastreabilidade, testes de automação, ESLint, tipos, camadas, 73 testes (com PostgreSQL), conciliação SQL, renderização dos diagramas e homologação Newman. |
| `pr` | PR | Conventional Commits no título e nos commits. Seções obrigatórias do PR e issue ligada. |
| `quadro` | Branch, PR e issue | Move o card no quadro e registra a mudança na issue, para o cálculo do lead time. |
| `semanal` | Segunda-feira, 08:00 | Gera o status report e as métricas e abre um PR para revisão. |
| `pages` | Push na `main` | Publica a documentação e a referência da API. |

## Premissas e limitações

- O fundo é simulado, com PL de referência de R$ 50 milhões, CDI de 14,90% a.a. e data de referência 2026-10-14.
- As suposições sobre a operação estão em [`premissas.md`](premissas.md), com o método de validação de cada uma. Seis delas aguardam validação com quem opera FIDC.
- O que o mock simplifica em relação a produção (concorrência, autenticação, grupo econômico, registradora) está em [`api/README.md`](api/README.md#melhorias-propostas).
