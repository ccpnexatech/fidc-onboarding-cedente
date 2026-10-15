---
description: Roda make check, abre o PR no formato padrão e move o card
---

1. Rode `make check`. Se falhar, pare, mostre o resumo da falha e corrija antes de seguir.
2. Confirme que a branch segue `tipo/<nº-issue>-descricao` e que os commits seguem Conventional Commits em pt-BR.
3. Abra o PR com `gh pr create` usando `.github/pull_request_template.md`: **O que**, **Por que**, **Como validei**, e `Closes #N`.
4. Confira que o card foi para Review. O workflow `quadro` move sozinho quando o PR tem `Closes #N` (ADR-0007). Se não moveu, use `gestao/quadro.sh <nº> Review`.
5. Responda com o link do PR. Não faça merge: o merge é do Caio.
