import { Batch } from '../entity/batch';
import { BatchNotFoundException } from '../exception/batch-not-found.exception';
import { BatchRepository } from '../repository/batch-repository';

export class GetBatchUseCase {
  constructor(private readonly batchRepository: BatchRepository) {}

  async execute(batchId: string): Promise<Batch> {
    const batch = await this.batchRepository.findById(batchId);
    if (batch === null) {
      throw new BatchNotFoundException(batchId);
    }
    return batch;
  }
}
