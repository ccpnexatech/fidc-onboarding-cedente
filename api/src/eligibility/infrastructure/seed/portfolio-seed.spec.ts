import { CalendarDate } from '../../../shared/domain/calendar-date';
import { BusinessCalendar } from '../../domain/calendar/business-calendar';
import { PortfolioExposure } from '../../domain/service/portfolio-exposure';
import { BRAZILIAN_NATIONAL_HOLIDAYS } from '../calendar/brazilian-national-holidays';
import { seedAssignors, seedHoldings } from './portfolio-seed';

describe('Carteira simulada (seed) na data de referência 2026-10-14', () => {
  const referenceDate = new CalendarDate('2026-10-14');
  const holdings = seedHoldings();
  const exposure = new PortfolioExposure(referenceDate, new BusinessCalendar(BRAZILIAN_NATIONAL_HOLIDAYS), holdings);

  it('tem R$ 35 milhões a vencer com prazo médio de cerca de 74 dias úteis', () => {
    const { weightedTermSum, outstandingFaceValue } = exposure.weightedTermSumWith(0, referenceDate);

    expect(outstandingFaceValue).toBe(3_500_000_000);
    expect(weightedTermSum / outstandingFaceValue).toBeCloseTo(74, 0);
  });

  it('reproduz as exposições usadas nos cenários das histórias', () => {
    expect(exposure.assignorExposureOf('11222333000181')).toBe(370_000_000);
    expect(exposure.debtorGroupExposureOf('55666777000181')).toBe(195_000_000);
    expect(exposure.debtorGroupExposureOf('44555666000181')).toBe(100_000_000);
  });

  it('respeita os limites de 4% por sacado e 7,5% por cedente', () => {
    for (const holding of holdings.filter((item) => item.isOpen())) {
      expect(exposure.debtorGroupExposureOf(holding.debtorTaxId)).toBeLessThanOrEqual(200_000_000);
      expect(exposure.assignorExposureOf(holding.assignorId)).toBeLessThanOrEqual(375_000_000);
    }
  });

  it('tem cedentes ativo, suspenso e em análise', () => {
    expect(new Set(seedAssignors().map((assignor) => assignor.status))).toEqual(new Set(['ACTIVE', 'SUSPENDED', 'UNDER_REVIEW']));
  });
});
