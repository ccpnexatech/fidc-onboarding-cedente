import { CalendarDate } from '../../../shared/domain/calendar-date';

export interface ReceivableCandidate {
  position: number;
  externalId: string;
  type: string;
  debtorTaxId: string;
  faceValue: number;
  issueDate: CalendarDate;
  dueDate: CalendarDate;
  invoiceKey: string | null;
  annualDiscountRateBasisPoints: number;
}
