import { CalendarDate } from '../../src/shared/domain/calendar-date';
import { BusinessCalendar } from '../../src/eligibility/domain/calendar/business-calendar';
import { Assignor } from '../../src/eligibility/domain/entity/assignor';
import { FundParameters } from '../../src/eligibility/domain/entity/fund-parameters';
import { PortfolioHolding } from '../../src/eligibility/domain/entity/portfolio-holding';
import { ReceivableCandidate } from '../../src/eligibility/domain/entity/receivable-candidate';
import { AssignorRepository } from '../../src/eligibility/domain/repository/assignor-repository';
import { PortfolioRepository } from '../../src/eligibility/domain/repository/portfolio-repository';
import { EligibilityRule } from '../../src/eligibility/domain/rule/eligibility-rule';
import { EligibilityEvaluator } from '../../src/eligibility/domain/service/eligibility-evaluator';
import { AssessBatchEligibilityUseCase } from '../../src/eligibility/domain/use-case/assess-batch-eligibility.use-case';

export const REFERENCE_DATE = new CalendarDate('2026-10-14');
export const ASSIGNOR = '12345678000195';

export const PARAMETERS: FundParameters = {
  netAssetValue: 5_000_000_000,
  cdiAnnualRateBasisPoints: 1490,
  minimumRatePercentOfCdi: 120,
  debtorConcentrationLimitBasisPoints: 400,
  assignorConcentrationLimitBasisPoints: 750,
  maximumWeightedAverageTermBusinessDays: 75,
  maximumDebtorDelayDays: 15,
  acceptedReceivableTypes: ['TRADE_BILL', 'SERVICE_BILL'],
  receivableTypesRequiringInvoice: ['TRADE_BILL', 'SERVICE_BILL'],
};

export const WEEKENDS_ONLY_CALENDAR = new BusinessCalendar([]);

let sequence = 0;

export function candidate(overrides: Partial<ReceivableCandidate> = {}): ReceivableCandidate {
  sequence += 1;
  return {
    position: sequence,
    externalId: `DM-UNIT-${sequence}`,
    type: 'TRADE_BILL',
    debtorTaxId: '88999000000198',
    faceValue: 1_000_000,
    issueDate: new CalendarDate('2026-10-01'),
    dueDate: new CalendarDate('2026-12-14'),
    invoiceKey: String(sequence).padStart(44, '9'),
    annualDiscountRateBasisPoints: 2400,
    ...overrides,
  };
}

export function holding(overrides: Partial<{
  assignorId: string;
  externalId: string;
  invoiceKey: string | null;
  debtorTaxId: string;
  faceValue: number;
  dueDate: string;
  paidAt: string | null;
}> = {}): PortfolioHolding {
  const values = {
    assignorId: '21000001000106',
    externalId: `DM-CARTEIRA-${(sequence += 1)}`,
    invoiceKey: null,
    debtorTaxId: '65000035000176',
    faceValue: 1_000_000,
    dueDate: '2026-12-14',
    paidAt: null,
    ...overrides,
  };
  return new PortfolioHolding(
    values.assignorId,
    values.externalId,
    values.invoiceKey,
    values.debtorTaxId,
    values.faceValue,
    new CalendarDate(values.dueDate),
    values.paidAt === null ? null : new CalendarDate(values.paidAt),
  );
}

export function assessUseCase(
  holdings: PortfolioHolding[],
  receivableRules: EligibilityRule[],
  portfolioRules: EligibilityRule[] = [],
  calendar: BusinessCalendar = WEEKENDS_ONLY_CALENDAR,
): AssessBatchEligibilityUseCase {
  const assignors: jest.Mocked<AssignorRepository> = {
    findById: jest.fn().mockImplementation(async (id: string) => (id === ASSIGNOR ? new Assignor(ASSIGNOR, 'Alfa', 'ACTIVE') : null)),
  };
  const portfolio: jest.Mocked<PortfolioRepository> = {
    listHoldings: jest.fn().mockResolvedValue(holdings),
    addHoldings: jest.fn(),
  };
  return new AssessBatchEligibilityUseCase(
    assignors,
    portfolio,
    new EligibilityEvaluator(receivableRules, portfolioRules, calendar, PARAMETERS),
  );
}

export async function codesFor(useCase: AssessBatchEligibilityUseCase, candidates: ReceivableCandidate[]): Promise<string[][]> {
  const output = await useCase.execute({ assignorId: ASSIGNOR, referenceDate: REFERENCE_DATE, candidates });
  if (!output.assignorEnabled) {
    throw new Error('cedente deveria estar habilitado');
  }
  return output.decisions.map((decision) => decision.violations.map((violation) => violation.code));
}
