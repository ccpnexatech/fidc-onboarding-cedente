import { CalendarDate } from '../../../shared/domain/calendar-date';
import { BatchReceivable, RejectionReason } from '../entity/batch';

export interface EligibilityDecision {
  position: number;
  rejectionReasons: RejectionReason[];
}

export type EligibilityAssessment =
  | { assignorEnabled: false; assignorStatus: string | null }
  | { assignorEnabled: true; decisions: EligibilityDecision[] };

export interface EligibilityGateway {
  assess(assignorId: string, referenceDate: CalendarDate, receivables: BatchReceivable[]): Promise<EligibilityAssessment>;
  registerAssignment(assignorId: string, receivables: BatchReceivable[]): Promise<void>;
}
