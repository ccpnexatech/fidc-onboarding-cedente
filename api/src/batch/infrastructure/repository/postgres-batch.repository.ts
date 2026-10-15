import { Pool } from 'pg';
import { CalendarDate } from '../../../shared/domain/calendar-date';
import { Batch, BatchItem, RejectionReason } from '../../domain/entity/batch';
import { BatchRepository } from '../../domain/repository/batch-repository';

interface BatchRow {
  id: string;
  assignor_id: string;
  reference_date: string;
  received_at: Date;
}

interface ReceivableRow {
  position: number;
  external_id: string;
  type: string;
  debtor_tax_id: string;
  debtor_name: string;
  face_value: string;
  issue_date: string;
  due_date: string;
  invoice_key: string | null;
  annual_discount_rate_basis_points: number;
  rejection_reasons: RejectionReason[];
}

export class PostgresBatchRepository implements BatchRepository {
  constructor(private readonly pool: Pool) {}

  async save(batch: Batch): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('INSERT INTO batch (id, assignor_id, reference_date, received_at) VALUES ($1, $2, $3, $4)', [
        batch.id,
        batch.assignorId,
        batch.referenceDate.toString(),
        batch.receivedAt,
      ]);
      for (const item of batch.items) {
        const receivable = item.receivable;
        await client.query(
          `INSERT INTO batch_receivable
             (batch_id, position, external_id, type, debtor_tax_id, debtor_name, face_value, issue_date, due_date,
              invoice_key, annual_discount_rate_basis_points, accepted, rejection_reasons)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            batch.id,
            receivable.position,
            receivable.externalId,
            receivable.type,
            receivable.debtorTaxId,
            receivable.debtorName,
            receivable.faceValue,
            receivable.issueDate.toString(),
            receivable.dueDate.toString(),
            receivable.invoiceKey,
            receivable.annualDiscountRateBasisPoints,
            item.rejectionReasons.length === 0,
            JSON.stringify(item.rejectionReasons),
          ],
        );
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<Batch | null> {
    const batches = await this.pool.query<BatchRow>(
      `SELECT id, assignor_id, to_char(reference_date, 'YYYY-MM-DD') AS reference_date, received_at
       FROM batch WHERE id::text = $1`,
      [id],
    );
    if (batches.rows.length === 0) {
      return null;
    }
    const row = batches.rows[0];
    const receivables = await this.pool.query<ReceivableRow>(
      `SELECT position, external_id, type, debtor_tax_id, debtor_name, face_value,
              to_char(issue_date, 'YYYY-MM-DD') AS issue_date, to_char(due_date, 'YYYY-MM-DD') AS due_date,
              invoice_key, annual_discount_rate_basis_points, rejection_reasons
       FROM batch_receivable WHERE batch_id = $1 ORDER BY position`,
      [row.id],
    );
    const items: BatchItem[] = receivables.rows.map((receivable) => ({
      receivable: {
        position: receivable.position,
        externalId: receivable.external_id,
        type: receivable.type,
        debtorTaxId: receivable.debtor_tax_id,
        debtorName: receivable.debtor_name,
        faceValue: Number(receivable.face_value),
        issueDate: new CalendarDate(receivable.issue_date),
        dueDate: new CalendarDate(receivable.due_date),
        invoiceKey: receivable.invoice_key,
        annualDiscountRateBasisPoints: receivable.annual_discount_rate_basis_points,
      },
      rejectionReasons: receivable.rejection_reasons,
    }));
    return new Batch(row.id, row.assignor_id, new CalendarDate(row.reference_date), row.received_at, items);
  }
}
