# ADR-0005 · Hierarquia das fontes: norma é piso, regulamento restringe

- **Status:** aceita
- **Data:** 2026-10-14
- **Issue:** —

## Problema

As regras de elegibilidade (PR-02, PR-03) podem vir da norma (Resolução CVM 175, Anexo Normativo II) ou do regulamento do fundo, e as duas divergem. Para concentração, o art. 45 do Anexo II limita um mesmo devedor a 20% do PL; o item 6.2 do regulamento do FIDC Estruturado ZIG eleva esse limite a 100% para devedor companhia aberta, instituição financeira ou com demonstrações auditadas. A fonte escolhida muda a regra que o validador aplica, o código de rejeição da API e os casos de teste.

## Opções

1. **Norma como piso; o regulamento só restringe ou usa exceções que a própria norma autoriza** (recomendada). A regra de concentração fica em 20% por devedor ou grupo econômico (art. 45, caput e §1º); a exceção do item 6.2 vira regra separada, condicionada ao art. 45, §3º (classe de investidores qualificados) e à comprovação do tipo de devedor. Prós: fiel à hierarquia real das normas; gera Gherkin com caminho feliz, violação e exceção. Contras: uma regra a mais e um dado a mais no payload (tipo do devedor).
2. **O regulamento do ZIG prevalece em tudo.** Prós: simples e concreto, um único documento como fonte. Contras: amarra o projeto a um fundo cuja carteira é majoritariamente de CCBs, contratos, debêntures e notas comerciais, não de duplicatas; sugere ao leitor que 100% por devedor é o padrão.
3. **Só a norma, sem exceções.** Prós: regra única de 20%, fácil de testar. Contras: ignora o que um regulamento real faz com a margem que a norma dá; análise de negócio mais rasa.

## Decisão

Opção 1.

Por ser fiel à hierarquia real das normas.

## Consequências

- PR-02 e PR-03 são reescritas citando primeiro a norma e, depois, o regulamento como restrição ou exceção autorizada.
- A regra de concentração por devedor (20% do PL, grupo econômico consolidado) é uma `RN`; a exceção para companhia aberta, instituição financeira ou demonstrações auditadas é outra `RN`, com o tipo do devedor como dado observável no payload.
- Concentração depende do PL do fim do mês anterior (item 5.19 do regulamento do ZIG), que não está na remessa: o mock precisa de uma fonte para o PL de referência, a definir no P2.
- Verificação de lastro (arts. 36 e 38) é obrigação do gestor e do custodiante, não um dado do payload: entra como premissa e contexto do AS-IS, não como `RN`.
- O ZIG serve de fonte para concentração e lastro, mas não de modelo de FIDC de duplicatas; o regulamento-modelo de compra direta de duplicatas segue em aberto.
- Fontes arquivadas em `docs/fontes/`: `cvm-175-anexo-ii.pdf` (consolidado, site da CVM) e `regulamento-fidc-estruturado-zig-2025-08-01.pdf` (vigente em 01/08/2025, Fundos.NET id 958211).
