import { CalendarDate } from './calendar-date';

export interface Clock {
  referenceDate(): CalendarDate;
  now(): Date;
}
