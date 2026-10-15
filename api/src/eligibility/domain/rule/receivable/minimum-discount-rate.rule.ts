import { ReceivableCandidate } from '../../entity/receivable-candidate';
import { RuleViolation } from '../../entity/rule-violation';
import { EvaluationContext } from '../../service/evaluation-context';
import { EligibilityRule } from '../eligibility-rule';

export class MinimumDiscountRateRule implements EligibilityRule {
  evaluate(candidate: ReceivableCandidate, context: EvaluationContext): RuleViolation | null {
    const { cdiAnnualRateBasisPoints, minimumRatePercentOfCdi } = context.parameters;
    // RN-06 · Warehouse 6.1 I
    if (candidate.annualDiscountRateBasisPoints * 100 >= cdiAnnualRateBasisPoints * minimumRatePercentOfCdi) {
      return null;
    }
    const minimum = (cdiAnnualRateBasisPoints * minimumRatePercentOfCdi) / 100;
    return {
      rule: 'RN-06',
      code: 'RN-06_DISCOUNT_RATE_BELOW_MINIMUM',
      message: `Taxa de ${candidate.annualDiscountRateBasisPoints} pontos-base abaixo do mínimo de ${minimum} (${minimumRatePercentOfCdi}% do CDI).`,
    };
  }
}
