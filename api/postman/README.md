# Homologação · coleção Postman

Prova de aceite da integração: 29 casos e 63 asserções que cobrem o caminho feliz, cada regra RN-01 a RN-10 violada, payload inválido, reenvio idempotente e conflito de idempotência. Falha na coleção bloqueia o merge.

- **Arquivo:** [`fidc-remessa.postman_collection.json`](fidc-remessa.postman_collection.json), no formato Postman v2.1, importável no Postman.
- **Execução local:** `make newman`. O script compila o mock, sobe com `REFERENCE_DATE=2026-10-14`, executa a coleção e encerra o mock. O relatório JUnit fica em `api/reports/newman.xml`.
- **CI:** job `homologação (Newman)` em `.github/workflows/check.yml`, depois do `check`. O relatório é publicado como artefato.
- **Ordem:** a coleção pressupõe um mock recém-iniciado, porque a carteira simulada muda à medida que as remessas são aceitas.
- **Verificação das regras:** nos casos de regra, o teste do `POST` consulta `GET /remessas/{id}/rejeicoes` (via `pm.sendRequest`) e confere o código da rejeição.
- **Convenção:** o nome de cada request cita a história e a regra (`HU-03 · RN-02 · vencido`), conforme [`.claude/rules/testes.md`](../../.claude/rules/testes.md).

## Casos

| # | Request | Esperado |
|---|---|---|
| 1 | HU-01 · RN-10 · remessa válida de cedente habilitado | 201, 2 aceitos, `Location`, data de referência |
| 2 | HU-10 · consulta da remessa existente | 200, mesmo id |
| 3 | HU-10 · remessa inexistente | 404 `BATCH_NOT_FOUND` |
| 4 | HU-01 · RN-10 · cedente suspenso | 422 `RN-10_ASSIGNOR_NOT_ENABLED` |
| 5 | HU-01 · RN-10 · cedente em análise | 422 `RN-10_ASSIGNOR_NOT_ENABLED` |
| 6 | HU-01 · RN-10 · cedente não cadastrado | 422 `RN-10_ASSIGNOR_NOT_ENABLED` |
| 7 | HU-01 · payload inválido · sem lista de recebíveis | 400 `VALIDATION_ERROR` em `/receivables` |
| 8 | HU-01 · payload inválido · CNPJ do sacado com dígito errado | 400 `VALIDATION_ERROR` em `/receivables/0/debtor/taxId` |
| 9 | HU-01 · payload inválido · JSON malformado | 400 `MALFORMED_REQUEST` |
| 10 | HU-01 · sem Idempotency-Key | 400 `MISSING_IDEMPOTENCY_KEY` |
| 11 | HU-02 · primeiro envio com chave fixa | 201 |
| 12 | HU-02 · reenvio idempotente · mesma chave e mesmo corpo | 201, mesmo id, `Idempotent-Replayed: true` |
| 13 | HU-02 · conflito de idempotência · mesma chave e outro corpo | 409 `IDEMPOTENCY_KEY_CONFLICT` |
| 14 | HU-03 · RN-01 · cheque | rejeição `RN-01_UNSUPPORTED_RECEIVABLE_TYPE` |
| 15 | HU-03 · RN-02 · vencido | rejeição `RN-02_RECEIVABLE_OVERDUE` |
| 16 | HU-03 · RN-04 · duplicata sem nota fiscal | rejeição `RN-04_MISSING_INVOICE_EVIDENCE` |
| 17 | HU-03 · RN-02 · RN-04 · vencido e sem nota traz os dois motivos | as duas rejeições |
| 18 | HU-04 · RN-05 · sacado com atraso de 10 dias é aceito | 201, 1 aceito |
| 19 | HU-04 · RN-05 · sacado com atraso de 20 dias | rejeição `RN-05_DEBTOR_IN_DEFAULT` |
| 20 | HU-05 · RN-06 · taxa de 16% a.a. abaixo de 120% do CDI | rejeição `RN-06_DISCOUNT_RATE_BELOW_MINIMUM` |
| 21 | HU-06 · RN-07 · sacado acima de 4% do PL | rejeição `RN-07_DEBTOR_CONCENTRATION_EXCEEDED` |
| 22 | HU-06 · RN-07 · filial conta no grupo do sacado | rejeição `RN-07_DEBTOR_CONCENTRATION_EXCEEDED` |
| 23 | HU-06 · RN-08 · cedente acima de 7,5% do PL | 1º título aceito, 2º com `RN-08_ASSIGNOR_CONCENTRATION_EXCEEDED` |
| 24 | HU-07 · RN-09 · título já na carteira | rejeição `RN-09_DUPLICATE_RECEIVABLE` |
| 25 | HU-07 · RN-09 · título repetido na mesma remessa | 2ª ocorrência com `RN-09_DUPLICATE_RECEIVABLE` |
| 26 | HU-08 · RN-03 · título de R$ 1 milhão a ~200 dias úteis | rejeição `RN-03_WEIGHTED_AVERAGE_TERM_EXCEEDED` |
| 27 | HU-09 · remessa com 1 aceito e 2 rejeitados | 201, 1 aceito, 2 rejeitados |
| 28 | HU-09 · consulta das rejeições | 200, posições 2 e 3, códigos `RN-NN_...` |
| 29 | HU-09 · rejeições de remessa inexistente | 404 `BATCH_NOT_FOUND` |

O `make check` verifica que a coleção tem ao menos 15 casos nomeados `HU-NN · ...` e que cada regra RN-01 a RN-10 aparece em pelo menos um nome.
