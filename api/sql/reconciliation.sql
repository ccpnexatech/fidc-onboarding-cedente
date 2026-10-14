-- HU-11 · Conciliação remessa × custódia.
-- Cruza os títulos ACEITOS nas remessas com a posição do custodiante pela chave (cedente, externalId).
-- Uma linha por divergência; título conciliado não aparece.
--
--   MISSING_IN_CUSTODY     título aceito sem posição na custódia
--   AMOUNT_MISMATCH        uma posição, com valor diferente do aceito
--   DUPLICATED_IN_CUSTODY  mais de uma posição para o mesmo título
--   MISSING_IN_BATCH       posição na custódia sem título aceito (inclui título rejeitado que foi custodiado)

CREATE OR REPLACE VIEW reconciliation_divergence AS
WITH accepted AS (
    SELECT br.batch_id, b.reference_date, b.assignor_id, br.external_id, br.face_value
    FROM batch_receivable br
    JOIN batch b ON b.id = br.batch_id
    WHERE br.accepted
),
custody AS (
    SELECT assignor_id,
           external_id,
           count(*)                                         AS positions,
           sum(face_value)                                  AS custody_face_value,
           string_agg(custody_reference, ',' ORDER BY custody_reference) AS custody_references
    FROM custody_position
    GROUP BY assignor_id, external_id
)
SELECT 'MISSING_IN_CUSTODY'::text AS divergence,
       a.assignor_id, a.external_id, a.batch_id,
       a.face_value AS batch_face_value,
       NULL::bigint AS custody_face_value,
       0::bigint    AS custody_positions,
       NULL::text   AS custody_references
FROM accepted a
LEFT JOIN custody c ON c.assignor_id = a.assignor_id AND c.external_id = a.external_id
WHERE c.external_id IS NULL

UNION ALL
SELECT 'DUPLICATED_IN_CUSTODY', a.assignor_id, a.external_id, a.batch_id,
       a.face_value, c.custody_face_value, c.positions, c.custody_references
FROM accepted a
JOIN custody c ON c.assignor_id = a.assignor_id AND c.external_id = a.external_id
WHERE c.positions > 1

UNION ALL
SELECT 'AMOUNT_MISMATCH', a.assignor_id, a.external_id, a.batch_id,
       a.face_value, c.custody_face_value, c.positions, c.custody_references
FROM accepted a
JOIN custody c ON c.assignor_id = a.assignor_id AND c.external_id = a.external_id
WHERE c.positions = 1 AND c.custody_face_value <> a.face_value

UNION ALL
SELECT 'MISSING_IN_BATCH', c.assignor_id, c.external_id, NULL::uuid,
       NULL::bigint, c.custody_face_value, c.positions, c.custody_references
FROM custody c
LEFT JOIN accepted a ON a.assignor_id = c.assignor_id AND a.external_id = c.external_id
WHERE a.external_id IS NULL;

-- Relatório: ordem estável para leitura e para o teste.
SELECT divergence,
       assignor_id,
       external_id,
       batch_face_value,
       custody_face_value,
       custody_positions,
       custody_references
FROM reconciliation_divergence
ORDER BY divergence, assignor_id, external_id;
