import { CalendarDate } from '../../../shared/domain/calendar-date';
import { BusinessCalendar } from '../calendar/business-calendar';
import { FundParameters } from '../entity/fund-parameters';
import { PortfolioHolding } from '../entity/portfolio-holding';
import { ReceivableCandidate } from '../entity/receivable-candidate';
import { RuleViolation } from '../entity/rule-violation';
import { EligibilityRule } from '../rule/eligibility-rule';
import { EvaluationContext } from './evaluation-context';

export interface ReceivableDecision {
  candidate: ReceivableCandidate;
  violations: RuleViolation[];
}

export class EligibilityEvaluator {
  constructor(
    private readonly receivableRules: EligibilityRule[],
    private readonly portfolioRules: EligibilityRule[],
    private readonly calendar: BusinessCalendar,
    private readonly parameters: FundParameters,
  ) {}

  evaluate(
    assignorId: string,
    referenceDate: CalendarDate,
    candidates: ReceivableCandidate[],
    holdings: PortfolioHolding[],
  ): ReceivableDecision[] {
    const context = new EvaluationContext(assignorId, referenceDate, this.parameters, holdings, this.calendar);
    return candidates.map((candidate) => {
      const violations = this.receivableRules
        .map((rule) => rule.evaluate(candidate, context))
        .filter((violation): violation is RuleViolation => violation !== null);
      context.rememberCandidate(candidate);
      if (violations.length > 0) {
        return { candidate, violations };
      }
      const portfolioViolation = this.firstPortfolioViolation(candidate, context);
      if (portfolioViolation !== null) {
        return { candidate, violations: [portfolioViolation] };
      }
      context.exposure.add({ ...candidate, assignorId });
      return { candidate, violations: [] };
    });
  }

  private firstPortfolioViolation(candidate: ReceivableCandidate, context: EvaluationContext): RuleViolation | null {
    for (const rule of this.portfolioRules) {
      const violation = rule.evaluate(candidate, context);
      if (violation !== null) {
        return violation;
      }
    }
    return null;
  }
}
