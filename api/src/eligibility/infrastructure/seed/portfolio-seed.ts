import { CalendarDate } from '../../../shared/domain/calendar-date';
import { Assignor, AssignorStatus } from '../../domain/entity/assignor';
import { PortfolioHolding } from '../../domain/entity/portfolio-holding';
import seed from './portfolio-seed.json';

interface SeedHolding {
  assignorId: string;
  externalId: string;
  invoiceKey: string | null;
  debtorTaxId: string;
  faceValue: number;
  dueDate: string;
  paidAt: string | null;
}

interface SeedAssignor {
  id: string;
  name: string;
  status: string;
}

export function seedAssignors(): Assignor[] {
  return (seed.assignors as SeedAssignor[]).map(
    (item) => new Assignor(item.id, item.name, item.status as AssignorStatus),
  );
}

export function seedHoldings(): PortfolioHolding[] {
  return (seed.holdings as SeedHolding[]).map(
    (item) =>
      new PortfolioHolding(
        item.assignorId,
        item.externalId,
        item.invoiceKey,
        item.debtorTaxId,
        item.faceValue,
        new CalendarDate(item.dueDate),
        item.paidAt === null ? null : new CalendarDate(item.paidAt),
      ),
  );
}
