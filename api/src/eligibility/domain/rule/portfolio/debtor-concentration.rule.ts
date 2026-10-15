import { formatCents } from '../../../../shared/domain/money';
import { ReceivableCandidate } from '../../entity/receivable-candidate';
import { RuleViolation } from '../../entity/rule-violation';
import { EvaluationContext } from '../../service/evaluation-context';
import { EligibilityRule } from '../eligibility-rule';

export class DebtorConcentrationRule implements EligibilityRule {
  evaluate(candidate: ReceivableCandidate, context: EvaluationContext): RuleViolation | null {
    const { netAssetValue, debtorConcentrationLimitBasisPoints } = context.parameters;
    const exposureAfter = context.exposure.debtorGroupExposureOf(candidate.debtorTaxId) + candidate.faceValue;
    // RN-07 · BMA 7.24 b; Anexo II art. 45 caput e §1º
    if (exposureAfter * 10_000 <= netAssetValue * debtorConcentrationLimitBasisPoints) {
      return null;
    }
    const limit = (netAssetValue * debtorConcentrationLimitBasisPoints) / 10_000;
    return {
      rule: 'RN-07',
      code: 'RN-07_DEBTOR_CONCENTRATION_EXCEEDED',
      message: `A exposição ao grupo do sacado ${candidate.debtorTaxId} iria a ${formatCents(exposureAfter)} (limite: ${formatCents(limit)}, ${debtorConcentrationLimitBasisPoints / 100}% do PL).`,
    };
  }
}
