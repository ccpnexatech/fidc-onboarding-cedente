import { ReceivableCandidate } from '../entity/receivable-candidate';
import { RuleViolation } from '../entity/rule-violation';
import { EvaluationContext } from '../service/evaluation-context';

export interface EligibilityRule {
  evaluate(candidate: ReceivableCandidate, context: EvaluationContext): RuleViolation | null;
}
