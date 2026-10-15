import { ReceivableCandidate } from '../../entity/receivable-candidate';
import { RuleViolation } from '../../entity/rule-violation';
import { EvaluationContext } from '../../service/evaluation-context';
import { EligibilityRule } from '../eligibility-rule';

export class InvoiceEvidenceRule implements EligibilityRule {
  evaluate(candidate: ReceivableCandidate, context: EvaluationContext): RuleViolation | null {
    // RN-04 · BMA 7.25 (iii)
    if (!context.parameters.receivableTypesRequiringInvoice.includes(candidate.type) || candidate.invoiceKey !== null) {
      return null;
    }
    return {
      rule: 'RN-04',
      code: 'RN-04_MISSING_INVOICE_EVIDENCE',
      message: 'Duplicata sem chave da nota fiscal (invoiceKey).',
    };
  }
}
