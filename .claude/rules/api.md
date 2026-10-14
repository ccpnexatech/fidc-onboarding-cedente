# Regra · Contrato da API (`api/openapi.yaml`)

- OpenAPI 3.x. O contrato vem antes do código: mudança de comportamento começa no `openapi.yaml`.
- Caminhos em pt-BR, que são o vocabulário do cliente (`/remessas`, `/rejeicoes`); campos do payload em inglês camelCase (`assignorId`, `dueDate`).
- `POST /remessas` exige o header `Idempotency-Key`. Mesma chave com o mesmo corpo devolve a resposta original; mesma chave com corpo diferente devolve 409.
- Erros no formato `application/problem+json` (RFC 9457), com `code` igual ao código da regra (`RN-NN_...`) quando a causa for de negócio.
- Status: 201 remessa recebida, 400 payload malformado, 409 conflito de idempotência, 422 regra de negócio violada no lote inteiro, 404 remessa inexistente.
- Rejeição de recebível individual não falha a remessa: ela vai para `GET /remessas/{id}/rejeicoes`.
- Todo endpoint tem exemplo de sucesso e de erro no próprio contrato.
- Valores monetários em centavos (inteiro); datas em ISO 8601 (`YYYY-MM-DD`).
