import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import {
  ASSIGNOR_NEAR_LIMIT,
  batch,
  DEBTOR_NEAR_LIMIT,
  DEBTOR_NEAR_LIMIT_BRANCH,
  DEBTOR_ONE_MILLION,
  OTHER_NEW_DEBTOR,
  receivable,
} from './support/batch-payload';
import { getPath, postBatch, startApplication } from './support/test-application';

describe('Regras da carteira (integração, carteira simulada)', () => {
  let application: INestApplication;

  beforeEach(async () => {
    application = await startApplication();
  });

  afterEach(async () => {
    await application.close();
  });

  async function rejectionCodes(body: unknown, key: string): Promise<string[][]> {
    const created = await postBatch(application, body, key);
    expect(created.status).toBe(201);
    const rejections = await getPath(application, `/remessas/${created.body.id}/rejeicoes`);
    return rejections.body.items.map((item: { reasons: { code: string }[] }) => item.reasons.map((reason) => reason.code));
  }

  it('HU-06 · sacado com R$ 1.000.000,00 recebe R$ 500.000,00; sacado com R$ 1.950.000,00 e a filial não recebem R$ 60.000,00', async () => {
    const codes = await rejectionCodes(
      batch([
        receivable({ debtor: { taxId: DEBTOR_ONE_MILLION, name: 'Sacado 1 milhão' }, faceValue: 50_000_000 }),
        receivable({ debtor: { taxId: DEBTOR_NEAR_LIMIT, name: 'Sacado no limite' }, faceValue: 6_000_000 }),
        receivable({ debtor: { taxId: DEBTOR_NEAR_LIMIT_BRANCH, name: 'Filial do sacado no limite' }, faceValue: 6_000_000 }),
      ]),
      'hu06-sacado',
    );

    expect(codes).toEqual([['RN-07_DEBTOR_CONCENTRATION_EXCEEDED'], ['RN-07_DEBTOR_CONCENTRATION_EXCEEDED']]);
  });

  it('HU-06 · cedente com R$ 3.700.000,00: o primeiro título de R$ 40.000,00 entra e o segundo é rejeitado com RN-08', async () => {
    const codes = await rejectionCodes(
      batch([receivable({ faceValue: 4_000_000 }), receivable({ faceValue: 4_000_000 })], ASSIGNOR_NEAR_LIMIT),
      'hu06-cedente',
    );

    expect(codes).toEqual([['RN-08_ASSIGNOR_CONCENTRATION_EXCEEDED']]);
  });

  it('HU-08 · título curto entra; título de R$ 1.000.000,00 a 200 dias úteis é rejeitado com RN-03', async () => {
    const codes = await rejectionCodes(
      batch([
        receivable({ faceValue: 10_000_000, dueDate: '2026-12-10' }),
        receivable({ debtor: { taxId: OTHER_NEW_DEBTOR, name: 'Sacado longo' }, faceValue: 100_000_000, dueDate: '2027-08-04' }),
      ]),
      'hu08',
    );

    expect(codes).toEqual([['RN-03_WEIGHTED_AVERAGE_TERM_EXCEEDED']]);
  });
});
