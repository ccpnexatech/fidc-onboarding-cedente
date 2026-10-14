# Backlog · RICE e corte de MVP (MoSCoW)

Regra: `.claude/rules/requisitos.md`. As histórias estão em `historias.md`.

## Escala

| Dimensão | Pergunta | Escala |
|---|---|---|
| **Reach** (alcance) | Quantas remessas por mês a história toca, em um fundo com ~40 cedentes ativos enviando ~3 remessas por semana (~500 por mês)? | número de remessas por mês |
| **Impact** (impacto) | Quanto reduz risco de desenquadramento, perda financeira ou retrabalho? | 3 = evita perda ou desenquadramento; 2 = evita retrabalho relevante; 1 = melhora a experiência; 0,5 = mínimo |
| **Confidence** (confiança) | Quão sustentada a nota está nas fontes (regulamento, norma) e não em suposição? | 100% = cláusula de regulamento ou norma; 80% = prática de mercado documentada; 50% = suposição (premissa a validar) |
| **Effort** (esforço) | Esforço de especificação, contrato, código e testes. | pessoa-dia |

**RICE = Reach × Impact × Confidence ÷ Effort.**

## Notas

| História | Reach | Impact | Confidence | Effort | RICE | Justificativa |
|---|---|---|---|---|---|---|
| HU-01 · Enviar remessa pela API | 500 | 2 | 80% | 2,0 | 400 | Toda remessa passa por aqui; tira a reformatação manual (F-01). Confiança de 80% porque o volume é premissa (PR-01). Esforço inclui contrato e esqueleto do mock. |
| HU-06 · Limites de concentração | 500 | 3 | 100% | 1,5 | 1.000 | Toda remessa é checada; estourar limite é desenquadramento (F-02). BMA 7.24 a, b e art. 45 dão os números. Exige posição da carteira. |
| HU-03 · Título inválido na origem | 500 | 2 | 100% | 1,0 | 1.000 | Toda remessa; corta o retrabalho mais frequente. BMA 7.24 h e 7.25 ii, iii. Regras simples de título. |
| HU-07 · Duplicidade | 500 | 3 | 80% | 1,0 | 1.200 | Pagar duas vezes é perda direta (F-04). A chave de duplicidade é prática de mercado, não cláusula literal (80%). |
| HU-02 · Reenvio idempotente | 150 | 3 | 80% | 1,0 | 360 | Afeta só os reenvios (~30% das remessas, PR-05), mas evita cessão dupla. Padrão de APIs financeiras. |
| HU-09 · Consultar rejeições | 300 | 2 | 80% | 0,5 | 960 | Remessas com ao menos uma rejeição (~60%). Resolve o texto livre por e-mail (F-03). |
| HU-04 · Sacado inadimplente | 100 | 3 | 100% | 0,5 | 600 | Poucas remessas têm sacado em atraso, mas cada caso é perda provável. Warehouse 6.1 II. |
| HU-05 · Taxa mínima | 500 | 1 | 100% | 0,5 | 1.000 | Toda remessa; o efeito é rentabilidade, não perda direta (impacto 1). Warehouse 6.1 I. |
| HU-08 · Prazo médio da carteira | 50 | 2 | 100% | 1,0 | 100 | Só títulos longos e grandes mudam o prazo médio. BMA 7.25 iv. Exige calendário de dias úteis. |
| HU-10 · Consultar remessa | 100 | 1 | 80% | 0,5 | 160 | Usada em auditoria e suporte (F-09). |
| HU-11 · Conciliar com a custódia | 500 | 2 | 80% | 1,5 | 533 | Toda remessa aceita é conciliada; hoje é PROCV (F-08). Formato do arquivo da custódia é premissa (PR-04). |

## Ordem por RICE

1. HU-07 (1.200)
2. HU-06, HU-03, HU-05 (1.000)
3. HU-09 (960)
4. HU-04 (600)
5. HU-11 (533)
6. HU-01 (400)
7. HU-02 (360)
8. HU-10 (160)
9. HU-08 (100)

## Corte de MVP (MoSCoW)

| Classe | Histórias | Por quê |
|---|---|---|
| **Must** | HU-01, HU-02, HU-03, HU-06, HU-07, HU-09 | Sem elas não há integração homologável: enviar, reenviar com segurança, barrar o que o regulamento proíbe na origem e nos limites, e dizer ao cedente o motivo. |
| **Should** | HU-04, HU-05, HU-10, HU-11 | Valor alto, mas o fundo opera sem elas por alguns dias com controle manual. HU-11 é a prova de conciliação do P2. |
| **Could** | HU-08 | Afeta poucas remessas e depende de calendário de dias úteis. |
| **Won't (agora)** | Outros tipos de título (cheque, CCB, nota promissória, contrato) com os limites de BMA 7.24 c, d, e; limites dos 5 maiores (BMA 7.24 f, g); exceção do art. 45 §3º. | Fora do fundo simulado de duplicatas (RN-01, ADR-0006). |

### Onde o MoSCoW contraria o RICE

- **HU-01 e HU-02 são Must com RICE menor que HU-05.** Sem o envio (HU-01) nenhuma outra regra roda; sem idempotência (HU-02), um reenvio gera cessão dupla e a homologação reprova. São pré-requisitos, não concorrentes.
- **HU-05 tem RICE alto e é Should.** A taxa vem negociada antes da remessa; errar a taxa reduz retorno, mas não desenquadra o fundo nem gera perda direta como concentração e duplicidade.
- **HU-11 é Should, não Must, apesar de cobrir toda remessa.** A conciliação acontece depois da cessão e já existe em planilha; o ganho é velocidade, não bloqueio de risco na entrada.

Todas as 11 histórias foram implementadas no P2. O corte de MoSCoW diz o que seria entregue primeiro se o prazo apertasse.
