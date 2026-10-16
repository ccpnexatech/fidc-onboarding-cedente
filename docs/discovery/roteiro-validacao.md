# Roteiro de validação das premissas

Entrevista de 30 minutos com quem opera FIDC (gestora, administrador ou custodiante) para validar as premissas com status `a validar` em [`premissas.md`](../../premissas.md). Cada resposta muda o status da premissa; uma premissa invalidada gera uma ADR com a mudança decorrente.

## Antes da entrevista

- Perfil ideal: analista de operações ou de risco de uma gestora de FIDC multicedente de duplicatas. Um custodiante cobre melhor PR-04 e PR-08.
- Combinar que nenhum nome de pessoa, fundo ou empresa será publicado.
- Ter à mão o [resumo de 2 minutos](../../RESUMO.md) e a [tabela de regras](regras.md#resumo).

## Roteiro (30 min)

| Tempo | Bloco |
|---|---|
| 0–3 | Apresentação do projeto em uma frase e acordo de anonimato. |
| 3–25 | Uma pergunta por premissa (abaixo), cerca de 3 minutos cada. |
| 25–30 | "O que eu não perguntei e deveria?" e pedido de material público (layout, manual). |

## Perguntas

| Premissa | Pergunta | Se a resposta for diferente, o que muda |
|---|---|---|
| PR-01 · cedente envia por planilha e e-mail | "Como o cedente envia a carteira hoje e como fica sabendo do que foi recusado?" | Se já existe portal ou arquivo CNAB, o ganho deixa de ser a digitalização e passa a ser a rejeição padronizada e a idempotência. Revisar o AS-IS e o RICE de HU-01 e HU-09. |
| PR-04 · custódia gera posição conciliável | "Depois da cessão, o que o custodiante devolve e quando? Vocês conciliam com a remessa?" | Se a conferência é feita pelo próprio custodiante ou pela registradora, a HU-11 muda de dono e o SQL vira relatório de conferência, não de conciliação. |
| PR-05 · reenvio é comum | "Com que frequência o mesmo lote chega duas vezes? Como vocês percebem?" | Se é raro, a idempotência continua (é barata), mas cai na priorização; se é frequente, vira argumento central do caso de negócio. |
| PR-06 · concentração por valor de face sobre PL fixo | "No limite por sacado, o administrador usa valor de face ou de aquisição? PL de qual data?" | Muda o cálculo de RN-07 e RN-08 e os parâmetros do fundo; os testes de limite precisam ser refeitos. |
| PR-07 · grupo econômico pela raiz do CNPJ | "Como vocês sabem que dois sacados são do mesmo grupo? Existe um cadastro?" | Se há cadastro próprio, RN-07 passa a consultar uma porta de grupo econômico em vez da raiz do CNPJ. Nova história e nova ADR. |
| PR-08 · posição do custodiante em arquivo por título | "Em que formato chega a posição: CNAB, planilha, API? Por título ou consolidada?" | Muda a carga do SQL de conciliação (`api/sql/`) e pode exigir uma etapa de transformação antes da comparação. |

## Modelo de registro

Copiar para `docs/discovery/entrevistas/AAAA-MM-DD-entrevista-NN.md`. Não registrar nome de pessoa, fundo, gestora ou cedente.

```markdown
# Entrevista NN · AAAA-MM-DD

- **Perfil:** <cargo genérico, ex.: analista de operações> em <tipo de instituição, ex.: gestora de FIDC multicedente>
- **Experiência com FIDC:** <anos>
- **Duração:** <min>

| Premissa | Resposta (resumo, sem nomes) | Status proposto | Ação |
|---|---|---|---|
| PR-01 | | validada / ajustada / descartada | |
| PR-04 | | | |
| PR-05 | | | |
| PR-06 | | | |
| PR-07 | | | |
| PR-08 | | | |

## O que eu não perguntei e deveria

## Material público indicado
```
