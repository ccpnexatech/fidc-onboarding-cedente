import { ReceivableCandidate } from '../../entity/receivable-candidate';
import { RuleViolation } from '../../entity/rule-violation';
import { EvaluationContext } from '../../service/evaluation-context';
import { EligibilityRule } from '../eligibility-rule';

export class DuplicateReceivableRule implements EligibilityRule {
  evaluate(candidate: ReceivableCandidate, context: EvaluationContext): RuleViolation | null {
    // RN-09 · Anexo II art. 36
    if (!context.isKnownTitle(candidate)) {
      return null;
    }
    return {
      rule: 'RN-09',
      code: 'RN-09_DUPLICATE_RECEIVABLE',
      message: `O título ${candidate.externalId} já foi cedido ou aparece antes nesta remessa.`,
    };
  }
}
