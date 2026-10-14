---
description: Abre ou fecha a entrada do diário da sessão
---

Siga `.claude/rules/diario.md`.

- Se `diario/<data de hoje>.md` não existe ou não tem **Descoberta** preenchida para a sessão atual: **abrir**. Pergunte ao Caio a hipótese da sessão e registre. Traga a "Próxima dúvida" da entrada anterior como ponto de partida.
- Se a hipótese já está registrada: **fechar**. Proponha a Descoberta (o que foi feito, o que deu errado, ADRs criadas) e a Próxima dúvida, com base nesta conversa e no `git log` da sessão. Espere o Caio ajustar antes de gravar.
- Commit: `docs: diario <data>`.
