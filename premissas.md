# Premissas

Suposições sobre o FIDC simulado. Cada uma tem um jeito de ser validada e um status. Quando uma premissa cai, a mudança vira ADR.

| # | Premissa | Por que importa | Como validar | Status |
|---|---|---|---|---|
| PR-01 | O cedente hoje envia a carteira por planilha, por e-mail, e recebe as rejeições do mesmo jeito. | Define o AS-IS e o tamanho do ganho. | Comparar com regulamentos e materiais públicos de FIDCs; conversa com quem opera. | a validar |
| PR-02 | A elegibilidade é validada pela gestora antes da cessão, com base nos critérios do regulamento do fundo. | Define onde as regras do P1 moram. | Ler 2–3 regulamentos públicos de FIDC (critérios de elegibilidade e condições de cessão). | a validar |
| PR-03 | Os critérios típicos incluem vencimento mínimo/máximo, sacado válido, limite de concentração por sacado/cedente e vedação de duplicidade. | Base das 10 regras do P1. | Mesmos regulamentos de PR-02. | a validar |
| PR-04 | A custódia recebe o lote aceito e gera uma posição que pode ser conciliada com a remessa. | Base do SQL de conciliação do P2. | Ler material público sobre custódia de FIDC (CVM 175 e anexo de FIDC). | a validar |
| PR-05 | Reenvio do mesmo lote é comum (falha de rede, timeout) e não pode gerar cessão duplicada. | Justifica a idempotência por `Idempotency-Key`. | Padrões de mercado de APIs financeiras; conversa com quem opera. | a validar |

Status possíveis: `a validar`, `validada`, `ajustada` (com link para a ADR), `descartada`.
