import { Module } from '@nestjs/common';
import { BusinessCalendar } from './domain/calendar/business-calendar';
import { FundParameters } from './domain/entity/fund-parameters';
import { AssignorRepository } from './domain/repository/assignor-repository';
import { PortfolioRepository } from './domain/repository/portfolio-repository';
import { EligibilityRule } from './domain/rule/eligibility-rule';
import { AssignorConcentrationRule } from './domain/rule/portfolio/assignor-concentration.rule';
import { DebtorConcentrationRule } from './domain/rule/portfolio/debtor-concentration.rule';
import { WeightedAverageTermRule } from './domain/rule/portfolio/weighted-average-term.rule';
import { DebtorInDefaultRule } from './domain/rule/receivable/debtor-in-default.rule';
import { DuplicateReceivableRule } from './domain/rule/receivable/duplicate-receivable.rule';
import { InvoiceEvidenceRule } from './domain/rule/receivable/invoice-evidence.rule';
import { MinimumDiscountRateRule } from './domain/rule/receivable/minimum-discount-rate.rule';
import { OverdueReceivableRule } from './domain/rule/receivable/overdue-receivable.rule';
import { ReceivableTypeRule } from './domain/rule/receivable/receivable-type.rule';
import { EligibilityEvaluator } from './domain/service/eligibility-evaluator';
import { AssessBatchEligibilityUseCase } from './domain/use-case/assess-batch-eligibility.use-case';
import { RegisterAssignmentUseCase } from './domain/use-case/register-assignment.use-case';
import { BRAZILIAN_NATIONAL_HOLIDAYS } from './infrastructure/calendar/brazilian-national-holidays';
import { fundParametersFromEnvironment } from './infrastructure/fund-parameters.config';
import { MemoryAssignorRepository } from './infrastructure/repository/memory-assignor.repository';
import { MemoryPortfolioRepository } from './infrastructure/repository/memory-portfolio.repository';
import { seedAssignors, seedHoldings } from './infrastructure/seed/portfolio-seed';

const ASSIGNOR_REPOSITORY = Symbol('AssignorRepository');
const PORTFOLIO_REPOSITORY = Symbol('PortfolioRepository');
const FUND_PARAMETERS = Symbol('FundParameters');

export function receivableRules(): EligibilityRule[] {
  return [
    new ReceivableTypeRule(),
    new OverdueReceivableRule(),
    new InvoiceEvidenceRule(),
    new DebtorInDefaultRule(),
    new MinimumDiscountRateRule(),
    new DuplicateReceivableRule(),
  ];
}

export function portfolioRules(): EligibilityRule[] {
  return [new DebtorConcentrationRule(), new AssignorConcentrationRule(), new WeightedAverageTermRule()];
}

@Module({
  providers: [
    { provide: ASSIGNOR_REPOSITORY, useFactory: () => new MemoryAssignorRepository(seedAssignors()) },
    { provide: PORTFOLIO_REPOSITORY, useFactory: () => new MemoryPortfolioRepository(seedHoldings()) },
    { provide: FUND_PARAMETERS, useFactory: () => fundParametersFromEnvironment(process.env) },
    { provide: BusinessCalendar, useFactory: () => new BusinessCalendar(BRAZILIAN_NATIONAL_HOLIDAYS) },
    {
      provide: EligibilityEvaluator,
      useFactory: (calendar: BusinessCalendar, parameters: FundParameters) =>
        new EligibilityEvaluator(receivableRules(), portfolioRules(), calendar, parameters),
      inject: [BusinessCalendar, FUND_PARAMETERS],
    },
    {
      provide: AssessBatchEligibilityUseCase,
      useFactory: (assignors: AssignorRepository, portfolio: PortfolioRepository, evaluator: EligibilityEvaluator) =>
        new AssessBatchEligibilityUseCase(assignors, portfolio, evaluator),
      inject: [ASSIGNOR_REPOSITORY, PORTFOLIO_REPOSITORY, EligibilityEvaluator],
    },
    {
      provide: RegisterAssignmentUseCase,
      useFactory: (portfolio: PortfolioRepository) => new RegisterAssignmentUseCase(portfolio),
      inject: [PORTFOLIO_REPOSITORY],
    },
  ],
  exports: [AssessBatchEligibilityUseCase, RegisterAssignmentUseCase],
})
export class EligibilityModule {}
