const BRAZILIAN_REAL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const NON_BREAKING_SPACE = new RegExp(String.fromCharCode(160), 'g');

export function formatCents(cents: number): string {
  return BRAZILIAN_REAL.format(cents / 100).replace(NON_BREAKING_SPACE, ' ');
}
