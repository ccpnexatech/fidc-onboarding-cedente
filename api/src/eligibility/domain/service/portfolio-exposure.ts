import { CalendarDate } from '../../../shared/domain/calendar-date';
import { economicGroupOf } from '../../../shared/domain/tax-id';
import { BusinessCalendar } from '../calendar/business-calendar';
import { PortfolioHolding } from '../entity/portfolio-holding';

export interface ExposureEntry {
  assignorId: string;
  debtorTaxId: string;
  faceValue: number;
  dueDate: CalendarDate;
}

export class PortfolioExposure {
  private readonly debtorGroupExposure = new Map<string, number>();
  private readonly assignorExposure = new Map<string, number>();
  private outstandingFaceValue = 0;
  private weightedTermSum = 0;

  constructor(
    private readonly referenceDate: CalendarDate,
    private readonly calendar: BusinessCalendar,
    holdings: PortfolioHolding[],
  ) {
    for (const holding of holdings.filter((item) => item.isOpen())) {
      this.add(holding);
    }
  }

  add(entry: ExposureEntry): void {
    const group = economicGroupOf(entry.debtorTaxId);
    this.debtorGroupExposure.set(group, this.debtorGroupExposureOf(entry.debtorTaxId) + entry.faceValue);
    this.assignorExposure.set(entry.assignorId, this.assignorExposureOf(entry.assignorId) + entry.faceValue);
    if (!entry.dueDate.isBefore(this.referenceDate)) {
      this.outstandingFaceValue += entry.faceValue;
      this.weightedTermSum += entry.faceValue * this.businessDaysUntil(entry.dueDate);
    }
  }

  debtorGroupExposureOf(debtorTaxId: string): number {
    return this.debtorGroupExposure.get(economicGroupOf(debtorTaxId)) ?? 0;
  }

  assignorExposureOf(assignorId: string): number {
    return this.assignorExposure.get(assignorId) ?? 0;
  }

  businessDaysUntil(dueDate: CalendarDate): number {
    return this.calendar.businessDaysBetween(this.referenceDate, dueDate);
  }

  weightedTermSumWith(faceValue: number, dueDate: CalendarDate): { weightedTermSum: number; outstandingFaceValue: number } {
    return {
      weightedTermSum: this.weightedTermSum + faceValue * this.businessDaysUntil(dueDate),
      outstandingFaceValue: this.outstandingFaceValue + faceValue,
    };
  }
}
