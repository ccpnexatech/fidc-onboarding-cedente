import { DomainException } from '../../../shared/domain/domain-exception';

export class BatchNotFoundException extends DomainException {
  readonly code = 'BATCH_NOT_FOUND';
  readonly title = 'Remessa não encontrada';

  constructor(batchId: string) {
    super(`Não existe remessa com id ${batchId}.`);
  }
}
