# Resumo para a diretoria

**Onboarding digital de remessas de cedentes · uma página**

## Problema

O fundo compra duplicatas de cedentes por planilha e e-mail. A conferência é manual, a rejeição volta em texto livre e a conciliação com o custodiante é feita dias depois, por PROCV. Isso gera retrabalho com o cedente, risco de pagar duas vezes pelo mesmo título e risco de o fundo sair dos limites do próprio regulamento sem perceber ([processo atual](../discovery/as-is.md), 9 pontos de falha).

## Solução

Uma API de remessa que aplica, no momento do envio, as 10 regras de aceite do fundo, cada uma ligada à CVM 175 ou ao regulamento.

- O título bom é aceito na hora; o ruim volta com código e motivo, sem derrubar o lote.
- O reenvio do mesmo lote não gera nova compra.
- A conciliação com o custodiante é automática e aponta título faltante, valor divergente e duplicidade.

O piloto está construído e homologado: 29 testes automáticos provam cada regra ([homologação](../../api/postman/README.md)).

## Riscos que caem

| Risco | Hoje | Com a solução |
|---|---|---|
| Desenquadramento por concentração | Percebido no fechamento do mês | Barrado no envio (limite de 4% por sacado e 7,5% por cedente) |
| Compra em duplicidade | Depende de conferência manual | Barrada no envio e no reenvio |
| Duplicata sem nota fiscal | Aceita "para não perder a operação" | Rejeitada sem exceção |
| Sacado inadimplente recebendo nova cessão | Depende de consulta à planilha | Barrado no envio |
| Divergência com a custódia | Descoberta dias depois | Relatório automático |
| Retrabalho com o cedente | E-mails de ida e volta | Motivo e correção em cada título |

## O que falta validar

Seis premissas dependem de conversa com quem opera FIDC ([premissas](../../premissas.md), [roteiro de 30 minutos](../discovery/roteiro-validacao.md)). As de maior impacto:

- qual base de cálculo o administrador usa nos limites de concentração (valor de face ou de aquisição, PL de qual data);
- de onde vem o cadastro de grupo econômico do sacado;
- o formato do arquivo de posição do custodiante.

## Próximos passos

| Item | O quê | Por quê |
|---|---|---|
| M-01 | Reserva de limite na carteira | Hoje, duas remessas simultâneas do mesmo sacado podem, juntas, passar do limite de 4%. |
| M-02 | Autenticação do cedente | Hoje um cedente poderia enviar remessa em nome de outro. |

Detalhes técnicos em [`api/README.md`](../../api/README.md#melhorias-propostas).

## Pedido de decisão

Aprovar **uma entrevista de validação** com a operação e o custodiante e, em seguida, **M-01 antes de M-02**: o risco de desenquadramento atinge o fundo inteiro, enquanto o de autenticação pode ser contido no piloto restringindo o acesso a cedentes conhecidos.
