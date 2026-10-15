import { ReceivableCandidate } from '../../entity/receivable-candidate';
import { RuleViolation } from '../../entity/rule-violation';
import { EvaluationContext } from '../../service/evaluation-context';
import { EligibilityRule } from '../eligibility-rule';

export class WeightedAverageTermRule implements EligibilityRule {
  evaluate(candidate: ReceivableCandidate, context: EvaluationContext): RuleViolation | null {
    const maximum = context.parameters.maximumWeightedAverageTermBusinessDays;
    const { weightedTermSum, outstandingFaceValue } = context.exposure.weightedTermSumWith(candidate.faceValue, candidate.dueDate);
    // RN-03 · BMA 7.25 (iv)
    if (weightedTermSum <= maximum * outstandingFaceValue) {
      return null;
    }
    const average = (weightedTermSum / outstandingFaceValue).toFixed(1);
    return {
      rule: 'RN-03',
      code: 'RN-03_WEIGHTED_AVERAGE_TERM_EXCEEDED',
      message: `Com este título, o prazo médio ponderado da carteira iria a ${average} dias úteis (limite: ${maximum}).`,
    };
  }
}
