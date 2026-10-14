# Conciliação remessa × custódia (HU-11)

| Arquivo | Conteúdo |
|---|---|
| `schema.sql` | Tabelas do mock (`batch`, `batch_receivable`, `idempotency_key`) e da posição do custodiante (`custody_position`). |
| `reconciliation.sql` | View `reconciliation_divergence` e o relatório de divergências. |
| `test-data.sql` | Dados de teste: um título conciliado e um caso de cada divergência. |
| `expected-reconciliation.txt` | Saída esperada do relatório para `test-data.sql`. |

## Divergências

O cruzamento usa a chave **(cedente, externalId)** e só os títulos **aceitos** nas remessas.

| Código | Situação | O que a operação faz |
|---|---|---|
| `MISSING_IN_CUSTODY` | Título aceito sem posição na custódia. | Cobra o registro no custodiante; o fundo pagou por um título que ninguém está guardando. |
| `AMOUNT_MISMATCH` | Uma posição, com valor diferente do aceito. | Confere a nota e o termo de cessão; corrige a custódia ou a remessa. |
| `DUPLICATED_IN_CUSTODY` | Mais de uma posição para o mesmo título. | Pede o estorno da posição duplicada; o PL fica inflado enquanto isso. |
| `MISSING_IN_BATCH` | Posição na custódia sem título aceito, incluindo título **rejeitado** que foi custodiado. | Investiga: é o caso mais grave, porque o fundo carrega um título que a elegibilidade recusou. |

## Como rodar

```bash
make setup         # sobe o Postgres (docker compose, porta 55432)
make conciliacao   # schema + dados de teste + relatório, comparado com expected-reconciliation.txt
```

O teste roda em um schema temporário e o apaga no fim. No CI, o job `check` sobe um Postgres como serviço e roda `make conciliacao`.

Para conciliar remessas reais do mock:

```bash
psql postgresql://fidc:fidc@localhost:55432/fidc -f api/sql/schema.sql
BATCH_REPOSITORY=postgres DATABASE_URL=postgresql://fidc:fidc@localhost:55432/fidc make api
# envie remessas, carregue a posição do custodiante em custody_position e rode:
psql postgresql://fidc:fidc@localhost:55432/fidc -f api/sql/reconciliation.sql
```

O teste de integração `test/postgres-reconciliation.integration.spec.ts` faz esse caminho de ponta a ponta:
1. envia a remessa pela API, gravando no Postgres;
2. carrega a posição da custódia;
3. confere o relatório.

Ele roda quando `DATABASE_URL` está definida (no CI, sempre).

## Premissa

O formato da posição do custodiante é suposição (PR-08 em `premissas.md`): uma linha por título, com cedente, `externalId` e valor. Um custodiante real pode mandar CNAB ou layout próprio. Nesse caso, muda só a carga em `custody_position`; o relatório continua o mesmo.
