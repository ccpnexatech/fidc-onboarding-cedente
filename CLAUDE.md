# CLAUDE.md — fidc-onboarding-cedente

Projeto-portfólio de Caio Ponte: onboarding digital de cedentes em um FIDC simulado, do discovery à API homologada. O objetivo é **provar raciocínio de Analista de Negócios** (requisitos → contrato → homologação → conciliação), com cada decisão registrada publicamente.

## Papéis (regra de ouro)

- **Caio decide. Claude executa.** Toda escolha com alternativa real passa pelo portão de decisão abaixo. Claude nunca decide sozinho.
- Claude não faz merge, não publica e não fecha issue sem aprovação explícita no chat ou na revisão do PR.

## Portão de decisão

1. **Problema**: o que precisa ser resolvido e por que importa no contexto FIDC (2–4 linhas).
2. **Opções**: 2–3 caminhos, com prós e contras e uma recomendação marcada.
3. **Decisão**: Caio escolhe e explica com as próprias palavras.
4. **Registro**: `/adr` cria `decisoes/NNNN-titulo.md` com o raciocínio de Caio, abre PR e linka a issue.

Não é portão: formatação, nomes internos óbvios e correções que já seguem uma regra existente.

## Fluxo de trabalho (GitHub CLI)

```
issue (história) → branch tipo/<nº-issue>-descricao → commits → gh pr create → revisão do Caio → merge → card "Done"
```

- Quadro: GitHub Project vinculado ao repo (Todo → In progress → Review → Done, WIP 2). O card anda sozinho pela branch, pelo PR e pelo merge (ADR-0007).
- Uma issue = uma história ou tarefa, com critérios de aceite em Gherkin.
- PR: "o que / por que / como validei" + `Closes #N`.
- Commits: Conventional Commits em pt-BR, minúsculo, sem ponto final. Tipos: `feat fix refactor docs test chore ci`.

## Comandos

```bash
make setup     # instala dependências e sobe o Postgres
make check     # lint + tipos + arquitetura + testes + lint OpenAPI (rodar antes de todo PR)
make api       # sobe o mock da API e o Swagger em /docs
make newman    # roda a coleção Postman
make conciliacao  # testa o SQL de conciliação no Postgres
make docs      # serve o site de documentação
```

A `main` está sempre verde. Se algo falha, a falha é da mudança atual.

## Mapa do repositório

| Pasta | Conteúdo | Regra |
|---|---|---|
| `docs/discovery/` | P1: AS-IS, regras, histórias, backlog | `.claude/rules/requisitos.md` |
| `api/` | P2: `openapi.yaml`, mock NestJS, Postman, SQL | `.claude/rules/arquitetura.md`, `api.md`, `testes.md` |
| `gestao/` | P3: status reports, métricas de fluxo | `.claude/rules/gestao.md` |
| `decisoes/` | ADRs (uma decisão por arquivo) | `.claude/rules/adr.md` |
| `diario/` | Diário de bordo por sessão | `.claude/rules/diario.md` |
| `premissas.md` | Suposições sobre o FIDC e como validar cada uma | — |

**Leia só a regra da pasta que a tarefa toca.** Não carregue todas.

## Comandos de projeto (`.claude/commands/`)

- `/adr <título>`: registra a decisão tomada no portão.
- `/historia <descrição>`: cria a issue com história, regras e Gherkin, e põe no quadro.
- `/diario`: abre ou fecha a entrada da sessão (hipótese → descoberta → próxima dúvida).
- `/entrega`: roda `make check`, abre o PR no formato padrão e move o card.

## Princípios de código (resumo — detalhe em `.claude/rules/arquitetura.md`)

Herdados do itarget.backend e do mobile:
- Módulos com `domain/` e `infrastructure/`. Camadas travadas por dependency-cruiser no CI.
- Composição só no `*.module.ts`. O controller recebe o use case pronto.
- Use case nunca chama outro use case. Cross-módulo é feito por porta em `domain/service`.
- Sem métodos estáticos, sem valor sentinela para `null`, sem abreviações.
- Exceção de domínio específica; a genérica vira 422.
- Código e payload em inglês camelCase. Documentação em pt-BR (en auxiliar).
- Unit com mocks de portas; Integration sem mocks (repositório Memory ou Postgres).
- Comentários no código: só `// RN-NN · <fonte>` onde a regra é aplicada (ADR-0003).

## Idioma

- pt-BR é o principal; `en` é auxiliar, traduzido ao fim de cada entrega, nunca bloqueando o fluxo.
- Termos de domínio ficam em português no texto (cedente, sacado, remessa) e em inglês no código (`assignor`, `debtor`, `batch`), com glossário em `docs/glossario.md`.

## Economia de contexto

- Não reler arquivos já lidos na sessão. Não colar saídas longas: resumir e apontar o caminho.
- Preferir `make check` a checagens manuais.
- Dúvida de regra: abrir o arquivo de regra específico, não o repo inteiro.
