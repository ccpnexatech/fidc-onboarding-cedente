import { ReceivableCandidate } from '../../entity/receivable-candidate';
import { RuleViolation } from '../../entity/rule-violation';
import { EvaluationContext } from '../../service/evaluation-context';
import { EligibilityRule } from '../eligibility-rule';

export class DebtorInDefaultRule implements EligibilityRule {
  evaluate(candidate: ReceivableCandidate, context: EvaluationContext): RuleViolation | null {
    // RN-05 · Warehouse 6.1 II; ZIG 6.1 VI
    const daysPastDue = context.maximumDaysPastDueOf(candidate.debtorTaxId);
    if (daysPastDue <= context.parameters.maximumDebtorDelayDays) {
      return null;
    }
    return {
      rule: 'RN-05',
      code: 'RN-05_DEBTOR_IN_DEFAULT',
      message: `O sacado ${candidate.debtorTaxId} tem título vencido e não pago há ${daysPastDue} dias (limite: ${context.parameters.maximumDebtorDelayDays}).`,
    };
  }
}
