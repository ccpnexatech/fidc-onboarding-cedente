import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { batch, DEBTOR_TEN_DAYS_LATE, DEBTOR_TWENTY_DAYS_LATE, receivable } from './support/batch-payload';
import { getPath, postBatch, startApplication } from './support/test-application';

describe('Regras do título (integração, carteira simulada)', () => {
  let application: INestApplication;

  beforeEach(async () => {
    application = await startApplication();
  });

  afterEach(async () => {
    await application.close();
  });

  async function rejectionCodes(receivables: ReturnType<typeof receivable>[], key: string): Promise<string[][]> {
    const created = await postBatch(application, batch(receivables), key);
    expect(created.status).toBe(201);
    const rejections = await getPath(application, `/remessas/${created.body.id}/rejeicoes`);
    return rejections.body.items.map((item: { reasons: { code: string }[] }) => item.reasons.map((reason) => reason.code));
  }

  it('HU-03 · cheque, vencido e sem nota fiscal são rejeitados; a duplicata válida entra', async () => {
    const codes = await rejectionCodes(
      [
        receivable(),
        receivable({ type: 'CHECK', invoiceKey: undefined }),
        receivable({ dueDate: '2026-10-10' }),
        receivable({ invoiceKey: undefined }),
        receivable({ dueDate: '2026-10-10', invoiceKey: undefined }),
      ],
      'hu03',
    );

    expect(codes).toEqual([
      ['RN-01_UNSUPPORTED_RECEIVABLE_TYPE'],
      ['RN-02_RECEIVABLE_OVERDUE'],
      ['RN-04_MISSING_INVOICE_EVIDENCE'],
      ['RN-02_RECEIVABLE_OVERDUE', 'RN-04_MISSING_INVOICE_EVIDENCE'],
    ]);
  });

  it('HU-04 · sacado com 10 dias de atraso passa; com 20 dias é rejeitado com RN-05', async () => {
    const codes = await rejectionCodes(
      [
        receivable({ debtor: { taxId: DEBTOR_TEN_DAYS_LATE, name: 'Sacado 10 dias' } }),
        receivable({ debtor: { taxId: DEBTOR_TWENTY_DAYS_LATE, name: 'Sacado 20 dias' } }),
      ],
      'hu04',
    );

    expect(codes).toEqual([['RN-05_DEBTOR_IN_DEFAULT']]);
  });

  it('HU-05 · taxa de 16% a.a. é rejeitada com RN-06; 24% a.a. passa', async () => {
    const codes = await rejectionCodes(
      [receivable({ annualDiscountRateBasisPoints: 2400 }), receivable({ annualDiscountRateBasisPoints: 1600 })],
      'hu05',
    );

    expect(codes).toEqual([['RN-06_DISCOUNT_RATE_BELOW_MINIMUM']]);
  });

  it('HU-07 · título já na carteira e repetido na remessa são rejeitados com RN-09', async () => {
    const codes = await rejectionCodes(
      [
        receivable({ externalId: 'DM-2026-0500' }),
        receivable({ externalId: 'DM-2026-0001' }),
        receivable({ externalId: 'DM-2026-0600' }),
        receivable({ externalId: 'DM-2026-0600' }),
      ],
      'hu07',
    );

    expect(codes).toEqual([['RN-09_DUPLICATE_RECEIVABLE'], ['RN-09_DUPLICATE_RECEIVABLE']]);
  });

  it('HU-07 · título aceito em uma remessa vira duplicidade na remessa seguinte', async () => {
    await rejectionCodes([receivable({ externalId: 'DM-2026-0700' })], 'hu07-primeira');
    const codes = await rejectionCodes([receivable({ externalId: 'DM-2026-0700' })], 'hu07-segunda');

    expect(codes).toEqual([['RN-09_DUPLICATE_RECEIVABLE']]);
  });

  it('HU-09 · remessa com 1 aceito e 2 rejeitados lista as 2 rejeições com posição e externalId', async () => {
    const created = await postBatch(
      application,
      batch([
        receivable({ externalId: 'DM-HU09-0001' }),
        receivable({ externalId: 'CH-HU09-0002', type: 'CHECK', invoiceKey: undefined }),
        receivable({ externalId: 'DM-HU09-0003', dueDate: '2026-10-10' }),
      ]),
      'hu09',
    );
    const response = await getPath(application, `/remessas/${created.body.id}/rejeicoes`);

    expect(response.status).toBe(200);
    expect(response.body.items).toEqual([
      { position: 2, externalId: 'CH-HU09-0002', reasons: [expect.objectContaining({ rule: 'RN-01' })] },
      { position: 3, externalId: 'DM-HU09-0003', reasons: [expect.objectContaining({ rule: 'RN-02' })] },
    ]);
  });
});
