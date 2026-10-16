# ADR-0006 · Regulamentos-modelo: BMA como base, Solis como complemento

- **Status:** aceita
- **Data:** 2026-10-14
- **Issue:** —

## Problema

O projeto simula um FIDC multicedente que compra duplicatas. Pela ADR-0005, a norma é o piso e o regulamento restringe; falta o regulamento que dá os números das restrições (limites por cedente e sacado, prazo, tipo de título). Os fundos da Solis Investimentos lidos até aqui não trazem limites de pulverização: o Estruturado ZIG compra principalmente CCBs, contratos, debêntures e notas comerciais, e o Solis Warehouse admite um único cedente com até 100% do PL. Os da Solis trazem, porém, regras de remessa que o BMA não tem.

## Opções

1. **BMA FIDC Multissetorial como base, regras de remessa da Solis como complemento** (recomendada). O BMA (vigente em 01/06/2026) dá os limites de pulverização: multicedente, no mínimo 80% em duplicatas, limites explícitos nos itens 7.24 e 7.25. O ZIG (item 6.1 VI) e o Warehouse (item 6.1 I e II) dão inadimplência do sacado e taxa mínima de aquisição. Prós: cada regra rastreável a um documento público; limites mais restritivos que o art. 45 do Anexo II (4% contra 20% por devedor), o que exercita a ADR-0005; regras de remessa simples de observar no payload. Contras: duas famílias de regulamento para manter e citar; parte dos limites é de carteira e exige uma posição simulada no mock.
2. **Solis Warehouse como modelo único.** Prós: uma só gestora como fonte. Contras: com até 100% em um cedente, sobram poucas regras de concentração; o projeto deixa de ser um FIDC multicedente de duplicatas.
3. **Só o BMA.** Prós: uma fonte, mais simples. Contras: perde as regras de inadimplência do sacado e de taxa mínima.

## Decisão

Opção 1.

Sobre o BMA como base: "Motivo claro, temos um norte regulamentado e com regras bem definidas."

Sobre a Solis como complemento: o BMA é a base, e a Solis acrescenta robustez às regras.

Sobre manter duas fontes: vejo como uma adaptação que aumenta a chance de sucesso e dá mais exposição a regras diferentes.

## Consequências

- Fontes arquivadas em `docs/fontes/`: `regulamento-bma-fidc-multissetorial-2026-06-01.pdf` (Fundos.NET, id 1216372) e `regulamento-fidc-solis-warehouse-2026-09-17.pdf` (site da Hemera DTVM); o ZIG é arquivado pela ADR-0005. As regras citam a versão; mudança de versão de um regulamento é revisada, não seguida automaticamente.
- Nos dois fundos da Solis, o item 6.1 determina que os critérios de elegibilidade sejam validados pela gestora antes da cessão: é esse passo que a API automatiza.
- Cada cláusula é classificada antes de virar regra:
  - **Remessa** (dado observável no payload, vira `RN`): título não vencido na cessão e crédito performado (BMA 7.25); tipo do título (BMA 7.24 h); sacado sem atraso acima do limite (ZIG 6.1 VI, 30 dias; Warehouse 6.1 II, 15 dias; valor a escolher na RN); taxa de aquisição mínima de 120% do DI (Warehouse 6.1 I).
  - **Carteira** (exige posição da carteira e PL de referência, vira `RN` com dependência do P2): 7,5% por cedente e 4% por sacado, com grupo econômico; 5 maiores cedentes até 25% e 5 maiores sacados até 12%; no mínimo 80% em duplicatas; até 10% em operações comissárias; até 5% em títulos prorrogados; prazo médio ponderado até 75 dias úteis (BMA 7.24 e 7.25).
  - **Fundo** (fora do escopo da remessa, vira premissa ou contexto): taxa de retorno projetada mínima e cotas subordinadas júnior detidas por cotistas vinculados (BMA 7.24 k e l); titularidade e ausência de ônus (diligência do gestor).
- Quando BMA e Solis tratam do mesmo ponto com números diferentes, vale o mais restritivo, coerente com a ADR-0005.
- A exceção do art. 45, §3º (ZIG 6.2) fica fora do MVP.
- O repositório cita os fundos apenas como fonte pública: sem marca, sem afirmar que é sistema de qualquer gestora.
- PR-02 e PR-03 em `premissas.md` passam a citar esses regulamentos como modelo.
