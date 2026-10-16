# ADR-0007 · Automação do fluxo: GitHub Actions move o quadro e registra o histórico na issue

- **Status:** aceita
- **Data:** 2026-10-15
- **Issue:** #30 (também orienta #31, #32 e #33)

## Problema

Hoje o card só anda quando alguém roda `gestao/quadro.sh`, e o status report e as métricas dependem de lembrar. Além disso, a API do GitHub Projects não guarda quando o card entrou em In progress, e esse é o início do lead time pela regra (`.claude/rules/gestao.md`). Num FIDC, a mesma lógica vale para a esteira de cessão: controle que depende de alguém lembrar falha, e o que não tem trilha não se audita.

## Opções

1. **GitHub Actions com token pessoal e histórico em comentário na issue** (recomendada).
   - Como funciona: um workflow reage a branch criada, PR aberto e issue fechada, move o card e comenta na issue a mudança de coluna, com um marcador que o `metricas.sh` lê.
   - Prós:
     - cobre as quatro colunas;
     - o histórico fica na própria issue, público e com data do servidor;
     - não exige commit na `main` para registrar movimento;
     - a mesma lógica roda local (`quadro.sh`) e no CI.
   - Contras:
     - precisa de um token pessoal no secret `PROJECT_TOKEN`, porque projeto de usuário não aceita o `GITHUB_TOKEN`;
     - cada mudança gera um comentário na issue.
2. **Só os workflows nativos do Project** (configurados na interface: item fechado → Done, item adicionado → Todo).
   - Prós: sem token e sem código.
   - Contras:
     - não move para In progress nem para Review;
     - não guarda histórico, então o lead time continua aproximado pelo primeiro commit.
3. **Manter manual** com `quadro.sh` e o log em `quadro.csv`.
   - Prós: nada novo para manter.
   - Contras:
     - depende de disciplina;
     - cada movimento vira mudança de arquivo, que precisa de PR para chegar à `main`, e isso é ruído no histórico.

**Leitura de mercado:**
- **Gestora e administrador:** o que vale numa operação de FIDC é o controle automático com trilha de auditoria. O custodiante e o auditor perguntam "quem mudou, quando e por quê", e o comentário na issue responde isso sem planilha paralela.
- **Risco coberto:** métrica de fluxo calculada sobre dado incompleto. Hoje o "Início → PR" dá 0,0 porque o dado não existe.
- **O que faria mudar de ideia:**
  - o projeto migrar para uma organização, onde um GitHub App substitui o token pessoal;
  - o barulho dos comentários incomodar quem acompanha as issues.

## Decisão

Opção 1, com o token do próprio `gh` do Caio no secret `PROJECT_TOKEN` (escolha dele, em vez de um token dedicado só com `project` e `public_repo`).

Escolhi essa opção para ter maior controle do fluxo junto ao Claude.

Sobre o token: o controle fica com o operador, e o foco é destruir o token depois do uso.

## Consequências

- **Movimento automático do card** (`.github/workflows/quadro.yml`, `gestao/quadro-evento.sh`):
  - branch `tipo/<nº>-descricao` → In progress;
  - PR com `Closes #N` → Review;
  - issue fechada → Done;
  - issue aberta → Todo.
- **Quadro manual:** o `gestao/quadro.sh` continua servindo para mover à mão e agora registra a mudança como comentário. O `quadro.csv` fica congelado como histórico até 2026-10-15 e ainda é lido pelo `metricas.sh` como segunda fonte.
- **WIP:** passar de 2 itens em In progress gera aviso no comentário e no Actions. Não bloqueia.
- **Risco do token:** o token tem escopos amplos (repo, workflow, gist). Se vazar, dá acesso a todos os repositórios do Caio. Mitigação: nenhum workflow roda código de fork com o secret (só `pull_request`, nunca `pull_request_target`). Revisar e trocar por um token de escopo mínimo quando possível.
- **Sem o secret:** o job pula com aviso, sem deixar o CI vermelho.
