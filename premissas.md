# Premissas

Suposições sobre a operação do FIDC simulado, cada uma com método de validação e status. A premissa invalidada gera uma ADR com a mudança decorrente.

As premissas `a validar` são cobertas pelo [roteiro de validação](docs/discovery/roteiro-validacao.md), uma entrevista de 30 minutos com quem opera FIDC.

| # | Premissa | Por que importa | Como validar | Status |
|---|---|---|---|---|
| PR-01 | O cedente hoje envia a carteira por planilha, por e-mail, e recebe as rejeições do mesmo jeito. | Define o AS-IS e o tamanho do ganho. | Comparar com regulamentos e materiais públicos de FIDCs; conversa com quem opera. | a validar |
| PR-02 | A elegibilidade é validada pela gestora antes da cessão, com base nos critérios do regulamento do fundo. | Define onde as regras do P1 moram. | Lidos os regulamentos do ZIG e do Solis Warehouse (item 6.1: "validados pela GESTORA previamente à cessão") e do BMA (7.24, 7.25). | validada ([ADR-0005](decisoes/0005-hierarquia-das-fontes.md), [ADR-0006](decisoes/0006-regulamentos-modelo.md)) |
| PR-03 | Os critérios típicos incluem vencimento, sacado válido, limite de concentração por sacado e cedente e vedação de duplicidade. | Base das 10 regras do P1. | Confirmados no BMA (7.24 a, b; 7.25 ii, iii, iv) e na Solis (ZIG 6.1; Warehouse 6.1). Vencimento máximo por título não aparece; o que aparece é o prazo médio da carteira (RN-03). | ajustada ([ADR-0006](decisoes/0006-regulamentos-modelo.md)) |
| PR-04 | A custódia recebe o lote aceito e gera uma posição que pode ser conciliada com a remessa. | Base do SQL de conciliação do P2. | Ler material público sobre custódia de FIDC (CVM 175 e anexo de FIDC). | a validar |
| PR-05 | Reenvio do mesmo lote é comum (falha de rede, timeout) e não pode gerar cessão duplicada. | Justifica a idempotência por `Idempotency-Key`. | Padrões de mercado de APIs financeiras; conversa com quem opera. | a validar |
| PR-06 | Os limites de concentração são medidos pelo valor de face dos títulos sobre um PL de referência fixo (R$ 50 milhões no fundo simulado). | Define o cálculo de RN-07 e RN-08. | No fundo real, o PL é o do fim do mês anterior (ZIG 5.19) e a base pode ser o valor de aquisição. Confirmar com quem opera qual base o administrador usa. | a validar |
| PR-07 | O grupo econômico do sacado é aproximado pela raiz do CNPJ (8 primeiros dígitos). | Define a soma por grupo em RN-07 (art. 45 §1º). | Na prática a gestora mantém um cadastro de grupos (controladoras, coligadas). A raiz do CNPJ só pega matriz e filiais. Confirmar a fonte do cadastro com quem opera. | a validar |
| PR-08 | O custodiante entrega a posição como um arquivo por título (identificador, cedente, valor), que pode ser carregado em tabela. | Define a entrada do SQL de conciliação (HU-11). | Ver layout de arquivo de posição de um custodiante real (CNAB ou arquivo próprio). | a validar |

Status possíveis: `a validar`, `validada`, `ajustada` (com link para a ADR), `descartada`.
