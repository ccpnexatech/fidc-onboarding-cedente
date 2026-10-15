export interface IdempotencyRecord {
  key: string;
  fingerprint: string;
  batchId: string;
}

export interface IdempotencyRepository {
  findByKey(key: string): Promise<IdempotencyRecord | null>;
  save(record: IdempotencyRecord): Promise<void>;
}
