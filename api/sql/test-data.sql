-- Dados de teste da conciliação (HU-11): um caso de cada divergência e um título conciliado.
-- Rodar depois de schema.sql, em banco limpo.

INSERT INTO batch (id, assignor_id, reference_date, received_at) VALUES
    ('11111111-1111-4111-8111-111111111111', '12345678000195', '2026-10-14', '2026-10-14T13:00:00Z');

INSERT INTO batch_receivable
    (batch_id, position, external_id, type, debtor_tax_id, debtor_name, face_value, issue_date, due_date,
     invoice_key, annual_discount_rate_basis_points, accepted, rejection_reasons)
VALUES
    -- conciliado: aceito e custodiado com o mesmo valor
    ('11111111-1111-4111-8111-111111111111', 1, 'DM-CONC-0001', 'TRADE_BILL', '88999000000198', 'Sacado A', 1000000, '2026-10-01', '2026-12-14', '35261012345678000195550010000000011000000011', 2400, true, '[]'),
    -- faltante: aceito, sem posição na custódia
    ('11111111-1111-4111-8111-111111111111', 2, 'DM-CONC-0002', 'TRADE_BILL', '88999000000198', 'Sacado A', 2000000, '2026-10-01', '2026-12-14', '35261012345678000195550010000000021000000021', 2400, true, '[]'),
    -- valor divergente: aceito por R$ 30.000,00, custodiado por R$ 29.000,00
    ('11111111-1111-4111-8111-111111111111', 3, 'DM-CONC-0003', 'SERVICE_BILL', '99000111000165', 'Sacado B', 3000000, '2026-10-01', '2026-11-30', '35261012345678000195550010000000031000000031', 2400, true, '[]'),
    -- duplicado: aceito uma vez, duas posições na custódia
    ('11111111-1111-4111-8111-111111111111', 4, 'DM-CONC-0004', 'TRADE_BILL', '99000111000165', 'Sacado B', 4000000, '2026-10-01', '2026-11-30', '35261012345678000195550010000000041000000041', 2400, true, '[]'),
    -- rejeitado pela RN-02 e mesmo assim custodiado
    ('11111111-1111-4111-8111-111111111111', 5, 'DM-CONC-0005', 'TRADE_BILL', '88999000000198', 'Sacado A', 5000000, '2026-09-01', '2026-10-10', '35261012345678000195550010000000051000000051', 2400, false,
     '[{"rule": "RN-02", "code": "RN-02_RECEIVABLE_OVERDUE", "message": "vencido"}]');

INSERT INTO custody_position (position_date, assignor_id, external_id, face_value, custody_reference) VALUES
    ('2026-10-14', '12345678000195', 'DM-CONC-0001', 1000000, 'CUST-0001'),
    ('2026-10-14', '12345678000195', 'DM-CONC-0003',  2900000, 'CUST-0003'),
    ('2026-10-14', '12345678000195', 'DM-CONC-0004',  4000000, 'CUST-0004'),
    ('2026-10-14', '12345678000195', 'DM-CONC-0004',  4000000, 'CUST-0004B'),
    ('2026-10-14', '12345678000195', 'DM-CONC-0005',  5000000, 'CUST-0005'),
    -- posição sem remessa nenhuma
    ('2026-10-14', '12345678000195', 'DM-CONC-0099',  9900000, 'CUST-0099');
