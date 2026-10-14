import { CalendarDate, InvalidCalendarDateError } from './calendar-date';
import { economicGroupOf, isValidTaxId } from './tax-id';

describe('CalendarDate', () => {
  it('rejeita data inexistente', () => {
    expect(() => new CalendarDate('2026-02-30')).toThrow(InvalidCalendarDateError);
  });

  it('conta dias corridos e soma dias', () => {
    const start = new CalendarDate('2026-09-24');
    expect(start.daysUntil(new CalendarDate('2026-10-14'))).toBe(20);
    expect(start.plusDays(8).toString()).toBe('2026-10-02');
  });

  it('identifica fim de semana', () => {
    expect(new CalendarDate('2026-10-17').isWeekend()).toBe(true);
    expect(new CalendarDate('2026-10-14').isWeekend()).toBe(false);
  });
});

describe('TaxId', () => {
  it.each(['12345678000195', '11222333000181', '52998224725'])('aceita %s', (value) => {
    expect(isValidTaxId(value)).toBe(true);
  });

  it.each(['12345678000100', '11111111111111', '12345678901', '123'])('recusa %s', (value) => {
    expect(isValidTaxId(value)).toBe(false);
  });

  it('agrupa matriz e filial pela raiz do CNPJ', () => {
    expect(economicGroupOf('55666777000181')).toBe(economicGroupOf('55666777000262'));
    expect(economicGroupOf('52998224725')).toBe('52998224725');
  });
});
