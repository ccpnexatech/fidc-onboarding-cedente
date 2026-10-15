import { CalendarDate } from '../../../shared/domain/calendar-date';
import { AssignorConcentrationRule } from '../rule/portfolio/assignor-concentration.rule';
import { DebtorConcentrationRule } from '../rule/portfolio/debtor-concentration.rule';
import { WeightedAverageTermRule } from '../rule/portfolio/weighted-average-term.rule';
import { ReceivableTypeRule } from '../rule/receivable/receivable-type.rule';
import {
  ASSIGNOR,
  assessUseCase,
  candidate,
  codesFor,
  holding,
  REFERENCE_DATE,
  WEEKENDS_ONLY_CALENDAR,
} from '../../../../test/support/eligibility-fixture';

const PORTFOLIO_RULES = [new DebtorConcentrationRule(), new AssignorConcentrationRule(), new WeightedAverageTermRule()];

function inBusinessDays(days: number): CalendarDate {
  let cursor = REFERENCE_DATE;
  while (WEEKENDS_ONLY_CALENDAR.businessDaysBetween(REFERENCE_DATE, cursor) < days) {
    cursor = cursor.plusDays(1);
  }
  return cursor;
}

describe('Regras da carteira (AssessBatchEligibilityUseCase com portas mockadas)', () => {
  describe('HU-06 · Respeitar os limites de concentração', () => {
    it('sacado com R$ 1.000.000,00 recebe título de R$ 500.000,00', async () => {
      const useCase = assessUseCase([holding({ debtorTaxId: '44555666000181', faceValue: 100_000_000 })], [], PORTFOLIO_RULES);
      expect(await codesFor(useCase, [candidate({ debtorTaxId: '44555666000181', faceValue: 50_000_000 })])).toEqual([[]]);
    });

    it('sacado com R$ 1.950.000,00 não recebe título de R$ 60.000,00 (RN-07, 4% do PL)', async () => {
      const useCase = assessUseCase([holding({ debtorTaxId: '55666777000181', faceValue: 195_000_000 })], [], PORTFOLIO_RULES);
      const codes = await codesFor(useCase, [candidate({ debtorTaxId: '55666777000181', faceValue: 6_000_000 })]);
      expect(codes).toEqual([['RN-07_DEBTOR_CONCENTRATION_EXCEEDED']]);
    });

    it('filial conta no grupo econômico do sacado (RN-07)', async () => {
      const useCase = assessUseCase([holding({ debtorTaxId: '55666777000181', faceValue: 195_000_000 })], [], PORTFOLIO_RULES);
      const codes = await codesFor(useCase, [candidate({ debtorTaxId: '55666777000262', faceValue: 6_000_000 })]);
      expect(codes).toEqual([['RN-07_DEBTOR_CONCENTRATION_EXCEEDED']]);
    });

    it('exatamente 4% do PL ainda é aceito', async () => {
      const useCase = assessUseCase([holding({ debtorTaxId: '55666777000181', faceValue: 195_000_000 })], [], PORTFOLIO_RULES);
      expect(await codesFor(useCase, [candidate({ debtorTaxId: '55666777000181', faceValue: 5_000_000 })])).toEqual([[]]);
    });

    it('cedente com R$ 3.700.000,00 não cede título de R$ 100.000,00 (RN-08, 7,5% do PL)', async () => {
      const useCase = assessUseCase([holding({ assignorId: ASSIGNOR, faceValue: 370_000_000 })], [], PORTFOLIO_RULES);
      expect(await codesFor(useCase, [candidate({ faceValue: 10_000_000 })])).toEqual([['RN-08_ASSIGNOR_CONCENTRATION_EXCEEDED']]);
    });

    it('o limite considera os títulos aceitos antes na mesma remessa', async () => {
      const useCase = assessUseCase([holding({ assignorId: ASSIGNOR, faceValue: 370_000_000 })], [], PORTFOLIO_RULES);
      const codes = await codesFor(useCase, [candidate({ faceValue: 4_000_000 }), candidate({ faceValue: 4_000_000 })]);
      expect(codes).toEqual([[], ['RN-08_ASSIGNOR_CONCENTRATION_EXCEEDED']]);
    });

    it('título rejeitado por regra do título não consome limite da carteira', async () => {
      const useCase = assessUseCase([holding({ assignorId: ASSIGNOR, faceValue: 370_000_000 })], [new ReceivableTypeRule()], PORTFOLIO_RULES);
      const codes = await codesFor(useCase, [candidate({ type: 'CHECK', faceValue: 4_000_000 }), candidate({ faceValue: 4_000_000 })]);
      expect(codes).toEqual([['RN-01_UNSUPPORTED_RECEIVABLE_TYPE'], []]);
    });

    it('título pago não conta na exposição', async () => {
      const paid = holding({ assignorId: ASSIGNOR, faceValue: 370_000_000, dueDate: '2026-09-30', paidAt: '2026-09-30' });
      expect(await codesFor(assessUseCase([paid], [], PORTFOLIO_RULES), [candidate({ faceValue: 10_000_000 })])).toEqual([[]]);
    });
  });

  describe('HU-08 · Manter o prazo médio da carteira', () => {
    const portfolioAt74 = () => [holding({ faceValue: 3_500_000_000, dueDate: inBusinessDays(74).toString(), debtorTaxId: '65000035000176' })];

    it('título curto (R$ 100.000,00 a 40 dias úteis) é aceito', async () => {
      const codes = await codesFor(assessUseCase(portfolioAt74(), [], PORTFOLIO_RULES), [
        candidate({ faceValue: 10_000_000, dueDate: inBusinessDays(40) }),
      ]);
      expect(codes).toEqual([[]]);
    });

    it('título longo e grande (R$ 1.000.000,00 a 200 dias úteis) é rejeitado com RN-03', async () => {
      const codes = await codesFor(assessUseCase(portfolioAt74(), [], PORTFOLIO_RULES), [
        candidate({ faceValue: 100_000_000, dueDate: inBusinessDays(200) }),
      ]);
      expect(codes).toEqual([['RN-03_WEIGHTED_AVERAGE_TERM_EXCEEDED']]);
    });

    it('concentração é avaliada antes do prazo médio', async () => {
      const portfolio = [...portfolioAt74(), holding({ debtorTaxId: '55666777000181', faceValue: 195_000_000, dueDate: inBusinessDays(74).toString() })];
      const codes = await codesFor(assessUseCase(portfolio, [], PORTFOLIO_RULES), [
        candidate({ debtorTaxId: '55666777000181', faceValue: 100_000_000, dueDate: inBusinessDays(200) }),
      ]);
      expect(codes).toEqual([['RN-07_DEBTOR_CONCENTRATION_EXCEEDED']]);
    });
  });
});
