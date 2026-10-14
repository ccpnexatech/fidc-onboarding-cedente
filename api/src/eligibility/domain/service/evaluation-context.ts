import { CalendarDate } from '../../../shared/domain/calendar-date';
import { BusinessCalendar } from '../calendar/business-calendar';
import { FundParameters } from '../entity/fund-parameters';
import { PortfolioHolding } from '../entity/portfolio-holding';
import { ReceivableCandidate } from '../entity/receivable-candidate';
import { PortfolioExposure } from './portfolio-exposure';

export class EvaluationContext {
  readonly exposure: PortfolioExposure;
  private readonly seenTitles = new Set<string>();
  private readonly seenInvoiceInstallments = new Set<string>();

  constructor(
    readonly assignorId: string,
    readonly referenceDate: CalendarDate,
    readonly parameters: FundParameters,
    readonly holdings: PortfolioHolding[],
    calendar: BusinessCalendar,
  ) {
    this.exposure = new PortfolioExposure(referenceDate, calendar, holdings);
    for (const holding of holdings) {
      this.remember(holding.assignorId, holding.externalId, holding.invoiceKey, holding.dueDate, holding.faceValue);
    }
  }

  isKnownTitle(candidate: ReceivableCandidate): boolean {
    return (
      this.seenTitles.has(this.titleKey(this.assignorId, candidate.externalId)) ||
      (candidate.invoiceKey !== null &&
        this.seenInvoiceInstallments.has(this.installmentKey(candidate.invoiceKey, candidate.dueDate, candidate.faceValue)))
    );
  }

  rememberCandidate(candidate: ReceivableCandidate): void {
    this.remember(this.assignorId, candidate.externalId, candidate.invoiceKey, candidate.dueDate, candidate.faceValue);
  }

  maximumDaysPastDueOf(debtorTaxId: string): number {
    return this.holdings
      .filter((holding) => holding.debtorTaxId === debtorTaxId)
      .reduce((maximum, holding) => Math.max(maximum, holding.daysPastDueOn(this.referenceDate)), 0);
  }

  private remember(assignorId: string, externalId: string, invoiceKey: string | null, dueDate: CalendarDate, faceValue: number): void {
    this.seenTitles.add(this.titleKey(assignorId, externalId));
    if (invoiceKey !== null) {
      this.seenInvoiceInstallments.add(this.installmentKey(invoiceKey, dueDate, faceValue));
    }
  }

  private titleKey(assignorId: string, externalId: string): string {
    return `${assignorId}|${externalId}`;
  }

  private installmentKey(invoiceKey: string, dueDate: CalendarDate, faceValue: number): string {
    return `${invoiceKey}|${dueDate.toString()}|${faceValue}`;
  }
}
