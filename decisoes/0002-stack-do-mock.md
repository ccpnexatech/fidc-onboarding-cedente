# ADR-0002 · Stack do mock: NestJS, TypeScript e Postgres

- **Status:** aceita
- **Data:** 2026-10-14
- **Issue:** —

## Problema

O P2 precisa de um mock da API de remessa que aplique de verdade as regras de elegibilidade do P1, para que a coleção Postman homologue comportamento e não apenas exemplos estáticos. Na rotina de uma gestora, é esse mock que a TI do cedente usa para testar a integração antes da produção; se ele não rejeitar como a gestora rejeitaria, a homologação não prova nada. A stack precisa caber em poucos dias e mostrar arquitetura legível.

## Opções

1. **NestJS com TypeScript; repositório em memória por padrão e Postgres opcional** (recomendada). Prós: módulos com injeção de dependência, composição no `*.module.ts` e camadas travadas por dependency-cruiser, como pede `.claude/rules/arquitetura.md`; TypeScript dá tipos para o domínio; Postgres é o mesmo banco do SQL de conciliação. Contras: mais estrutura que um mock comum; mais dependências para instalar.
2. **Mock gerado do OpenAPI (Prism).** Prós: zero código, sobe em minutos, sempre fiel ao contrato. Contras: devolve só os exemplos do contrato e não aplica regra nenhuma; a homologação vira teste do exemplo, não do negócio.
3. **Express ou Fastify mínimos.** Prós: menos estrutura e menos dependências. Contras: a composição e as camadas ficam por conta da disciplina; perde o padrão de módulos que o projeto quer demonstrar.

## Decisão

Opção 1. É uma stack forte, moderna e segura, e rápida de construir para um projeto pequeno.

O que aceito perder: estruturar do zero demora mais e cria mais dependências. Em troca, a inversão de dependências funcionou bem, e essa estrutura fica reutilizável em outros projetos.

## Consequências

- `api/` é um projeto Node 24 com NestJS, Jest, ESLint, `tsc` e dependency-cruiser, todos dentro de `make check`.
- O contrato manda: o corpo de `POST /remessas` é validado contra o schema do próprio `openapi.yaml` (Ajv). Mudar o payload exige mudar o contrato primeiro.
- O repositório em memória é o padrão do `make api` e dos testes de integração; o adaptador Postgres é ligado por variável de ambiente e usado pelo SQL de conciliação.
- Postgres sobe por Docker Compose (`make setup`).
