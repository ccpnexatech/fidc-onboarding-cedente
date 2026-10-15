import { CalendarDate } from '../../../shared/domain/calendar-date';
import { DebtorInDefaultRule } from '../rule/receivable/debtor-in-default.rule';
import { DuplicateReceivableRule } from '../rule/receivable/duplicate-receivable.rule';
import { InvoiceEvidenceRule } from '../rule/receivable/invoice-evidence.rule';
import { MinimumDiscountRateRule } from '../rule/receivable/minimum-discount-rate.rule';
import { OverdueReceivableRule } from '../rule/receivable/overdue-receivable.rule';
import { ReceivableTypeRule } from '../rule/receivable/receivable-type.rule';
import { ASSIGNOR, assessUseCase, candidate, codesFor, holding, REFERENCE_DATE } from '../../../../test/support/eligibility-fixture';

const TITLE_RULES = [
  new ReceivableTypeRule(),
  new OverdueReceivableRule(),
  new InvoiceEvidenceRule(),
  new DebtorInDefaultRule(),
  new MinimumDiscountRateRule(),
  new DuplicateReceivableRule(),
];

describe('Regras do título (AssessBatchEligibilityUseCase com portas mockadas)', () => {
  describe('HU-03 · Barrar título inválido na origem', () => {
    it('duplicata válida é aceita', async () => {
      expect(await codesFor(assessUseCase([], TITLE_RULES), [candidate()])).toEqual([[]]);
    });

    it('cheque é rejeitado com RN-01', async () => {
      const codes = await codesFor(assessUseCase([], TITLE_RULES), [candidate({ type: 'CHECK', invoiceKey: null })]);
      expect(codes).toEqual([['RN-01_UNSUPPORTED_RECEIVABLE_TYPE']]);
    });

    it('título vencido é rejeitado com RN-02', async () => {
      const codes = await codesFor(assessUseCase([], TITLE_RULES), [candidate({ dueDate: new CalendarDate('2026-10-10') })]);
      expect(codes).toEqual([['RN-02_RECEIVABLE_OVERDUE']]);
    });

    it('título que vence na data de referência não está vencido', async () => {
      expect(await codesFor(assessUseCase([], TITLE_RULES), [candidate({ dueDate: REFERENCE_DATE })])).toEqual([[]]);
    });

    it('duplicata sem nota fiscal é rejeitada com RN-04', async () => {
      const codes = await codesFor(assessUseCase([], TITLE_RULES), [candidate({ invoiceKey: null })]);
      expect(codes).toEqual([['RN-04_MISSING_INVOICE_EVIDENCE']]);
    });

    it('título com mais de um problema traz todos os motivos', async () => {
      const codes = await codesFor(assessUseCase([], TITLE_RULES), [
        candidate({ dueDate: new CalendarDate('2026-10-10'), invoiceKey: null }),
      ]);
      expect(codes).toEqual([['RN-02_RECEIVABLE_OVERDUE', 'RN-04_MISSING_INVOICE_EVIDENCE']]);
    });
  });

  describe('HU-04 · Barrar sacado inadimplente', () => {
    const lateTenDays = holding({ debtorTaxId: '22333444000181', dueDate: '2026-10-04' });
    const lateTwentyDays = holding({ debtorTaxId: '33444555000181', dueDate: '2026-09-24' });

    it('sacado com atraso de até 15 dias tem o título aceito', async () => {
      const codes = await codesFor(assessUseCase([lateTenDays], TITLE_RULES), [candidate({ debtorTaxId: '22333444000181' })]);
      expect(codes).toEqual([[]]);
    });

    it('sacado com atraso acima de 15 dias é rejeitado com RN-05', async () => {
      const codes = await codesFor(assessUseCase([lateTwentyDays], TITLE_RULES), [candidate({ debtorTaxId: '33444555000181' })]);
      expect(codes).toEqual([['RN-05_DEBTOR_IN_DEFAULT']]);
    });

    it('título vencido e já pago não conta como atraso', async () => {
      const paid = holding({ debtorTaxId: '33444555000181', dueDate: '2026-09-24', paidAt: '2026-09-25' });
      const codes = await codesFor(assessUseCase([paid], TITLE_RULES), [candidate({ debtorTaxId: '33444555000181' })]);
      expect(codes).toEqual([[]]);
    });
  });

  describe('HU-05 · Garantir a taxa mínima', () => {
    it('taxa de 24% a.a. (acima de 120% do CDI de 14,90%) é aceita', async () => {
      expect(await codesFor(assessUseCase([], TITLE_RULES), [candidate({ annualDiscountRateBasisPoints: 2400 })])).toEqual([[]]);
    });

    it('taxa exatamente no mínimo de 17,88% a.a. é aceita', async () => {
      expect(await codesFor(assessUseCase([], TITLE_RULES), [candidate({ annualDiscountRateBasisPoints: 1788 })])).toEqual([[]]);
    });

    it('taxa de 16% a.a. é rejeitada com RN-06', async () => {
      const codes = await codesFor(assessUseCase([], TITLE_RULES), [candidate({ annualDiscountRateBasisPoints: 1600 })]);
      expect(codes).toEqual([['RN-06_DISCOUNT_RATE_BELOW_MINIMUM']]);
    });
  });

  describe('HU-07 · Impedir cessão em duplicidade', () => {
    const existing = holding({ assignorId: ASSIGNOR, externalId: 'DM-2026-0001', invoiceKey: '1'.repeat(44), dueDate: '2026-12-11', faceValue: 30_000_000 });

    it('título novo é aceito', async () => {
      expect(await codesFor(assessUseCase([existing], TITLE_RULES), [candidate({ externalId: 'DM-2026-0500' })])).toEqual([[]]);
    });

    it('título já na carteira é rejeitado com RN-09', async () => {
      const codes = await codesFor(assessUseCase([existing], TITLE_RULES), [candidate({ externalId: 'DM-2026-0001' })]);
      expect(codes).toEqual([['RN-09_DUPLICATE_RECEIVABLE']]);
    });

    it('mesma nota, vencimento e valor com outro externalId também é duplicidade', async () => {
      const sameInstallment = candidate({
        externalId: 'DM-OUTRO-ID',
        invoiceKey: '1'.repeat(44),
        dueDate: new CalendarDate('2026-12-11'),
        faceValue: 30_000_000,
      });
      expect(await codesFor(assessUseCase([existing], TITLE_RULES), [sameInstallment])).toEqual([['RN-09_DUPLICATE_RECEIVABLE']]);
    });

    it('título repetido na mesma remessa: a primeira ocorrência entra, a segunda é rejeitada', async () => {
      const codes = await codesFor(assessUseCase([], TITLE_RULES), [
        candidate({ externalId: 'DM-2026-0600' }),
        candidate({ externalId: 'DM-2026-0600' }),
      ]);
      expect(codes).toEqual([[], ['RN-09_DUPLICATE_RECEIVABLE']]);
    });
  });
});
