export interface FundParameters {
  netAssetValue: number;
  cdiAnnualRateBasisPoints: number;
  minimumRatePercentOfCdi: number;
  debtorConcentrationLimitBasisPoints: number;
  assignorConcentrationLimitBasisPoints: number;
  maximumWeightedAverageTermBusinessDays: number;
  maximumDebtorDelayDays: number;
  acceptedReceivableTypes: string[];
  receivableTypesRequiringInvoice: string[];
}
