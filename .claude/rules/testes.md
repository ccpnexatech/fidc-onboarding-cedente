# Regra · Testes e homologação (`api/`)

- **Unit**: use case isolado, com mocks das portas. Um teste por cenário Gherkin da história correspondente.
- **Integration**: sem mocks, com repositório em memória ou Postgres.
- **Homologação (Postman/Newman)**: a coleção é a prova de aceite da integração. Mínimo de 15 casos, cobrindo sucesso, cada regra `RN-NN` violada, payload inválido, reenvio idempotente e conflito de idempotência.
- Cada request da coleção cita no nome a história e a regra (`HU-03 · RN-02 · vencido`).
- A coleção roda no CI via Newman; vermelho na coleção bloqueia o merge.
- SQL de conciliação tem dados de teste com pelo menos um caso de cada divergência: faltante, valor divergente e duplicado.
