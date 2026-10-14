import { Batch } from '../../domain/entity/batch';
import { BatchRepository } from '../../domain/repository/batch-repository';

export class MemoryBatchRepository implements BatchRepository {
  private readonly batches = new Map<string, Batch>();

  async save(batch: Batch): Promise<void> {
    this.batches.set(batch.id, batch);
  }

  async findById(id: string): Promise<Batch | null> {
    return this.batches.get(id) ?? null;
  }
}
