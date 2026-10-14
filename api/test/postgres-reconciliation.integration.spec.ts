import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from 'pg';
import { batch, receivable } from './support/batch-payload';
import { getPath, postBatch, startApplication } from './support/test-application';

const DATABASE_URL = process.env.DATABASE_URL;
const describeWithPostgres = DATABASE_URL === undefined ? describe.skip : describe;
const SQL = (file: string) => readFileSync(join(__dirname, '..', 'sql', file), 'utf8');

describeWithPostgres('Remessa no Postgres e conciliação (integração, sem mocks)', () => {
  const schema = `integration_${process.pid}`;
  let admin: Client;
  let application: INestApplication;

  beforeAll(async () => {
    admin = new Client({ connectionString: DATABASE_URL });
    await admin.connect();
    await admin.query(`SET client_min_messages = warning; DROP SCHEMA IF EXISTS ${schema} CASCADE; CREATE SCHEMA ${schema}`);
    await admin.query(`SET search_path = ${schema}`);
    await admin.query(SQL('schema.sql'));
    process.env.BATCH_REPOSITORY = 'postgres';
    process.env.DATABASE_URL = `${DATABASE_URL}${DATABASE_URL?.includes('?') ? '&' : '?'}options=-c%20search_path%3D${schema}`;
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
    process.env.DATABASE_URL = DATABASE_URL;
    delete process.env.BATCH_REPOSITORY;
    await admin.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await admin.end();
  });

  it('HU-01 e HU-10 · remessa gravada no Postgres é consultada com os mesmos totais', async () => {
    const created = await postBatch(application, batch([receivable(), receivable({ type: 'CHECK', invoiceKey: undefined })]), 'pg-hu01');
    const found = await getPath(application, `/remessas/${created.body.id}`);

    expect(created.status).toBe(201);
    expect(found.body).toEqual(created.body);
    expect(found.body.totals).toMatchObject({ accepted: 1, rejected: 1 });
  });

  it('HU-02 · reenvio idempotente funciona com a chave gravada no Postgres', async () => {
    const body = batch([receivable()]);
    const first = await postBatch(application, body, 'pg-hu02');
    const second = await postBatch(application, body, 'pg-hu02');
    const conflict = await postBatch(application, batch([receivable()]), 'pg-hu02');

    expect(second.body.id).toBe(first.body.id);
    expect(second.headers['idempotent-replayed']).toBe('true');
    expect(conflict.status).toBe(409);
  });

  it('HU-11 · conciliação encontra faltante, valor divergente e duplicado nas remessas reais', async () => {
    const created = await postBatch(
      application,
      batch([
        receivable({ externalId: 'DM-E2E-0001', faceValue: 1_000_000 }),
        receivable({ externalId: 'DM-E2E-0002', faceValue: 2_000_000 }),
        receivable({ externalId: 'DM-E2E-0003', faceValue: 3_000_000 }),
        receivable({ externalId: 'DM-E2E-0004', faceValue: 4_000_000 }),
      ]),
      'pg-hu11',
    );
    expect(created.body.totals.accepted).toBe(4);
    await admin.query(
      `INSERT INTO custody_position (position_date, assignor_id, external_id, face_value, custody_reference) VALUES
         ('2026-10-14', '12345678000195', 'DM-E2E-0001', 1000000, 'C1'),
         ('2026-10-14', '12345678000195', 'DM-E2E-0003', 2900000, 'C3'),
         ('2026-10-14', '12345678000195', 'DM-E2E-0004', 4000000, 'C4'),
         ('2026-10-14', '12345678000195', 'DM-E2E-0004', 4000000, 'C4B')`,
    );
    await admin.query(SQL('reconciliation.sql'));

    const report = await admin.query<{ divergence: string; external_id: string }>(
      `SELECT divergence, external_id FROM reconciliation_divergence WHERE external_id LIKE 'DM-E2E-%' ORDER BY external_id`,
    );

    expect(report.rows).toEqual([
      { divergence: 'MISSING_IN_CUSTODY', external_id: 'DM-E2E-0002' },
      { divergence: 'AMOUNT_MISMATCH', external_id: 'DM-E2E-0003' },
      { divergence: 'DUPLICATED_IN_CUSTODY', external_id: 'DM-E2E-0004' },
    ]);
  });
});
