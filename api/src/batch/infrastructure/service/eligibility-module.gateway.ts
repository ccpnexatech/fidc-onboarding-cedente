import { CalendarDate } from '../../../shared/domain/calendar-date';
import { ReceivableCandidate } from '../../../eligibility/domain/entity/receivable-candidate';
import { AssessBatchEligibilityUseCase } from '../../../eligibility/domain/use-case/assess-batch-eligibility.use-case';
import { RegisterAssignmentUseCase } from '../../../eligibility/domain/use-case/register-assignment.use-case';
import { BatchReceivable } from '../../domain/entity/batch';
import { EligibilityAssessment, EligibilityGateway } from '../../domain/service/eligibility-gateway';

export class EligibilityModuleGateway implements EligibilityGateway {
  constructor(
    private readonly assessBatchEligibility: AssessBatchEligibilityUseCase,
    private readonly registerAssignmentUseCase: RegisterAssignmentUseCase,
  ) {}

  async assess(assignorId: string, referenceDate: CalendarDate, receivables: BatchReceivable[]): Promise<EligibilityAssessment> {
    const output = await this.assessBatchEligibility.execute({
      assignorId,
      referenceDate,
      candidates: receivables.map((receivable) => this.toCandidate(receivable)),
    });
    if (!output.assignorEnabled) {
      return { assignorEnabled: false, assignorStatus: output.assignorStatus };
    }
    return {
      assignorEnabled: true,
      decisions: output.decisions.map((decision) => ({
        position: decision.candidate.position,
        rejectionReasons: decision.violations,
      })),
    };
  }

  async registerAssignment(assignorId: string, receivables: BatchReceivable[]): Promise<void> {
    await this.registerAssignmentUseCase.execute({
      assignorId,
      receivables: receivables.map((receivable) => this.toCandidate(receivable)),
    });
  }

  private toCandidate(receivable: BatchReceivable): ReceivableCandidate {
    return {
      position: receivable.position,
      externalId: receivable.externalId,
      type: receivable.type,
      debtorTaxId: receivable.debtorTaxId,
      faceValue: receivable.faceValue,
      issueDate: receivable.issueDate,
      dueDate: receivable.dueDate,
      invoiceKey: receivable.invoiceKey,
      annualDiscountRateBasisPoints: receivable.annualDiscountRateBasisPoints,
    };
  }
}
