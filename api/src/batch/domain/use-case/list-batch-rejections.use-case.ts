import { BatchItem } from '../entity/batch';
import { BatchNotFoundException } from '../exception/batch-not-found.exception';
import { BatchRepository } from '../repository/batch-repository';

export interface ListBatchRejectionsOutput {
  batchId: string;
  rejectedItems: BatchItem[];
}

export class ListBatchRejectionsUseCase {
  constructor(private readonly batchRepository: BatchRepository) {}

  async execute(batchId: string): Promise<ListBatchRejectionsOutput> {
    const batch = await this.batchRepository.findById(batchId);
    if (batch === null) {
      throw new BatchNotFoundException(batchId);
    }
    return { batchId: batch.id, rejectedItems: batch.rejectedItems() };
  }
}
