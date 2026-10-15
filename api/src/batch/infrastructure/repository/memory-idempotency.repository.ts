import { IdempotencyRecord, IdempotencyRepository } from '../../domain/repository/idempotency-repository';

export class MemoryIdempotencyRepository implements IdempotencyRepository {
  private readonly records = new Map<string, IdempotencyRecord>();

  async findByKey(key: string): Promise<IdempotencyRecord | null> {
    return this.records.get(key) ?? null;
  }

  async save(record: IdempotencyRecord): Promise<void> {
    this.records.set(record.key, record);
  }
}
