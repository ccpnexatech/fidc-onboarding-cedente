# Regra · ADRs (`decisoes/`)

- Uma decisão por arquivo: `NNNN-titulo-em-kebab.md`, número sequencial com 4 dígitos.
- Estrutura fixa: cabeçalho (Status, Data, Issue), **Problema**, **Opções**, **Decisão**, **Consequências**.
- **Problema**: 2–4 linhas, sempre amarrado ao contexto FIDC.
- **Opções**: 2–3, cada uma com prós e contras; a recomendação de Claude fica marcada.
- **Decisão**: o raciocínio é do Caio, com as palavras dele. Claude não escreve essa seção; deixa um comentário pedindo o texto e mantém o status `proposta`.
- Só vira `aceita` quando a seção Decisão estiver preenchida pelo Caio.
- ADR aceita não é editada. Mudou de ideia: nova ADR com `substituída por NNNN` na antiga.
- Atualizar o índice em `decisoes/README.md` no mesmo PR.
