import { Batch, BatchItem } from '../../domain/entity/batch';
import { ListBatchRejectionsOutput } from '../../domain/use-case/list-batch-rejections.use-case';

export function presentBatch(batch: Batch) {
  return {
    id: batch.id,
    assignorId: batch.assignorId,
    referenceDate: batch.referenceDate.toString(),
    receivedAt: batch.receivedAt.toISOString(),
    status: 'PROCESSED',
    totals: batch.totals(),
    acceptedReceivables: batch.acceptedItems().map((item: BatchItem) => ({
      position: item.receivable.position,
      externalId: item.receivable.externalId,
      debtorTaxId: item.receivable.debtorTaxId,
      faceValue: item.receivable.faceValue,
      dueDate: item.receivable.dueDate.toString(),
    })),
  };
}

export function presentRejections(output: ListBatchRejectionsOutput) {
  return {
    batchId: output.batchId,
    items: output.rejectedItems.map((item) => ({
      position: item.receivable.position,
      externalId: item.receivable.externalId,
      reasons: item.rejectionReasons.map((reason) => ({ code: reason.code, rule: reason.rule, message: reason.message })),
    })),
  };
}
