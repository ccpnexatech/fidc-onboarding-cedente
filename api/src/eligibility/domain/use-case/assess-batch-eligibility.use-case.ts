import { CalendarDate } from '../../../shared/domain/calendar-date';
import { AssignorStatus } from '../entity/assignor';
import { ReceivableCandidate } from '../entity/receivable-candidate';
import { AssignorRepository } from '../repository/assignor-repository';
import { PortfolioRepository } from '../repository/portfolio-repository';
import { EligibilityEvaluator, ReceivableDecision } from '../service/eligibility-evaluator';

export interface AssessBatchEligibilityInput {
  assignorId: string;
  referenceDate: CalendarDate;
  candidates: ReceivableCandidate[];
}

export type AssessBatchEligibilityOutput =
  | { assignorEnabled: false; assignorStatus: AssignorStatus | null }
  | { assignorEnabled: true; decisions: ReceivableDecision[] };

export class AssessBatchEligibilityUseCase {
  constructor(
    private readonly assignorRepository: AssignorRepository,
    private readonly portfolioRepository: PortfolioRepository,
    private readonly evaluator: EligibilityEvaluator,
  ) {}

  async execute(input: AssessBatchEligibilityInput): Promise<AssessBatchEligibilityOutput> {
    const assignor = await this.assignorRepository.findById(input.assignorId);
    // RN-10 · ZIG 6.1 I
    if (assignor === null || !assignor.isEnabled()) {
      return { assignorEnabled: false, assignorStatus: assignor === null ? null : assignor.status };
    }
    const holdings = await this.portfolioRepository.listHoldings();
    const decisions = this.evaluator.evaluate(input.assignorId, input.referenceDate, input.candidates, holdings);
    return { assignorEnabled: true, decisions };
  }
}
