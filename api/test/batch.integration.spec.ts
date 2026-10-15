import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { batch, receivable, SUSPENDED_ASSIGNOR, UNKNOWN_ASSIGNOR } from './support/batch-payload';
import { getPath, postBatch, startApplication } from './support/test-application';

describe('Remessa (integração, repositório em memória)', () => {
  let application: INestApplication;

  beforeEach(async () => {
    application = await startApplication();
  });

  afterEach(async () => {
    await application.close();
  });

  describe('HU-01 · Enviar remessa pela API', () => {
    it('cedente habilitado envia remessa válida e recebe 201', async () => {
      const response = await postBatch(application, batch([receivable(), receivable()]), 'hu01-feliz');

      expect(response.status).toBe(201);
      expect(response.headers.location).toBe(`/remessas/${response.body.id}`);
      expect(response.body.totals).toMatchObject({ received: 2, accepted: 2, rejected: 0 });
      expect(response.body.referenceDate).toBe('2026-10-14');
    });

    it('cedente suspenso tem a remessa recusada com 422 e RN-10', async () => {
      const response = await postBatch(application, batch([receivable()], SUSPENDED_ASSIGNOR), 'hu01-suspenso');

      expect(response.status).toBe(422);
      expect(response.headers['content-type']).toContain('application/problem+json');
      expect(response.body.code).toBe('RN-10_ASSIGNOR_NOT_ENABLED');
    });

    it('cedente não cadastrado tem a remessa recusada com 422 e RN-10', async () => {
      const response = await postBatch(application, batch([receivable()], UNKNOWN_ASSIGNOR), 'hu01-desconhecido');

      expect(response.status).toBe(422);
      expect(response.body.code).toBe('RN-10_ASSIGNOR_NOT_ENABLED');
    });

    it('payload fora do contrato devolve 400 com o campo que falhou', async () => {
      const response = await postBatch(application, { assignorId: '12345678000195' }, 'hu01-invalido');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.errors).toContainEqual({ field: '/receivables', message: 'campo obrigatório ausente' });
    });

    it('CNPJ do sacado com dígito verificador inválido devolve 400', async () => {
      const invalid = receivable({ debtor: { taxId: '12345678000100', name: 'Sacado' } });
      const response = await postBatch(application, batch([invalid]), 'hu01-dv');

      expect(response.status).toBe(400);
      expect(response.body.errors[0].field).toBe('/receivables/0/debtor/taxId');
    });

    it('envio sem Idempotency-Key devolve 400', async () => {
      const response = await request(application.getHttpServer()).post('/remessas').send(batch([receivable()]));

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('MISSING_IDEMPOTENCY_KEY');
    });
  });

  describe('HU-02 · Reenviar sem duplicar a cessão', () => {
    it('reenvio com a mesma chave e o mesmo corpo devolve a remessa original', async () => {
      const body = batch([receivable()]);
      const first = await postBatch(application, body, 'chave-001');
      const second = await postBatch(application, body, 'chave-001');

      expect(second.status).toBe(201);
      expect(second.body.id).toBe(first.body.id);
      expect(second.headers['idempotent-replayed']).toBe('true');
    });

    it('mesma chave com corpo diferente devolve 409', async () => {
      await postBatch(application, batch([receivable()]), 'chave-002');
      const response = await postBatch(application, batch([receivable()]), 'chave-002');

      expect(response.status).toBe(409);
      expect(response.body.code).toBe('IDEMPOTENCY_KEY_CONFLICT');
    });
  });

  describe('HU-10 · Consultar a remessa', () => {
    it('remessa existente devolve 200 com totais e títulos aceitos', async () => {
      const created = await postBatch(application, batch([receivable({ externalId: 'DM-HU10-0001' })]), 'hu10');
      const response = await getPath(application, `/remessas/${created.body.id}`);

      expect(response.status).toBe(200);
      expect(response.body.acceptedReceivables[0].externalId).toBe('DM-HU10-0001');
      expect(response.body.totals.acceptedFaceValue).toBe(1_000_000);
    });

    it('remessa inexistente devolve 404', async () => {
      const response = await getPath(application, '/remessas/00000000-0000-4000-8000-000000000000');

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('BATCH_NOT_FOUND');
    });
  });

  describe('HU-09 · Consultar as rejeições', () => {
    it('remessa inexistente devolve 404', async () => {
      const response = await getPath(application, '/remessas/00000000-0000-4000-8000-000000000000/rejeicoes');

      expect(response.status).toBe(404);
    });
  });
});
