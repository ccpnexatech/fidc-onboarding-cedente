import { CalendarDate } from '../../../shared/domain/calendar-date';
import { Batch } from '../entity/batch';
import { BatchNotFoundException } from '../exception/batch-not-found.exception';
import { BatchRepository } from '../repository/batch-repository';
import { GetBatchUseCase } from './get-batch.use-case';
import { ListBatchRejectionsUseCase } from './list-batch-rejections.use-case';

describe('Consultas de remessa', () => {
  const batch = new Batch('batch-1', 'A', new CalendarDate('2026-10-14'), new Date(), [
    {
      receivable: {
        position: 1,
        externalId: 'CH-1',
        type: 'CHECK',
        debtorTaxId: '88999000000198',
        debtorName: 'Sacado',
        faceValue: 100,
        issueDate: new CalendarDate('2026-10-01'),
        dueDate: new CalendarDate('2026-12-01'),
        invoiceKey: null,
        annualDiscountRateBasisPoints: 2400,
      },
      rejectionReasons: [{ rule: 'RN-01', code: 'RN-01_UNSUPPORTED_RECEIVABLE_TYPE', message: 'tipo' }],
    },
  ]);
  let repository: jest.Mocked<BatchRepository>;

  beforeEach(() => {
    repository = { save: jest.fn(), findById: jest.fn().mockResolvedValue(null) };
  });

  it('HU-10 · remessa existente é devolvida', async () => {
    repository.findById.mockResolvedValue(batch);

    await expect(new GetBatchUseCase(repository).execute('batch-1')).resolves.toBe(batch);
  });

  it('HU-10 · remessa inexistente lança BatchNotFound', async () => {
    await expect(new GetBatchUseCase(repository).execute('x')).rejects.toBeInstanceOf(BatchNotFoundException);
  });

  it('HU-09 · lista só os títulos rejeitados', async () => {
    repository.findById.mockResolvedValue(batch);

    const output = await new ListBatchRejectionsUseCase(repository).execute('batch-1');

    expect(output.rejectedItems.map((item) => item.receivable.externalId)).toEqual(['CH-1']);
  });

  it('HU-09 · remessa inexistente lança BatchNotFound', async () => {
    await expect(new ListBatchRejectionsUseCase(repository).execute('x')).rejects.toBeInstanceOf(BatchNotFoundException);
  });
});
