import { CalendarDate } from '../../../shared/domain/calendar-date';

export class BusinessCalendar {
  private readonly holidays: Set<string>;

  constructor(holidays: string[]) {
    this.holidays = new Set(holidays);
  }

  isBusinessDay(date: CalendarDate): boolean {
    return !date.isWeekend() && !this.holidays.has(date.toString());
  }

  businessDaysBetween(start: CalendarDate, end: CalendarDate): number {
    let count = 0;
    let cursor = start;
    while (cursor.isBefore(end)) {
      cursor = cursor.plusDays(1);
      if (this.isBusinessDay(cursor)) {
        count += 1;
      }
    }
    return count;
  }
}
