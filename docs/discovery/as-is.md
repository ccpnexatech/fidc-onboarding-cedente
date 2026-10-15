# AS-IS · Processo atual de remessa de recebíveis

> Cenário simulado (PR-01), construído a partir da CVM 175 (Anexo II) e dos regulamentos públicos em `docs/fontes/`. Não contém dados reais de cedente, sacado ou fundo.

## Atores

| Ator | Papel no processo | No código |
|---|---|---|
| Cedente | Empresa que vende duplicatas ao fundo para antecipar caixa. | `assignor` |
| Analista da gestora | Valida os critérios de elegibilidade antes da cessão, conforme os regulamentos da Solis (ZIG e Warehouse, item 6.1: validação "previamente à cessão"). | `manager` |
| Custodiante | Guarda e controla os recebíveis cedidos e verifica o lastro (art. 38 do Anexo II). | `custodian` |
| Operação | Concilia o que foi cedido com o que está na custódia. | `reconciliation` |

## Fluxo atual

```mermaid
sequenceDiagram
    autonumber
    participant C as Cedente
    participant A as Analista da gestora
    participant P as Planilha de controle
    participant K as Custodiante
    participant O as Operação

    C->>A: E-mail com planilha da carteira (formato do cedente)
    A->>A: Ajusta colunas e corrige formatos à mão
    A->>P: Consulta exposição por sacado e por cedente
    A->>A: Confere vencimento, taxa, nota fiscal e duplicidade
    A-->>C: E-mail com rejeições em texto livre
    C->>A: Nova planilha, às vezes com a carteira inteira de novo
    A->>K: Lote aprovado para registro e custódia
    K-->>O: Arquivo de posição da custódia
    O->>O: Cruza remessa e custódia em planilha (PROCV)
```

## Pontos de falha

| # | Ponto de falha | Efeito no fundo | Regra ou história que ataca |
|---|---|---|---|
| F-01 | Cada cedente envia a planilha em um formato próprio. | Reformatação manual; erro de digitação vira erro de valor. | HU-01 (contrato único) |
| F-02 | Limites de concentração conferidos em planilha separada, com posição do dia anterior. | Risco de desenquadramento: um sacado acima de 4% do PL (BMA 7.24 b) só é percebido no fechamento do mês. | RN-07, RN-08, HU-06 |
| F-03 | Rejeição devolvida em texto livre por e-mail. | O cedente não identifica qual título corrigir nem o motivo e reenvia a carteira inteira. | HU-09 (rejeições com código estável) |
| F-04 | Reenvio da mesma planilha por falha de e-mail ou dúvida. | O mesmo título é analisado e cedido duas vezes. | RN-09, HU-02 (idempotência) |
| F-05 | Título sem nota fiscal aceito "para não perder a operação". | Crédito não performado; risco de duplicata fria. | RN-04 |
| F-06 | Sacado em atraso com o fundo continua recebendo cessões. | Aumenta a exposição a um devedor inadimplente. | RN-05 |
| F-07 | Taxa negociada abaixo do mínimo do regulamento. | Rentabilidade abaixo da meta das cotas seniores. | RN-06 |
| F-08 | Conciliação remessa × custódia por PROCV. | Faltantes, valores divergentes e duplicados descobertos tarde. | HU-11 |
| F-09 | Nenhum registro de quem decidiu o quê e quando. | Auditoria e custodiante não conseguem reconstituir a decisão. | HU-10 |

## TO-BE · Processo proposto

```mermaid
sequenceDiagram
    autonumber
    participant C as Sistema do cedente
    participant API as API de remessa
    participant E as Elegibilidade
    participant K as Custodiante
    participant O as Operação

    C->>API: POST /remessas (Idempotency-Key)
    API->>API: Valida o payload contra o contrato (400 se malformado)
    API->>E: Cedente habilitado? (RN-10, 422 se não)
    E->>E: Regras do título e da carteira (RN-01 a RN-09)
    API-->>C: 201 com totais de aceitos e rejeitados
    C->>API: GET /remessas/{id}/rejeicoes
    API-->>C: Rejeições com código estável (RN-NN_...)
    API->>K: Recebíveis aceitos seguem para registro e custódia
    O->>O: SQL de conciliação remessa × custódia
```

Ganhos esperados:
- regras aplicadas de forma uniforme, sobre a posição da carteira no momento da cessão (F-02);
- motivo de cada rejeição em código estável (F-03);
- reenvio sem duplicidade de cessão (F-04);
- conciliação por consulta SQL em vez de planilha (F-08).

## Fora do escopo

- Cobrança, recompra e liquidação financeira da cessão.
- Registro em registradora e verificação de lastro por amostragem (arts. 36 e 38): obrigações do gestor e do custodiante, tratadas como contexto e não como regra da API (ADR-0006).
- Cadastro e análise de crédito do cedente: a API apenas consulta se ele está habilitado (RN-10).
