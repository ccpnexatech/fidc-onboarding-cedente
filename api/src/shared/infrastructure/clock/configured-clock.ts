import { CalendarDate } from '../../domain/calendar-date';
import { Clock } from '../../domain/clock';

export const DEFAULT_REFERENCE_DATE = '2026-10-14';
const CURRENT_DATE = 'today';

export class ConfiguredClock implements Clock {
  constructor(private readonly configuredReferenceDate: string) {}

  referenceDate(): CalendarDate {
    if (this.configuredReferenceDate === CURRENT_DATE) {
      return new CalendarDate(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(this.now()));
    }
    return new CalendarDate(this.configuredReferenceDate);
  }

  now(): Date {
    return new Date();
  }
}
