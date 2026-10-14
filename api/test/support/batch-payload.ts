export const ACTIVE_ASSIGNOR = '12345678000195';
export const ASSIGNOR_NEAR_LIMIT = '11222333000181';
export const SUSPENDED_ASSIGNOR = '98765432000198';
export const UNKNOWN_ASSIGNOR = '13579246000101';

export const NEW_DEBTOR = '88999000000198';
export const OTHER_NEW_DEBTOR = '99000111000165';
export const DEBTOR_ONE_MILLION = '44555666000181';
export const DEBTOR_NEAR_LIMIT = '55666777000181';
export const DEBTOR_NEAR_LIMIT_BRANCH = '55666777000262';
export const DEBTOR_TEN_DAYS_LATE = '22333444000181';
export const DEBTOR_TWENTY_DAYS_LATE = '33444555000181';

export interface ReceivablePayload {
  externalId: string;
  type: string;
  debtor: { taxId: string; name: string };
  faceValue: number;
  issueDate: string;
  dueDate: string;
  invoiceKey?: string;
  annualDiscountRateBasisPoints: number;
}

let sequence = 0;

export function invoiceKeyFor(externalId: string): string {
  const digits = externalId.replace(/\D/g, '').padStart(10, '0');
  return `3526101234567800019555001${digits}`.padEnd(44, '7').slice(0, 44);
}

export function receivable(overrides: Partial<ReceivablePayload> = {}): ReceivablePayload {
  sequence += 1;
  const externalId = overrides.externalId ?? `DM-TESTE-${String(sequence).padStart(5, '0')}`;
  return {
    externalId,
    type: 'TRADE_BILL',
    debtor: { taxId: NEW_DEBTOR, name: 'Sacado de Teste Ltda' },
    faceValue: 1_000_000,
    issueDate: '2026-10-01',
    dueDate: '2026-12-14',
    invoiceKey: invoiceKeyFor(`${externalId}${sequence}`),
    annualDiscountRateBasisPoints: 2400,
    ...overrides,
  };
}

export function batch(receivables: ReceivablePayload[], assignorId = ACTIVE_ASSIGNOR) {
  return { assignorId, receivables };
}
