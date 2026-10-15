# Regras de elegibilidade (RN-01 a RN-10)

Critérios que cada remessa e cada título precisam atender para serem cedidos ao fundo simulado.

- **Hierarquia das fontes** ([ADR-0005](../../decisoes/0005-hierarquia-das-fontes.md)): a norma (CVM 175, Anexo II) é o piso e o regulamento do fundo pode apenas restringi-la. Quando duas fontes tratam do mesmo ponto com valores diferentes, prevalece o mais restritivo.
- **Regulamentos-modelo** ([ADR-0006](../../decisoes/0006-regulamentos-modelo.md)): BMA FIDC Multissetorial como base, com critérios dos fundos da Solis como complemento.
- **Convenções:** [`.claude/rules/requisitos.md`](../../.claude/rules/requisitos.md).

## Parâmetros do fundo simulado

| Parâmetro | Valor | Origem |
|---|---|---|
| PL de referência | R$ 50.000.000,00 | Simulado. No fundo real, PL do fim do mês anterior (ZIG 5.19). PR-06. |
| CDI de referência | 14,90% a.a. | Simulado, configurável. |
| Data de referência | Data em que a remessa é recebida | No mock, configurável para testes reproduzíveis (padrão 2026-10-14). |
| Dias úteis | Calendário nacional de feriados (base ANBIMA) | Usado na RN-03. |
| Grupo econômico | Raiz do CNPJ (8 primeiros dígitos); CPF é o próprio grupo | PR-07. |

## Ordem de avaliação

1. **Lote.** Se o cedente não estiver habilitado (RN-10), a remessa inteira é recusada com 422 e nenhum título é avaliado.
2. **Regras do título** (RN-01, RN-02, RN-04, RN-05, RN-06, RN-09). Cada título é verificado contra todas, e a rejeição lista **todos** os motivos, para que o cedente corrija tudo em um único reenvio.
3. **Regras da carteira** (RN-03, RN-07, RN-08). Aplicadas apenas aos títulos aprovados no passo 2, **na ordem do payload**. O título é aceito se a carteira, somada aos títulos já aceitos na remessa, permanecer dentro dos limites; caso contrário, é rejeitado com o motivo do primeiro limite excedido, na ordem RN-07, RN-08, RN-03.

A rejeição de um título não invalida a remessa: ela é recebida (201) e as rejeições ficam disponíveis em `GET /remessas/{id}/rejeicoes`.

## Resumo

| Regra | Tema | Escopo | Código de rejeição | Fonte principal |
|---|---|---|---|---|
| RN-01 | Tipo de título aceito | Título | `RN-01_UNSUPPORTED_RECEIVABLE_TYPE` | BMA 7.24 h |
| RN-02 | Título vencido | Título | `RN-02_RECEIVABLE_OVERDUE` | BMA 7.25 (ii); ZIG 6.1 III |
| RN-03 | Prazo médio ponderado da carteira | Carteira | `RN-03_WEIGHTED_AVERAGE_TERM_EXCEEDED` | BMA 7.25 (iv) |
| RN-04 | Lastro performado (nota fiscal) | Título | `RN-04_MISSING_INVOICE_EVIDENCE` | BMA 7.25 (iii) |
| RN-05 | Sacado inadimplente com o fundo | Título | `RN-05_DEBTOR_IN_DEFAULT` | Warehouse 6.1 II; ZIG 6.1 VI |
| RN-06 | Taxa mínima de aquisição | Título | `RN-06_DISCOUNT_RATE_BELOW_MINIMUM` | Warehouse 6.1 I |
| RN-07 | Concentração por sacado | Carteira | `RN-07_DEBTOR_CONCENTRATION_EXCEEDED` | BMA 7.24 b; Anexo II art. 45 |
| RN-08 | Concentração por cedente | Carteira | `RN-08_ASSIGNOR_CONCENTRATION_EXCEEDED` | BMA 7.24 a |
| RN-09 | Título em duplicidade | Título | `RN-09_DUPLICATE_RECEIVABLE` | Anexo II art. 36 (integridade do lastro) |
| RN-10 | Cedente habilitado | Lote | `RN-10_ASSIGNOR_NOT_ENABLED` | ZIG 6.1 I |

---

## RN-01 · Tipo de título aceito

- **Enunciado:** o fundo só adquire duplicata mercantil (`TRADE_BILL`) ou duplicata de serviço (`SERVICE_BILL`).
- **Motivo:** a duplicata decorre de venda ou serviço já entregue, com nota fiscal, e é o título de lastro mais fácil de comprovar. O BMA exige no mínimo 80% da carteira em duplicatas (7.24 h) e limita os demais tipos a parcelas pequenas (7.24 c, d, e). O MVP simula um fundo exclusivamente de duplicatas; os demais tipos estão no backlog (`backlog.md`, Won't).
- **Fonte:** BMA 7.24 h; PR-03.
- **Válido:** `"type": "TRADE_BILL"`.
- **Inválido:** `"type": "CHECK"` (cheque) → `RN-01_UNSUPPORTED_RECEIVABLE_TYPE`.

## RN-02 · Título vencido

- **Enunciado:** o vencimento (`dueDate`) não pode ser anterior à data de referência da cessão.
- **Motivo:** título vencido já caracteriza inadimplência; adquiri-lo significa comprar perda, não um recebível.
- **Fonte:** BMA 7.25 (ii) "não podem estar vencidos no momento da cessão"; ZIG 6.1 III.
- **Válido:** referência 2026-10-14, `dueDate` 2026-12-14.
- **Inválido:** referência 2026-10-14, `dueDate` 2026-10-10 → `RN-02_RECEIVABLE_OVERDUE`.

## RN-03 · Prazo médio ponderado da carteira

- **Enunciado:** o prazo médio ponderado pelo valor de face, em dias úteis até o vencimento, da carteira somada aos títulos aceitos na remessa não pode passar de 75 dias úteis.
- **Motivo:** prazo curto acelera o giro de caixa e reduz o risco de deterioração do sacado até o pagamento. Um único título longo e de valor alto pode levar a carteira inteira para fora do limite.
- **Fonte:** BMA 7.25 (iv).
- **Válido:** carteira com prazo médio de 74 dias úteis recebe um título de R$ 100.000,00 a 40 dias úteis; o prazo médio cai.
- **Inválido:** a mesma carteira (R$ 35 milhões) recebe um título de R$ 1.000.000,00 a 200 dias úteis; o prazo médio iria a cerca de 77,5 → `RN-03_WEIGHTED_AVERAGE_TERM_EXCEEDED`.

## RN-04 · Lastro performado (nota fiscal)

- **Enunciado:** toda duplicata precisa trazer a chave de acesso da nota fiscal eletrônica (`invoiceKey`, 44 dígitos).
- **Motivo:** a duplicata só existe a partir de uma fatura (Lei 5.474/1968). Sem a nota, não há prova de que a venda ocorreu, o que abre espaço para a "duplicata fria".
- **Fonte:** BMA 7.25 (iii), créditos "já performados".
- **Válido:** `"invoiceKey": "35261012345678000195550010000012341000012345"`.
- **Inválido:** duplicata sem `invoiceKey` → `RN-04_MISSING_INVOICE_EVIDENCE`.

## RN-05 · Sacado inadimplente com o fundo

- **Enunciado:** o fundo não adquire título de sacado que tenha, na carteira, título vencido e não pago há mais de 15 dias corridos.
- **Motivo:** sacado inadimplente com o fundo não deve receber exposição adicional.
- **Fonte:** Warehouse 6.1 II (15 dias); ZIG 6.1 VI (30 dias). Vale o mais restritivo, 15 dias (ADR-0005).
- **Válido:** o sacado tem um título vencido há 10 dias.
- **Inválido:** o sacado tem um título vencido há 20 dias → `RN-05_DEBTOR_IN_DEFAULT`.

## RN-06 · Taxa mínima de aquisição

- **Enunciado:** a taxa de desconto anual informada (`annualDiscountRateBasisPoints`) precisa ser de pelo menos 120% do CDI de referência. Com o CDI a 14,90% a.a., o mínimo é 17,88% a.a. (1.788 pontos-base).
- **Motivo:** a taxa remunera a meta das cotas seniores e cobre as perdas esperadas. Abaixo do mínimo, o fundo adquire crédito que não remunera o risco assumido.
- **Fonte:** Warehouse 6.1 I.
- **Válido:** `"annualDiscountRateBasisPoints": 2400` (24% a.a.).
- **Inválido:** `"annualDiscountRateBasisPoints": 1600` (16% a.a.) → `RN-06_DISCOUNT_RATE_BELOW_MINIMUM`.

## RN-07 · Concentração por sacado

- **Enunciado:** a exposição a um mesmo sacado, somando os títulos do grupo econômico na carteira e os aceitos na remessa, não pode passar de 4% do PL (R$ 2.000.000,00).
- **Motivo:** um fundo multissacado depende da pulverização: nenhuma inadimplência isolada pode comprometer a carteira. A norma permite até 20% (art. 45); o BMA restringe a 4%.
- **Fonte:** BMA 7.24 b; Anexo II art. 45 caput e §1º (grupo econômico).
- **Válido:** sacado com R$ 1.000.000,00 na carteira recebe um título de R$ 500.000,00.
- **Inválido:** sacado com R$ 1.950.000,00 na carteira recebe um título de R$ 60.000,00 → `RN-07_DEBTOR_CONCENTRATION_EXCEEDED`.

## RN-08 · Concentração por cedente

- **Enunciado:** a exposição a um mesmo cedente, somando a carteira e os aceitos na remessa, não pode passar de 7,5% do PL (R$ 3.750.000,00).
- **Motivo:** o cedente concentra risco operacional e de fraude (duplicata sem venda real, cedente em recuperação judicial).
- **Fonte:** BMA 7.24 a.
- **Válido:** cedente com R$ 500.000,00 na carteira cede R$ 200.000,00.
- **Inválido:** cedente com R$ 3.700.000,00 na carteira cede R$ 100.000,00 → `RN-08_ASSIGNOR_CONCENTRATION_EXCEEDED`.

## RN-09 · Título em duplicidade

- **Enunciado:** o mesmo título não pode ser cedido duas vezes. É duplicado o título cujo par (cedente, `externalId`) ou trio (`invoiceKey`, `dueDate`, `faceValue`) já exista na carteira ou apareça antes na mesma remessa.
- **Motivo:** a cessão duplicada faz o fundo pagar duas vezes pelo mesmo recebível. O gestor deve verificar a existência e a integridade do lastro (art. 36).
- **Fonte:** Anexo II art. 36; PR-03.
- **Válido:** título `DM-2026-0500`, que não está na carteira.
- **Inválido:** título `DM-2026-0001` do mesmo cedente, já na carteira → `RN-09_DUPLICATE_RECEIVABLE`.

## RN-10 · Cedente habilitado

- **Enunciado:** apenas cedente cadastrado e ativo pode enviar remessa. A remessa de cedente desconhecido, suspenso ou em análise é recusada por inteiro (422).
- **Motivo:** o cedente passa por análise e seleção antes de operar. Cedente suspenso (por exemplo, por recuperação judicial ou fraude) não pode ceder.
- **Fonte:** ZIG 6.1 I ("submetidos à prévia análise e seleção pela consultora, e aprovados pela gestora").
- **Válido:** `assignorId` de um cedente ativo.
- **Inválido:** `assignorId` de um cedente suspenso → 422 com `code` `RN-10_ASSIGNOR_NOT_ENABLED`.

## Cláusulas fora das regras

| Cláusula | Motivo |
|---|---|
| 5 maiores cedentes até 25% e 5 maiores sacados até 12% (BMA 7.24 f, g) | Limite de carteira que exige ranking; está no backlog como Could. |
| Até 10% em operações comissárias e até 5% em títulos prorrogados (BMA 7.24 i, j) | O MVP não tem esses tipos de operação. |
| Taxa de retorno projetada e cotas subordinadas de vinculados (BMA 7.24 k, l) | Decisão do gestor sobre o fundo, não um dado da remessa. |
| Titularidade e ausência de ônus (BMA 7.25 i) | Diligência do gestor, não observável no payload. |
| Exceção de até 100% por devedor (art. 45 §3º; ZIG 6.2) | Fora do MVP (ADR-0006). |
