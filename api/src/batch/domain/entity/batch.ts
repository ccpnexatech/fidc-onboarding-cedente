import { CalendarDate } from '../../../shared/domain/calendar-date';

export interface BatchReceivable {
  position: number;
  externalId: string;
  type: string;
  debtorTaxId: string;
  debtorName: string;
  faceValue: number;
  issueDate: CalendarDate;
  dueDate: CalendarDate;
  invoiceKey: string | null;
  annualDiscountRateBasisPoints: number;
}

export interface RejectionReason {
  rule: string;
  code: string;
  message: string;
}

export interface BatchItem {
  receivable: BatchReceivable;
  rejectionReasons: RejectionReason[];
}

export interface BatchTotals {
  received: number;
  accepted: number;
  rejected: number;
  acceptedFaceValue: number;
}

export class Batch {
  constructor(
    readonly id: string,
    readonly assignorId: string,
    readonly referenceDate: CalendarDate,
    readonly receivedAt: Date,
    readonly items: BatchItem[],
  ) {}

  acceptedItems(): BatchItem[] {
    return this.items.filter((item) => item.rejectionReasons.length === 0);
  }

  rejectedItems(): BatchItem[] {
    return this.items.filter((item) => item.rejectionReasons.length > 0);
  }

  totals(): BatchTotals {
    const accepted = this.acceptedItems();
    return {
      received: this.items.length,
      accepted: accepted.length,
      rejected: this.items.length - accepted.length,
      acceptedFaceValue: accepted.reduce((sum, item) => sum + item.receivable.faceValue, 0),
    };
  }
}
