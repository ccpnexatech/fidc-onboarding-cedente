import { CalendarDate } from '../../../shared/domain/calendar-date';

export class PortfolioHolding {
  constructor(
    readonly assignorId: string,
    readonly externalId: string,
    readonly invoiceKey: string | null,
    readonly debtorTaxId: string,
    readonly faceValue: number,
    readonly dueDate: CalendarDate,
    readonly paidAt: CalendarDate | null,
  ) {}

  isOpen(): boolean {
    return this.paidAt === null;
  }

  isOutstandingOn(referenceDate: CalendarDate): boolean {
    return this.isOpen() && !this.dueDate.isBefore(referenceDate);
  }

  daysPastDueOn(referenceDate: CalendarDate): number {
    if (!this.isOpen() || !this.dueDate.isBefore(referenceDate)) {
      return 0;
    }
    return this.dueDate.daysUntil(referenceDate);
  }
}
