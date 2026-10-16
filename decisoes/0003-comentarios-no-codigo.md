# ADR-0003 · Comentários no código: só para rastrear regra e fonte

- **Status:** aceita
- **Data:** 2026-10-14
- **Issue:** —

## Problema

O código do mock aplica regras que vêm de norma e de regulamento (ADR-0005, ADR-0006). Quem audita uma rejeição precisa ir da linha de código à regra `RN-NN` e dela à cláusula do regulamento. Em contrapartida, comentário que repete o que o código diz envelhece e mente. É preciso uma política única antes de o P2 começar.

## Opções

1. **Sem comentários, exceto a referência à regra e à fonte** (recomendada). Uma linha do tipo `// RN-07 · BMA 7.24 b` onde a regra é aplicada; o resto é nome claro e teste. Prós: rastreabilidade do código ao regulamento, que é o que um auditor ou um custodiante pergunta; pouco texto para manter. Contras: quem não conhece o domínio precisa ler `docs/discovery/regras.md`.
2. **JSDoc em toda classe e método público.** Prós: documentação no editor. Contras: volume alto, repete tipos e nomes, envelhece rápido.
3. **Comentário livre, a critério de quem escreve.** Prós: zero regra. Contras: inconsistente; a rastreabilidade depende de memória.

## Decisão

Opção 1: sem comentários, apenas documentação, mantendo só a linha `// RN-NN · <fonte>` que liga o código à regra.

Precisamos de documentos, não de comentários. O código é autoexplicativo para quem é da área; por isso usamos clean code.

O que aceito perder: não vejo perdas, já que está tudo bem documentado.

## Consequências

- Cada regra `RN-NN` tem exatamente um ponto de aplicação no código, marcado com `// RN-NN · <fonte>`.
- Explicações de negócio ficam em `docs/discovery/regras.md`, não no código.
- `.claude/rules/arquitetura.md` deixa de citar a 0003 como pendente.
