import { Clock } from '../../../shared/domain/clock';
import { Batch, BatchItem, BatchReceivable } from '../entity/batch';
import { AssignorNotEnabledException } from '../exception/assignor-not-enabled.exception';
import { IdempotencyKeyConflictException } from '../exception/idempotency-key-conflict.exception';
import { BatchRepository } from '../repository/batch-repository';
import { IdempotencyRepository } from '../repository/idempotency-repository';
import { EligibilityGateway } from '../service/eligibility-gateway';
import { IdentifierGenerator } from '../service/identifier-generator';
import { RequestFingerprint } from '../service/request-fingerprint';

export interface CreateBatchInput {
  idempotencyKey: string;
  payload: unknown;
  assignorId: string;
  receivables: BatchReceivable[];
}

export interface CreateBatchOutput {
  batch: Batch;
  replayed: boolean;
}

export class CreateBatchUseCase {
  constructor(
    private readonly batchRepository: BatchRepository,
    private readonly idempotencyRepository: IdempotencyRepository,
    private readonly eligibilityGateway: EligibilityGateway,
    private readonly identifierGenerator: IdentifierGenerator,
    private readonly requestFingerprint: RequestFingerprint,
    private readonly clock: Clock,
  ) {}

  async execute(input: CreateBatchInput): Promise<CreateBatchOutput> {
    const fingerprint = this.requestFingerprint.of(input.payload);
    const previous = await this.idempotencyRepository.findByKey(input.idempotencyKey);
    if (previous !== null) {
      if (previous.fingerprint !== fingerprint) {
        throw new IdempotencyKeyConflictException(input.idempotencyKey);
      }
      const original = await this.batchRepository.findById(previous.batchId);
      if (original !== null) {
        return { batch: original, replayed: true };
      }
    }

    const referenceDate = this.clock.referenceDate();
    const assessment = await this.eligibilityGateway.assess(input.assignorId, referenceDate, input.receivables);
    if (!assessment.assignorEnabled) {
      throw new AssignorNotEnabledException(input.assignorId, assessment.assignorStatus);
    }

    const reasonsByPosition = new Map(assessment.decisions.map((decision) => [decision.position, decision.rejectionReasons]));
    const items: BatchItem[] = input.receivables.map((receivable) => ({
      receivable,
      rejectionReasons: reasonsByPosition.get(receivable.position) ?? [],
    }));
    const batch = new Batch(this.identifierGenerator.next(), input.assignorId, referenceDate, this.clock.now(), items);

    await this.batchRepository.save(batch);
    await this.eligibilityGateway.registerAssignment(
      input.assignorId,
      batch.acceptedItems().map((item) => item.receivable),
    );
    await this.idempotencyRepository.save({ key: input.idempotencyKey, fingerprint, batchId: batch.id });
    return { batch, replayed: false };
  }
}
