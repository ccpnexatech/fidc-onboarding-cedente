# Leia em 2 minutos

Projeto de portfólio de Caio Ponte. Mostra, de ponta a ponta, como um Analista de Negócios transforma um processo manual de um fundo de investimento em um processo digital, com regras claras e verificáveis.

## O problema

Um FIDC (fundo de investimento em direitos creditórios) compra duplicatas de empresas, chamadas **cedentes**. Antes de comprar, o fundo confere se cada título pode entrar na carteira.

Hoje, no processo de referência:

- o cedente manda a lista de títulos em planilha, por e-mail;
- a equipe confere título por título, à mão;
- o título recusado volta em texto livre, sem padrão, e o cedente não sabe exatamente o que corrigir;
- a conferência com o banco que guarda os títulos (custodiante) é feita dias depois, cruzando planilhas com PROCV.

Consequências:

- **Retrabalho:** idas e vindas de e-mail até o lote ficar correto.
- **Compra em duplicidade:** o mesmo título pode ser pago duas vezes.
- **Desenquadramento:** o fundo pode passar dos limites do próprio regulamento sem perceber.

## O que eu fiz

| Etapa | Entrega | Para quem serve |
|---|---|---|
| Entender | Mapa do processo atual com 9 pontos de falha ([AS-IS](docs/discovery/as-is.md)) | Gestor e operação: onde o processo quebra hoje |
| Definir regras | 10 regras de aceite de títulos, cada uma ligada à norma ou ao regulamento ([regras](docs/discovery/regras.md)) | Risco e compliance: o que entra e por quê |
| Especificar | 11 histórias de usuário com critérios de aceite ([histórias](docs/discovery/historias.md)) | Time de desenvolvimento: o que construir |
| Priorizar | Backlog ordenado por impacto e esforço ([backlog](docs/discovery/backlog.md)) | Gestor: o que fazer primeiro |
| Contrato | Especificação da integração entre cedente e fundo ([API](api/README.md)) | TI do cedente: como enviar os títulos |
| Homologar | 29 testes automáticos que provam que cada regra funciona ([homologação](api/postman/README.md)) | Operação e TI: segurança para ir à produção |
| Conciliar | Conferência automática entre o que foi comprado e o que o custodiante registrou ([conciliação](api/sql/README.md)) | Back office: fim do PROCV |
| Comunicar | E-mail de rejeição ao cedente e resumo para a diretoria ([comunicação](docs/comunicacao/resumo-diretoria.md)) | Cedente e diretoria |

## Três decisões de negócio que eu defendo

1. **Rejeição parcial.** Um título com problema não derruba o lote inteiro. Os títulos bons são comprados; os ruins voltam com o motivo e a forma de corrigir. O cedente não espera, e o fundo não perde a operação.
2. **A norma é o piso; o regulamento só aperta.** A CVM permite até 20% do patrimônio do fundo em um mesmo devedor. O regulamento usado como modelo (BMA) limita a 4%. Quando as fontes divergem, vale a mais restritiva ([ADR-0005](decisoes/0005-hierarquia-das-fontes.md)).
3. **Reenvio não duplica a compra.** Se a conexão cair e o cedente reenviar o mesmo lote, o fundo reconhece o reenvio e devolve a resposta original, sem comprar de novo.

## O que é simulado

- O fundo, os cedentes e os títulos são fictícios. As regras vêm de documentos públicos reais (CVM 175 e regulamentos de FIDCs).
- Seis suposições sobre a operação ainda precisam ser confirmadas com quem opera FIDC ([premissas](premissas.md)). O [roteiro de validação](docs/discovery/roteiro-validacao.md) define as perguntas.
- Uma descoberta mudou o plano: os fundos de recebíveis comerciais da Solis encontrados são FIC-FIDC, ou seja, compram cotas de outros fundos, não duplicatas. Por isso o regulamento-modelo passou a ser o do BMA, com regras pontuais da Solis ([ADR-0006](decisoes/0006-regulamentos-modelo.md)).

## Como trabalhei com IA

Usei o Claude Code como executor: ele escreveu boa parte do código, dos testes e dos textos a partir das minhas instruções. As escolhas com alternativa real passaram por um portão de decisão, registrado em [ADRs](decisoes/README.md). Em parte do projeto deleguei as decisões recomendadas para acelerar; depois revisei cada uma e reescrevi a justificativa com as minhas palavras. O que a IA não substitui está aqui: escolher as fontes, decidir o que é regra e o que é premissa, e defender essas escolhas.

## Por onde seguir

- **Gestor:** [resumo para a diretoria](docs/comunicacao/resumo-diretoria.md) → [decisões](decisoes/README.md) → [métricas de fluxo](gestao/metricas.md).
- **Cliente ou operação:** [e-mail de rejeição ao cedente](docs/comunicacao/rejeicao-cedente.md) → [regras](docs/discovery/regras.md) → [processo atual](docs/discovery/as-is.md).
- **Técnico:** [visão técnica](README.md) → [API](api/README.md) → [referência da API](site/api.html ':ignore').
