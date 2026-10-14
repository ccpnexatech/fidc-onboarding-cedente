# Regra · Requisitos (`docs/discovery/`)

## Regras de negócio

- Identificador `RN-NN`. Cada regra tem: enunciado, motivo no contexto FIDC, fonte (premissa `PR-NN` ou regulamento), exemplo válido e exemplo inválido.
- Uma regra testável descreve um dado observável no payload da remessa. Se não dá para testar, é premissa, não regra.
- Cada regra gera um código de rejeição estável (por exemplo, `RN-03_DUE_DATE_TOO_SHORT`), que o P2 reutiliza.

## Histórias

- Formato: "Como <papel>, quero <ação>, para <benefício>". Papéis possíveis: cedente, analista da gestora, custodiante, operação.
- Identificador `HU-NN`, com a lista de `RN-NN` que ela cobre.
- Critérios de aceite em Gherkin (pt-BR, `Funcionalidade/Cenário/Dado/Quando/Então`), com pelo menos um caminho feliz e um de erro.
- Rastreabilidade: toda `RN` aparece em ao menos uma `HU`; toda `HU` vira uma issue (`/historia`).

## Backlog

- Priorização por RICE com a escala explícita (Reach, Impact, Confidence, Effort) e a justificativa de cada nota.
- Corte de MVP por MoSCoW depois do RICE. Se o MoSCoW contrariar o RICE, explicar o porquê.
