# Glossário

Termos de domínio são escritos em português na documentação e em inglês no código ([ADR-0004](../decisoes/0004-idioma.md)).

| Termo (pt-BR) | No código | Definição |
|---|---|---|
| FIDC | `fund` | Fundo de Investimento em Direitos Creditórios, que adquire recebíveis de empresas. |
| Cedente | `assignor` | Empresa que vende (cede) seus recebíveis ao fundo. |
| Sacado | `debtor` | Devedor do recebível, em geral o cliente do cedente. |
| Recebível / direito creditório | `receivable` | Valor a receber, como duplicata ou parcela, com vencimento e sacado. |
| Remessa | `batch` | Lote de recebíveis enviado pelo cedente para análise e cessão. |
| Cessão | `assignment` | Transferência do recebível do cedente para o fundo. |
| Elegibilidade | `eligibility` | Conjunto de critérios que um recebível precisa cumprir para ser aceito. |
| Rejeição | `rejection` | Recebível recusado, com o motivo (regra violada). |
| Concentração | `concentration` | Peso de um sacado ou cedente na carteira, limitado pelo regulamento. |
| Gestora | `manager` | Responsável pela política de investimento e pela análise dos recebíveis. |
| Custódia / custodiante | `custodian` | Responsável por guardar e controlar os recebíveis do fundo. |
| Conciliação | `reconciliation` | Comparação entre o que foi remetido e o que está na custódia. |
| Duplicata mercantil | `TRADE_BILL` | Título emitido a partir de uma nota fiscal de venda de mercadoria (Lei 5.474/1968). |
| Duplicata de serviço | `SERVICE_BILL` | Título emitido a partir de uma nota fiscal de prestação de serviço. |
| Chave da NF-e | `invoiceKey` | Chave de acesso de 44 dígitos da nota fiscal eletrônica; comprova que a venda ocorreu (lastro performado). |
| PL (patrimônio líquido) | `netAssetValue` | Valor do fundo; base dos limites de concentração. |
| Grupo econômico | `economicGroup` | Empresas sob controle comum; contam como um só devedor no limite de concentração (art. 45 §1º). |
| Taxa de desconto | `annualDiscountRateBasisPoints` | Taxa anual pela qual o fundo compra o título, em pontos-base (1% = 100). |
| Prazo médio ponderado | `weightedAverageTerm` | Média dos prazos até o vencimento, em dias úteis, ponderada pelo valor de face. |
| Data de referência | `referenceDate` | Data da cessão usada para avaliar vencimento, atraso e prazo. |
| Chave de idempotência | `Idempotency-Key` | Header que identifica um envio; o reenvio com a mesma chave não cria nova remessa. |
| Divergência | `discrepancy` | Diferença entre remessa e custódia: faltante, valor divergente ou duplicado. |
