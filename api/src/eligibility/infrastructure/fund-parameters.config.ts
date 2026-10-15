import { FundParameters } from '../domain/entity/fund-parameters';

export function fundParametersFromEnvironment(environment: NodeJS.ProcessEnv): FundParameters {
  return {
    netAssetValue: Number(environment.FUND_NET_ASSET_VALUE ?? 5_000_000_000),
    cdiAnnualRateBasisPoints: Number(environment.CDI_ANNUAL_RATE_BASIS_POINTS ?? 1490),
    minimumRatePercentOfCdi: 120,
    debtorConcentrationLimitBasisPoints: 400,
    assignorConcentrationLimitBasisPoints: 750,
    maximumWeightedAverageTermBusinessDays: 75,
    maximumDebtorDelayDays: 15,
    acceptedReceivableTypes: ['TRADE_BILL', 'SERVICE_BILL'],
    receivableTypesRequiringInvoice: ['TRADE_BILL', 'SERVICE_BILL'],
  };
}
