---
description: Registra em decisoes/ a decisão tomada no portão
argument-hint: <título da decisão>
---

Registre a decisão "$ARGUMENTS" seguindo `.claude/rules/adr.md`.

1. Descubra o próximo número em `decisoes/` (consulte também os números reservados como `pendente` em `decisoes/README.md`; se o título bater com um reservado, use esse número).
2. Crie `decisoes/NNNN-titulo-em-kebab.md` com Problema, Opções e Consequências a partir do que foi discutido no portão de decisão desta conversa.
3. Na seção **Decisão**, escreva só a opção escolhida e um comentário pedindo o raciocínio do Caio. Não escreva o raciocínio por ele. Status: `proposta`.
4. Atualize o índice em `decisoes/README.md`.
5. Crie a branch `docs/<nº-issue>-adr-NNNN` (ou `docs/adr-NNNN` se não houver issue), faça o commit `docs: registra adr-NNNN <título curto>` e abra o PR linkando a issue.
