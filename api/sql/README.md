# Conciliação remessa × custódia

Relatório que cruza os títulos aceitos pela API com a posição informada pelo custodiante e classifica cada divergência (HU-11).

| Arquivo | Conteúdo |
|---|---|
| `schema.sql` | Tabelas do mock (`batch`, `batch_receivable`, `idempotency_key`) e da posição do custodiante (`custody_position`). |
| `reconciliation.sql` | View `reconciliation_divergence` e o relatório de divergências. |
| `test-data.sql` | Dados de teste: um título conciliado e um caso de cada divergência. |
| `expected-reconciliation.txt` | Saída esperada do relatório para `test-data.sql`. |

## Divergências

O cruzamento usa a chave **(cedente, externalId)** e considera apenas os títulos **aceitos** nas remessas.

| Código | Situação | Tratamento operacional |
|---|---|---|
| `MISSING_IN_CUSTODY` | Título aceito sem posição na custódia. | Solicitar o registro ao custodiante: o fundo pagou por um título sem guarda. |
| `AMOUNT_MISMATCH` | Uma posição, com valor diferente do aceito. | Conferir a nota fiscal e o termo de cessão; corrigir a custódia ou a remessa. |
| `DUPLICATED_IN_CUSTODY` | Mais de uma posição para o mesmo título. | Solicitar o estorno da posição duplicada: o PL fica inflado até a correção. |
| `MISSING_IN_BATCH` | Posição na custódia sem título aceito, incluindo título **rejeitado** que foi custodiado. | Investigar com prioridade: o fundo carrega um título que a elegibilidade recusou. |

## Execução

```bash
make setup         # sobe o Postgres (docker compose, porta 55432)
make conciliacao   # schema + dados de teste + relatório, comparado com expected-reconciliation.txt
```

O teste usa um schema temporário, removido ao final. No CI, o job `check` executa `make conciliacao` contra um PostgreSQL de serviço.

Para conciliar remessas enviadas ao mock, o `make setup` sobe o PostgreSQL com o `schema.sql` já aplicado (via `docker-entrypoint-initdb.d`):

```bash
make setup
BATCH_REPOSITORY=postgres DATABASE_URL=postgresql://fidc:fidc@localhost:55432/fidc make api
# envie remessas, carregue a posição do custodiante em custody_position e rode:
psql postgresql://fidc:fidc@localhost:55432/fidc -f api/sql/reconciliation.sql
```

O teste de integração `test/postgres-reconciliation.integration.spec.ts` cobre esse caminho de ponta a ponta:
1. envia a remessa pela API, com gravação no PostgreSQL;
2. carrega a posição da custódia;
3. confere o relatório.

Ele roda quando `DATABASE_URL` está definida, o que sempre ocorre no CI.

## Limitação

O formato da posição do custodiante é uma premissa (PR-08 em [`premissas.md`](../../premissas.md)): uma linha por título, com cedente, `externalId` e valor. Um custodiante real pode usar CNAB ou layout próprio. Nesse caso, muda apenas a carga em `custody_position`; o relatório permanece o mesmo.
