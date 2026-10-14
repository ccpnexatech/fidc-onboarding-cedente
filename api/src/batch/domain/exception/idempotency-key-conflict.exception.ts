import { DomainException } from '../../../shared/domain/domain-exception';

export class IdempotencyKeyConflictException extends DomainException {
  readonly code = 'IDEMPOTENCY_KEY_CONFLICT';
  readonly title = 'Conflito de idempotência';

  constructor(idempotencyKey: string) {
    super(`A Idempotency-Key ${idempotencyKey} já foi usada com um corpo diferente.`);
  }
}
