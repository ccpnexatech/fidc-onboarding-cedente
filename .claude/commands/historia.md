---
description: Cria a issue de uma história com regras e Gherkin e põe no quadro
argument-hint: <descrição da necessidade>
---

Transforme "$ARGUMENTS" em uma história seguindo `.claude/rules/requisitos.md`.

1. Escreva a história ("Como / quero / para"), as regras `RN-NN` que ela cobre e os critérios de aceite em Gherkin (um caminho feliz e ao menos um de erro).
2. Se a necessidade exigir uma regra que ainda não existe em `docs/discovery/regras.md`, pare e leve ao portão de decisão antes de criar a issue.
3. Mostre o texto ao Caio e espere aprovação.
4. Com aprovação, crie a issue usando o template "História" (`gh issue create --template historia.md`), com o label `historia`.
5. Adicione a issue ao GitHub Project do repo na coluna Todo (`gh project item-add`).
6. Responda com o número da issue e o link.
