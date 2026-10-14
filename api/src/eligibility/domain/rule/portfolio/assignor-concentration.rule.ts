import { formatCents } from '../../../../shared/domain/money';
import { ReceivableCandidate } from '../../entity/receivable-candidate';
import { RuleViolation } from '../../entity/rule-violation';
import { EvaluationContext } from '../../service/evaluation-context';
import { EligibilityRule } from '../eligibility-rule';

export class AssignorConcentrationRule implements EligibilityRule {
  evaluate(candidate: ReceivableCandidate, context: EvaluationContext): RuleViolation | null {
    const { netAssetValue, assignorConcentrationLimitBasisPoints } = context.parameters;
    const exposureAfter = context.exposure.assignorExposureOf(context.assignorId) + candidate.faceValue;
    // RN-08 · BMA 7.24 a
    if (exposureAfter * 10_000 <= netAssetValue * assignorConcentrationLimitBasisPoints) {
      return null;
    }
    const limit = (netAssetValue * assignorConcentrationLimitBasisPoints) / 10_000;
    return {
      rule: 'RN-08',
      code: 'RN-08_ASSIGNOR_CONCENTRATION_EXCEEDED',
      message: `A exposição ao cedente ${context.assignorId} iria a ${formatCents(exposureAfter)} (limite: ${formatCents(limit)}, ${assignorConcentrationLimitBasisPoints / 100}% do PL).`,
    };
  }
}
