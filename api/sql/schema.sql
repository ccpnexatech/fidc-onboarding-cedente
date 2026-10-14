-- Schema do mock (repositório Postgres, ADR-0002) e da conciliação (HU-11).
-- Valores em centavos (bigint); datas em ISO 8601.

CREATE TABLE IF NOT EXISTS batch (
    id              uuid        PRIMARY KEY,
    assignor_id     char(14)    NOT NULL,
    reference_date  date        NOT NULL,
    received_at     timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS batch_receivable (
    batch_id                          uuid        NOT NULL REFERENCES batch (id),
    position                          integer     NOT NULL,
    external_id                       varchar(60) NOT NULL,
    type                              varchar(30) NOT NULL,
    debtor_tax_id                     varchar(14) NOT NULL,
    debtor_name                       varchar(120) NOT NULL,
    face_value                        bigint      NOT NULL CHECK (face_value > 0),
    issue_date                        date        NOT NULL,
    due_date                          date        NOT NULL,
    invoice_key                       char(44),
    annual_discount_rate_basis_points integer     NOT NULL,
    accepted                          boolean     NOT NULL,
    rejection_reasons                 jsonb       NOT NULL DEFAULT '[]'::jsonb,
    PRIMARY KEY (batch_id, position)
);

CREATE INDEX IF NOT EXISTS batch_receivable_title ON batch_receivable (external_id) WHERE accepted;

CREATE TABLE IF NOT EXISTS idempotency_key (
    key         varchar(100) PRIMARY KEY,
    fingerprint char(64)     NOT NULL,
    batch_id    uuid         NOT NULL REFERENCES batch (id)
);

-- Posição diária enviada pelo custodiante (PR-08): uma linha por título custodiado.
CREATE TABLE IF NOT EXISTS custody_position (
    id                 bigserial   PRIMARY KEY,
    position_date      date        NOT NULL,
    assignor_id        char(14)    NOT NULL,
    external_id        varchar(60) NOT NULL,
    face_value         bigint      NOT NULL,
    custody_reference  varchar(40) NOT NULL
);
