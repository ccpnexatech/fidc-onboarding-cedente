# fidc-onboarding-cedente

Onboarding digital de cedentes em um FIDC simulado, do discovery à API homologada.

Este repositório registra o trabalho de **análise de negócios** de ponta a ponta: levantar o problema, transformar regras em histórias testáveis, escrever o contrato da API, homologar a integração e conciliar os dados. Cada decisão relevante fica registrada em `decisoes/`.

> Cenário fictício, inspirado na operação de gestoras de FIDC. Nenhum dado real de cedente, sacado ou fundo é usado.

## O problema

Hoje (AS-IS simulado) o cedente envia a carteira de recebíveis por planilha, por e-mail. A gestora valida a elegibilidade à mão, devolve as rejeições também por e-mail e só depois concilia com a custódia. Demandas de integração mal especificadas viram retrabalho entre operação e TI.

## Entregas

| Fase | Entrega | Pasta | Status |
|---|---|---|---|
| P1 | Discovery: AS-IS, regras de elegibilidade, histórias com Gherkin, backlog RICE/MoSCoW | `docs/discovery/` | feito |
| P2 | API de remessa (OpenAPI), mock, coleção Postman/Newman em CI, SQL de conciliação | `api/` | a fazer |
| P3 | Quadro de entrega (GitHub Projects), status reports semanais, lead time | `gestao/` | a fazer |

## Como navegar

- `premissas.md`: o que está sendo suposto sobre o FIDC e como validar cada suposição.
- `decisoes/`: ADRs, uma decisão por arquivo.
- `diario/`: diário de bordo por sessão (hipótese → descoberta → próxima dúvida).
- `docs/glossario.md`: termos de domínio em pt-BR e o nome usado no código.

## Comandos

```bash
make check     # validações do repositório (rodar antes de todo PR)
make setup     # disponível a partir do P2
make api       # disponível a partir do P2
make newman    # disponível a partir do P2
make docs      # disponível a partir do P1
```
