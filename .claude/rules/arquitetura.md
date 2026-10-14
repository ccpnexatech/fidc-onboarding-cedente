# Regra · Arquitetura do mock (`api/`)

Vale a partir da ADR-0002 (stack do mock). Até lá, os princípios abaixo orientam a escolha.

- Um módulo por contexto (`batch`, `eligibility`, `reconciliation`), cada um com `domain/` e `infrastructure/`.
- `domain/` não importa nada de `infrastructure/` nem de framework. As camadas são travadas por dependency-cruiser no CI.
- Composição só no `*.module.ts`. O controller recebe o use case pronto.
- Use case nunca chama outro use case. Comunicação entre módulos é feita por porta em `domain/service`.
- Sem métodos estáticos, sem valor sentinela no lugar de `null`, sem abreviações em nomes.
- Exceção de domínio é específica (`DueDateTooShortException`); exceção de domínio genérica vira 422.
- Código e payload em inglês camelCase; termos conforme `docs/glossario.md`.
- Comentários no código: decisão pendente (ADR-0003). Até lá, não adicionar comentários além do necessário para explicar uma regra `RN-NN`.
