import { Pool } from 'pg';
import { IdempotencyRecord, IdempotencyRepository } from '../../domain/repository/idempotency-repository';

export class PostgresIdempotencyRepository implements IdempotencyRepository {
  constructor(private readonly pool: Pool) {}

  async findByKey(key: string): Promise<IdempotencyRecord | null> {
    const result = await this.pool.query<{ key: string; fingerprint: string; batch_id: string }>(
      'SELECT key, fingerprint, batch_id FROM idempotency_key WHERE key = $1',
      [key],
    );
    if (result.rows.length === 0) {
      return null;
    }
    const row = result.rows[0];
    return { key: row.key, fingerprint: row.fingerprint, batchId: row.batch_id };
  }

  async save(record: IdempotencyRecord): Promise<void> {
    await this.pool.query('INSERT INTO idempotency_key (key, fingerprint, batch_id) VALUES ($1, $2, $3)', [
      record.key,
      record.fingerprint,
      record.batchId,
    ]);
  }
}
