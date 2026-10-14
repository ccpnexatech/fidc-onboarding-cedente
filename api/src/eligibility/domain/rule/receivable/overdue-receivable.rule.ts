import { ReceivableCandidate } from '../../entity/receivable-candidate';
import { RuleViolation } from '../../entity/rule-violation';
import { EvaluationContext } from '../../service/evaluation-context';
import { EligibilityRule } from '../eligibility-rule';

export class OverdueReceivableRule implements EligibilityRule {
  evaluate(candidate: ReceivableCandidate, context: EvaluationContext): RuleViolation | null {
    // RN-02 · BMA 7.25 (ii); ZIG 6.1 III
    if (!candidate.dueDate.isBefore(context.referenceDate)) {
      return null;
    }
    return {
      rule: 'RN-02',
      code: 'RN-02_RECEIVABLE_OVERDUE',
      message: `Vencimento ${candidate.dueDate.toString()} anterior à data de referência ${context.referenceDate.toString()}.`,
    };
  }
}
