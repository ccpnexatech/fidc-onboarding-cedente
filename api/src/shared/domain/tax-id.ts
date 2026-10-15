const CNPJ_LENGTH = 14;
const CPF_LENGTH = 11;
const CNPJ_ROOT_LENGTH = 8;

function checkDigit(digits: string, weights: number[]): string {
  const sum = weights.reduce((total, weight, index) => total + Number(digits[index]) * weight, 0);
  const remainder = sum % 11;
  return remainder < 2 ? '0' : String(11 - remainder);
}

function isValidCnpj(digits: string): boolean {
  if (/^(\d)\1{13}$/.test(digits)) {
    return false;
  }
  const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const secondWeights = [6, ...firstWeights];
  const first = checkDigit(digits, firstWeights);
  const second = checkDigit(digits.slice(0, 12) + first, secondWeights);
  return digits.slice(12) === first + second;
}

function isValidCpf(digits: string): boolean {
  if (/^(\d)\1{10}$/.test(digits)) {
    return false;
  }
  const first = checkDigit(digits, [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = checkDigit(digits.slice(0, 9) + first, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  return digits.slice(9) === first + second;
}

export function isValidTaxId(value: string): boolean {
  if (!/^\d+$/.test(value)) {
    return false;
  }
  if (value.length === CNPJ_LENGTH) {
    return isValidCnpj(value);
  }
  if (value.length === CPF_LENGTH) {
    return isValidCpf(value);
  }
  return false;
}

export function economicGroupOf(taxId: string): string {
  return taxId.length === CNPJ_LENGTH ? taxId.slice(0, CNPJ_ROOT_LENGTH) : taxId;
}
