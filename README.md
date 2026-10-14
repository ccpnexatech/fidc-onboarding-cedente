# fidc-onboarding-cedente

Onboarding digital de cedentes em um FIDC simulado, do discovery à API homologada.

Este repositório registra o trabalho de **análise de negócios** de ponta a ponta: levantar o problema, transformar regras em histórias testáveis, escrever o contrato da API, homologar a integração e conciliar os dados. Cada decisão relevante fica registrada em `decisoes/`.

> Cenário fictício, inspirado na operação de gestoras de FIDC. Nenhum dado real de cedente, sacado ou fundo é usado. As regras citam regulamentos públicos (em `docs/fontes/`) apenas como fonte; o projeto não é sistema de nenhuma gestora.

English version: [README.en.md](README.en.md).

## O problema

Hoje (AS-IS simulado) o cedente envia a carteira de recebíveis por planilha, por e-mail. A gestora valida a elegibilidade à mão, devolve as rejeições também por e-mail e só depois concilia com a custódia. Demandas de integração mal especificadas viram retrabalho entre operação e TI.

## Entregas

| Fase | Entrega | Pasta | Status |
|---|---|---|---|
| P1 | Discovery: AS-IS, regras de elegibilidade, histórias com Gherkin, backlog RICE/MoSCoW | `docs/discovery/` | feito |
| P2 | API de remessa (OpenAPI), mock, coleção Postman/Newman em CI, SQL de conciliação | `api/` | feito |
| P3 | Quadro de entrega (GitHub Projects), status reports semanais, lead time | `gestao/` | feito |

## Em 5 minutos

1. **O problema e o processo atual:** [`docs/discovery/as-is.md`](docs/discovery/as-is.md), com 9 pontos de falha e o TO-BE.
2. **As regras e de onde vêm:** [`docs/discovery/regras.md`](docs/discovery/regras.md). São 10 regras, cada uma ligada a uma cláusula da CVM 175 ou de um regulamento real, com o código de rejeição que a API devolve.
3. **Por que essas fontes:**
   - [ADR-0005](decisoes/0005-hierarquia-das-fontes.md): a norma é o piso e o regulamento restringe;
   - [ADR-0006](decisoes/0006-regulamentos-modelo.md): o regulamento do BMA como base, com regras da Solis como complemento.
4. **O contrato:** [`api/openapi.yaml`](api/openapi.yaml) (Swagger em `/docs` com `make api`).
5. **A prova:** 29 casos de homologação ([`api/postman/`](api/postman/README.md)) e 73 testes automatizados no CI.
6. **A conciliação:** [`api/sql/`](api/sql/README.md), que encontra faltante, valor divergente e duplicado.
7. **A gestão:** [quadro](https://github.com/users/ccpnexatech/projects/1), [status report](gestao/status/2026-10-14.md) e [métricas de fluxo](gestao/metricas.md).

## Rastreabilidade

```
fonte (CVM 175 / regulamento) → RN-NN (regras.md) → HU-NN (historias.md, issue) → contrato (openapi.yaml)
  → código (// RN-NN · fonte) → teste unitário e de integração → caso Postman (HU-NN · RN-NN · caso)
```

O `make check` falha se uma RN não aparecer em nenhuma história ou em nenhum caso da coleção, se uma história não tiver Gherkin ou se o índice de ADRs apontar para um arquivo que não existe.

## Como navegar

- `premissas.md`: o que está sendo suposto sobre o FIDC e como validar cada suposição.
- `decisoes/`: ADRs, uma decisão por arquivo.
- `diario/`: diário de bordo por sessão (hipótese → descoberta → próxima dúvida).
- `docs/glossario.md`: termos de domínio em pt-BR e o nome usado no código.
- `docs/fontes/`: norma e regulamentos usados como fonte das regras.

## Comandos

```bash
make setup        # instala as dependências e sobe o Postgres (docker compose)
make check        # estrutura, rastreabilidade, ESLint, tipos, camadas, testes e lint do OpenAPI
make api          # sobe o mock em http://localhost:3000 (Swagger em /docs)
make newman       # homologação: coleção Postman contra o mock
make conciliacao  # SQL de conciliação no Postgres
make docs         # site de documentação em http://localhost:8000/site/
```
