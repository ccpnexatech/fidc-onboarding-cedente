# Histórias (HU-01 a HU-11)

Regra: `.claude/rules/requisitos.md`. Cada história vira uma issue com o label `historia`. As regras estão em `regras.md`. Nos exemplos, a data de referência é 2026-10-14 e a carteira simulada é a descrita em `api/README.md`.

## Rastreabilidade

| História | Papel | Regras | Endpoint |
|---|---|---|---|
| HU-01 · Enviar remessa pela API | cedente | RN-10 | `POST /remessas` |
| HU-02 · Reenviar sem duplicar a cessão | cedente | RN-09 (indireta), PR-05 | `POST /remessas` |
| HU-03 · Barrar título inválido na origem | analista da gestora | RN-01, RN-02, RN-04 | `POST /remessas` |
| HU-04 · Barrar sacado inadimplente | analista da gestora | RN-05 | `POST /remessas` |
| HU-05 · Garantir a taxa mínima | analista da gestora | RN-06 | `POST /remessas` |
| HU-06 · Respeitar os limites de concentração | analista da gestora | RN-07, RN-08 | `POST /remessas` |
| HU-07 · Impedir cessão em duplicidade | analista da gestora | RN-09 | `POST /remessas` |
| HU-08 · Manter o prazo médio da carteira | analista da gestora | RN-03 | `POST /remessas` |
| HU-09 · Consultar as rejeições | cedente | todas (consulta) | `GET /remessas/{id}/rejeicoes` |
| HU-10 · Consultar a remessa | analista da gestora | — | `GET /remessas/{id}` |
| HU-11 · Conciliar remessa e custódia | operação | — | SQL de conciliação |

Toda RN aparece em ao menos uma HU.

---

## HU-01 · Enviar remessa pela API

Como **cedente**, quero **enviar minha carteira de duplicatas por uma API com contrato único**, para **não depender de planilha por e-mail nem de reformatação manual**.

Regras: RN-10.

```gherkin
Funcionalidade: Envio de remessa

  Cenário: Cedente habilitado envia remessa válida
    Dado o cedente "12345678000195" ativo
    E uma remessa com 2 duplicatas elegíveis
    Quando o cedente envia a remessa com uma Idempotency-Key nova
    Então a resposta tem status 201
    E a remessa mostra 2 títulos recebidos e 2 aceitos

  Cenário: Cedente suspenso tem a remessa recusada
    Dado o cedente "98765432000198" suspenso
    Quando o cedente envia uma remessa
    Então a resposta tem status 422
    E o código do problema é "RN-10_ASSIGNOR_NOT_ENABLED"

  Cenário: Payload fora do contrato
    Dado uma remessa sem a lista de recebíveis
    Quando o cedente envia a remessa
    Então a resposta tem status 400
    E o corpo segue o formato application/problem+json

  Cenário: Envio sem Idempotency-Key
    Quando o cedente envia uma remessa sem o header Idempotency-Key
    Então a resposta tem status 400
```

## HU-02 · Reenviar sem duplicar a cessão

Como **cedente**, quero **reenviar a mesma remessa após uma falha de rede sem gerar uma nova cessão**, para **ter segurança de tentar de novo sem pagar duas vezes pelo mesmo título**.

Regras: RN-09 (indireta). Premissa: PR-05.

```gherkin
Funcionalidade: Idempotência do envio

  Cenário: Reenvio com a mesma chave e o mesmo corpo
    Dado uma remessa já enviada com a Idempotency-Key "chave-001"
    Quando o cedente reenvia o mesmo corpo com a Idempotency-Key "chave-001"
    Então a resposta tem status 201
    E o id da remessa é o mesmo do primeiro envio
    E nenhuma nova remessa é criada

  Cenário: Mesma chave com corpo diferente
    Dado uma remessa já enviada com a Idempotency-Key "chave-001"
    Quando o cedente envia outro corpo com a Idempotency-Key "chave-001"
    Então a resposta tem status 409
    E o código do problema é "IDEMPOTENCY_KEY_CONFLICT"
```

## HU-03 · Barrar título inválido na origem

Como **analista da gestora**, quero **que títulos de tipo não aceito, vencidos ou sem nota fiscal sejam rejeitados automaticamente**, para **não gastar análise com o que o regulamento já proíbe**.

Regras: RN-01, RN-02, RN-04.

```gherkin
Funcionalidade: Validação do título

  Cenário: Duplicata válida é aceita
    Dado uma duplicata mercantil com vencimento em 2026-12-14 e nota fiscal
    Quando a remessa é processada
    Então o título é aceito

  Cenário: Cheque é rejeitado
    Dado um título do tipo "CHECK"
    Quando a remessa é processada
    Então o título é rejeitado com o código "RN-01_UNSUPPORTED_RECEIVABLE_TYPE"

  Cenário: Título vencido é rejeitado
    Dado uma duplicata com vencimento em 2026-10-10
    Quando a remessa é processada
    Então o título é rejeitado com o código "RN-02_RECEIVABLE_OVERDUE"

  Cenário: Duplicata sem nota fiscal é rejeitada
    Dado uma duplicata sem invoiceKey
    Quando a remessa é processada
    Então o título é rejeitado com o código "RN-04_MISSING_INVOICE_EVIDENCE"

  Cenário: Título com mais de um problema traz todos os motivos
    Dado uma duplicata vencida e sem nota fiscal
    Quando a remessa é processada
    Então a rejeição traz os códigos "RN-02_RECEIVABLE_OVERDUE" e "RN-04_MISSING_INVOICE_EVIDENCE"
```

## HU-04 · Barrar sacado inadimplente

Como **analista da gestora**, quero **que títulos de sacados em atraso com o fundo sejam rejeitados**, para **não aumentar a exposição a quem já não paga**.

Regras: RN-05.

```gherkin
Funcionalidade: Sacado inadimplente

  Cenário: Sacado com atraso de até 15 dias
    Dado o sacado "22333444000181" com um título vencido há 10 dias na carteira
    Quando chega um título novo desse sacado
    Então o título é aceito

  Cenário: Sacado com atraso acima de 15 dias
    Dado o sacado "33444555000181" com um título vencido há 20 dias na carteira
    Quando chega um título novo desse sacado
    Então o título é rejeitado com o código "RN-05_DEBTOR_IN_DEFAULT"
```

## HU-05 · Garantir a taxa mínima

Como **analista da gestora**, quero **que títulos com taxa abaixo de 120% do CDI sejam rejeitados**, para **que a carteira remunere as cotas seniores**.

Regras: RN-06.

```gherkin
Funcionalidade: Taxa mínima de aquisição

  Cenário: Taxa acima do mínimo
    Dado o CDI de referência em 14,90% ao ano
    E um título com taxa de 24% ao ano
    Quando a remessa é processada
    Então o título é aceito

  Cenário: Taxa abaixo do mínimo
    Dado o CDI de referência em 14,90% ao ano
    E um título com taxa de 16% ao ano
    Quando a remessa é processada
    Então o título é rejeitado com o código "RN-06_DISCOUNT_RATE_BELOW_MINIMUM"
```

## HU-06 · Respeitar os limites de concentração

Como **analista da gestora**, quero **que a remessa respeite os limites por sacado e por cedente com a posição da carteira no momento da cessão**, para **não desenquadrar o fundo**.

Regras: RN-07, RN-08.

```gherkin
Funcionalidade: Limites de concentração

  Cenário: Sacado dentro do limite
    Dado o sacado "44555666000181" com R$ 1.000.000,00 na carteira
    Quando chega um título de R$ 500.000,00 desse sacado
    Então o título é aceito

  Cenário: Sacado acima de 4% do PL
    Dado o sacado "55666777000181" com R$ 1.950.000,00 na carteira
    Quando chega um título de R$ 60.000,00 desse sacado
    Então o título é rejeitado com o código "RN-07_DEBTOR_CONCENTRATION_EXCEEDED"

  Cenário: Filial conta no grupo econômico do sacado
    Dado o sacado "55666777000181" com R$ 1.950.000,00 na carteira
    Quando chega um título de R$ 60.000,00 da filial "55666777000262"
    Então o título é rejeitado com o código "RN-07_DEBTOR_CONCENTRATION_EXCEEDED"

  Cenário: Cedente acima de 7,5% do PL
    Dado o cedente "11222333000181" com R$ 3.700.000,00 na carteira
    Quando ele cede um título de R$ 100.000,00
    Então o título é rejeitado com o código "RN-08_ASSIGNOR_CONCENTRATION_EXCEEDED"

  Cenário: O limite considera os títulos aceitos antes na mesma remessa
    Dado o cedente "11222333000181" com R$ 3.700.000,00 na carteira
    Quando ele cede, na mesma remessa, um título de R$ 40.000,00 e depois outro de R$ 40.000,00
    Então o primeiro título é aceito
    E o segundo é rejeitado com o código "RN-08_ASSIGNOR_CONCENTRATION_EXCEEDED"
```

## HU-07 · Impedir cessão em duplicidade

Como **analista da gestora**, quero **que o mesmo título não seja cedido duas vezes**, para **não pagar duas vezes por um único recebível**.

Regras: RN-09.

```gherkin
Funcionalidade: Duplicidade

  Cenário: Título novo
    Dado que o título "DM-2026-0500" não está na carteira
    Quando ele chega em uma remessa
    Então o título é aceito

  Cenário: Título já na carteira
    Dado que o título "DM-2026-0001" do cedente "12345678000195" está na carteira
    Quando ele chega de novo em uma remessa do mesmo cedente
    Então o título é rejeitado com o código "RN-09_DUPLICATE_RECEIVABLE"

  Cenário: Título repetido na mesma remessa
    Dado uma remessa com o título "DM-2026-0600" duas vezes
    Quando a remessa é processada
    Então a primeira ocorrência é aceita
    E a segunda é rejeitada com o código "RN-09_DUPLICATE_RECEIVABLE"
```

## HU-08 · Manter o prazo médio da carteira

Como **analista da gestora**, quero **que um título longo não leve o prazo médio da carteira acima de 75 dias úteis**, para **manter a carteira curta e o caixa girando**.

Regras: RN-03.

```gherkin
Funcionalidade: Prazo médio ponderado

  Cenário: Título curto
    Dado a carteira com prazo médio de cerca de 74 dias úteis
    Quando chega um título de R$ 100.000,00 com vencimento em 40 dias úteis
    Então o título é aceito

  Cenário: Título longo e grande
    Dado a carteira com prazo médio de cerca de 74 dias úteis
    Quando chega um título de R$ 1.000.000,00 com vencimento em 200 dias úteis
    Então o título é rejeitado com o código "RN-03_WEIGHTED_AVERAGE_TERM_EXCEEDED"
```

## HU-09 · Consultar as rejeições

Como **cedente**, quero **consultar os títulos rejeitados com um código estável por motivo**, para **corrigir só o que foi recusado e reenviar**.

Regras: todas (consulta).

```gherkin
Funcionalidade: Consulta de rejeições

  Cenário: Remessa com rejeições
    Dado uma remessa com 1 título aceito e 2 rejeitados
    Quando o cedente consulta as rejeições da remessa
    Então a resposta tem status 200
    E a lista tem 2 itens, cada um com externalId e códigos RN-NN

  Cenário: Remessa inexistente
    Quando o cedente consulta as rejeições de uma remessa que não existe
    Então a resposta tem status 404
```

## HU-10 · Consultar a remessa

Como **analista da gestora**, quero **consultar uma remessa com totais, data de referência e títulos aceitos**, para **reconstituir a decisão em uma auditoria**.

Regras: nenhuma (consulta).

```gherkin
Funcionalidade: Consulta de remessa

  Cenário: Remessa existente
    Dado uma remessa recebida
    Quando o analista consulta a remessa pelo id
    Então a resposta tem status 200
    E mostra a data de referência, os totais e os títulos aceitos

  Cenário: Remessa inexistente
    Quando o analista consulta uma remessa que não existe
    Então a resposta tem status 404
```

## HU-11 · Conciliar remessa e custódia

Como **operação**, quero **cruzar os títulos aceitos com a posição da custódia**, para **encontrar faltantes, valores divergentes e duplicados no mesmo dia**.

Regras: nenhuma (conciliação). Premissa: PR-04.

```gherkin
Funcionalidade: Conciliação

  Cenário: Título aceito e custodiado com o mesmo valor
    Dado um título aceito de R$ 10.000,00 e a mesma posição na custódia
    Quando a conciliação roda
    Então o título não aparece no relatório de divergências

  Cenário: Título aceito que não chegou à custódia
    Dado um título aceito sem posição na custódia
    Quando a conciliação roda
    Então o relatório mostra o título como "MISSING_IN_CUSTODY"

  Cenário: Valor divergente
    Dado um título aceito de R$ 10.000,00 e posição na custódia de R$ 9.000,00
    Quando a conciliação roda
    Então o relatório mostra o título como "AMOUNT_MISMATCH"

  Cenário: Título duplicado na custódia
    Dado um título aceito com duas posições na custódia
    Quando a conciliação roda
    Então o relatório mostra o título como "DUPLICATED_IN_CUSTODY"

  Cenário: Posição na custódia sem remessa
    Dado uma posição na custódia sem título aceito correspondente
    Quando a conciliação roda
    Então o relatório mostra a posição como "MISSING_IN_BATCH"
```
