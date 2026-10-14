const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MILLISECONDS_PER_DAY = 86_400_000;

export class InvalidCalendarDateError extends Error {
  constructor(text: string) {
    super(`Data inválida: ${text}`);
  }
}

export class CalendarDate {
  private readonly epochDay: number;

  constructor(text: string) {
    const match = ISO_DATE.exec(text);
    if (!match) {
      throw new InvalidCalendarDateError(text);
    }
    const [, year, month, day] = match;
    const utc = Date.UTC(Number(year), Number(month) - 1, Number(day));
    const parsed = new Date(utc);
    if (parsed.getUTCMonth() !== Number(month) - 1 || parsed.getUTCDate() !== Number(day)) {
      throw new InvalidCalendarDateError(text);
    }
    this.epochDay = utc / MILLISECONDS_PER_DAY;
  }

  toString(): string {
    return new Date(this.epochDay * MILLISECONDS_PER_DAY).toISOString().slice(0, 10);
  }

  isBefore(other: CalendarDate): boolean {
    return this.epochDay < other.epochDay;
  }

  isAfter(other: CalendarDate): boolean {
    return this.epochDay > other.epochDay;
  }

  equals(other: CalendarDate): boolean {
    return this.epochDay === other.epochDay;
  }

  daysUntil(later: CalendarDate): number {
    return later.epochDay - this.epochDay;
  }

  plusDays(days: number): CalendarDate {
    return new CalendarDate(new Date((this.epochDay + days) * MILLISECONDS_PER_DAY).toISOString().slice(0, 10));
  }

  isWeekend(): boolean {
    const weekday = new Date(this.epochDay * MILLISECONDS_PER_DAY).getUTCDay();
    return weekday === 0 || weekday === 6;
  }
}
