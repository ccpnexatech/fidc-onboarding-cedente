# E-mail ao cedente: resultado da remessa

Modelo do e-mail que o cedente recebe depois de enviar uma remessa. Substitui a rejeição em texto livre do processo atual (F-03 em [`as-is.md`](../discovery/as-is.md)). Os códigos são os mesmos devolvidos pela API em `GET /remessas/{id}/rejeicoes`; os motivos seguem os enunciados de [`regras.md`](../discovery/regras.md).

Dados fictícios.

---

**Assunto:** Remessa REM-2026-1014-001 recebida: 46 títulos aceitos, 4 rejeitados

Olá, equipe financeira da Distribuidora Exemplo Ltda.,

Recebemos a remessa **REM-2026-1014-001**, enviada em 14/10/2026 às 10:32.

| Resultado | Títulos | Valor de face |
|---|---|---|
| Aceitos | 46 | R$ 1.184.300,00 |
| Rejeitados | 4 | R$ 168.900,00 |
| **Total** | **50** | **R$ 1.353.200,00** |

Os títulos aceitos seguem para a cessão normalmente. Os rejeitados **não impedem** a remessa: corrija apenas eles e envie em uma nova remessa.

## Títulos rejeitados

| Título | Código | Motivo | Como corrigir |
|---|---|---|---|
| DM-2026-0412 | `RN-02_RECEIVABLE_OVERDUE` | O vencimento (10/10/2026) é anterior à data da cessão (14/10/2026). O fundo não compra título já vencido. | Não reenvie este título. Se a data foi digitada errado, corrija o vencimento conforme a duplicata e envie de novo. |
| DM-2026-0415 | `RN-04_MISSING_INVOICE_EVIDENCE` | A duplicata veio sem a chave de acesso da nota fiscal eletrônica. Sem a nota, não há prova de que a venda aconteceu. | Informe a chave de acesso da NF-e (44 dígitos) e envie de novo. |
| DM-2026-0420 | `RN-07_DEBTOR_CONCENTRATION_EXCEEDED` | Com este título, a exposição do fundo ao sacado (somando as empresas do mesmo grupo) passaria de 4% do patrimônio do fundo (R$ 2.000.000,00). | Não há correção no título. Ele poderá ser aceito quando outros títulos desse sacado forem pagos. Fale com a gestora para consultar o limite disponível. |
| DM-2026-0001 | `RN-09_DUPLICATE_RECEIVABLE` | Este título já foi cedido ao fundo. O mesmo título não pode ser vendido duas vezes. | Retire o título da remessa. Se for um título diferente, confira o número e a nota fiscal: o par cedente + número do título, ou a combinação nota fiscal + vencimento + valor, já existe na carteira. |

## Próximos passos

1. Corrija os títulos indicados acima.
2. Envie uma **nova remessa** só com eles, com uma nova chave de envio.
3. Se reenviar esta mesma remessa por engano, nada é comprado de novo: o sistema reconhece o reenvio e devolve este mesmo resultado.

A lista completa, em formato para sistema, está em `GET /remessas/REM-2026-1014-001/rejeicoes`.

Dúvidas: responda este e-mail ou fale com a mesa de operações.

Atenciosamente,
Gestora do FIDC (simulado)
