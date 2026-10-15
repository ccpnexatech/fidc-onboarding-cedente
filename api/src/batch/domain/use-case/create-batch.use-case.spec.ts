import { CalendarDate } from '../../../shared/domain/calendar-date';
import { Clock } from '../../../shared/domain/clock';
import { Batch, BatchReceivable } from '../entity/batch';
import { AssignorNotEnabledException } from '../exception/assignor-not-enabled.exception';
import { IdempotencyKeyConflictException } from '../exception/idempotency-key-conflict.exception';
import { BatchRepository } from '../repository/batch-repository';
import { IdempotencyRepository } from '../repository/idempotency-repository';
import { EligibilityGateway } from '../service/eligibility-gateway';
import { CreateBatchUseCase } from './create-batch.use-case';

const REFERENCE_DATE = new CalendarDate('2026-10-14');

function receivable(position: number): BatchReceivable {
  return {
    position,
    externalId: `DM-${position}`,
    type: 'TRADE_BILL',
    debtorTaxId: '88999000000198',
    debtorName: 'Sacado',
    faceValue: 100_000,
    issueDate: new CalendarDate('2026-10-01'),
    dueDate: new CalendarDate('2026-12-14'),
    invoiceKey: '3'.repeat(44),
    annualDiscountRateBasisPoints: 2400,
  };
}

describe('CreateBatchUseCase', () => {
  let batchRepository: jest.Mocked<BatchRepository>;
  let idempotencyRepository: jest.Mocked<IdempotencyRepository>;
  let eligibilityGateway: jest.Mocked<EligibilityGateway>;
  let useCase: CreateBatchUseCase;

  beforeEach(() => {
    batchRepository = { save: jest.fn(), findById: jest.fn() };
    idempotencyRepository = { findByKey: jest.fn().mockResolvedValue(null), save: jest.fn() };
    eligibilityGateway = { assess: jest.fn(), registerAssignment: jest.fn() };
    const clock: Clock = { referenceDate: () => REFERENCE_DATE, now: () => new Date('2026-10-14T13:00:00Z') };
    useCase = new CreateBatchUseCase(
      batchRepository,
      idempotencyRepository,
      eligibilityGateway,
      { next: () => 'batch-1' },
      { of: (payload) => JSON.stringify(payload) },
      clock,
    );
  });

  it('HU-01 · cedente habilitado: salva a remessa, registra os aceitos e grava a chave', async () => {
    eligibilityGateway.assess.mockResolvedValue({
      assignorEnabled: true,
      decisions: [
        { position: 1, rejectionReasons: [] },
        { position: 2, rejectionReasons: [{ rule: 'RN-02', code: 'RN-02_RECEIVABLE_OVERDUE', message: 'vencido' }] },
      ],
    });

    const output = await useCase.execute({ idempotencyKey: 'k', payload: { a: 1 }, assignorId: 'A', receivables: [receivable(1), receivable(2)] });

    expect(output.replayed).toBe(false);
    expect(output.batch.totals()).toEqual({ received: 2, accepted: 1, rejected: 1, acceptedFaceValue: 100_000 });
    expect(batchRepository.save).toHaveBeenCalledWith(output.batch);
    expect(eligibilityGateway.registerAssignment).toHaveBeenCalledWith('A', [receivable(1)]);
    expect(idempotencyRepository.save).toHaveBeenCalledWith({ key: 'k', fingerprint: '{"a":1}', batchId: 'batch-1' });
  });

  it('HU-01 · cedente suspenso: lança RN-10 e não grava nada', async () => {
    eligibilityGateway.assess.mockResolvedValue({ assignorEnabled: false, assignorStatus: 'SUSPENDED' });

    await expect(
      useCase.execute({ idempotencyKey: 'k', payload: {}, assignorId: 'A', receivables: [receivable(1)] }),
    ).rejects.toBeInstanceOf(AssignorNotEnabledException);
    expect(batchRepository.save).not.toHaveBeenCalled();
    expect(idempotencyRepository.save).not.toHaveBeenCalled();
  });

  it('HU-02 · mesma chave e mesmo corpo: devolve a remessa original sem reavaliar', async () => {
    const original = new Batch('batch-0', 'A', REFERENCE_DATE, new Date(), []);
    idempotencyRepository.findByKey.mockResolvedValue({ key: 'k', fingerprint: '{"a":1}', batchId: 'batch-0' });
    batchRepository.findById.mockResolvedValue(original);

    const output = await useCase.execute({ idempotencyKey: 'k', payload: { a: 1 }, assignorId: 'A', receivables: [] });

    expect(output).toEqual({ batch: original, replayed: true });
    expect(eligibilityGateway.assess).not.toHaveBeenCalled();
  });

  it('HU-02 · mesma chave com corpo diferente: lança conflito de idempotência', async () => {
    idempotencyRepository.findByKey.mockResolvedValue({ key: 'k', fingerprint: '{"a":1}', batchId: 'batch-0' });

    await expect(
      useCase.execute({ idempotencyKey: 'k', payload: { a: 2 }, assignorId: 'A', receivables: [] }),
    ).rejects.toBeInstanceOf(IdempotencyKeyConflictException);
  });
});
