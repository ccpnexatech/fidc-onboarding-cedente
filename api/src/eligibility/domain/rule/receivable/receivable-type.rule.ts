import { ReceivableCandidate } from '../../entity/receivable-candidate';
import { RuleViolation } from '../../entity/rule-violation';
import { EvaluationContext } from '../../service/evaluation-context';
import { EligibilityRule } from '../eligibility-rule';

export class ReceivableTypeRule implements EligibilityRule {
  evaluate(candidate: ReceivableCandidate, context: EvaluationContext): RuleViolation | null {
    // RN-01 · BMA 7.24 h
    if (context.parameters.acceptedReceivableTypes.includes(candidate.type)) {
      return null;
    }
    return {
      rule: 'RN-01',
      code: 'RN-01_UNSUPPORTED_RECEIVABLE_TYPE',
      message: `O tipo ${candidate.type} não é aceito pelo fundo.`,
    };
  }
}
