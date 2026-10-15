import { Module } from '@nestjs/common';
import { BusinessCalendar } from './domain/calendar/business-calendar';
import { FundParameters } from './domain/entity/fund-parameters';
import { AssignorRepository } from './domain/repository/assignor-repository';
import { PortfolioRepository } from './domain/repository/portfolio-repository';
import { EligibilityRule } from './domain/rule/eligibility-rule';
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
  return [];
}

export function portfolioRules(): EligibilityRule[] {
  return [];
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
