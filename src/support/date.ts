import { isString } from "./typeGuards";

const CALENDAR_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

const pad = (n: number): string => `${Math.floor(Math.abs(n))}`.padStart(2, "0");

/**
 * Reads a date given as a string: a calendar day ("YYYY-MM-DD") is read as the local midnight of that day, so that it
 * stays the same day in every time zone; any other string is read as an instant (RFC 3339).
 */
export const toDate = (value: Date | string): Date => {
  if (!isString(value)) {
    return value;
  }

  const day = CALENDAR_DAY.exec(value);

  return day ? new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3])) : new Date(value);
};

/**
 * Writes the local day of a date as a calendar day ("YYYY-MM-DD"), without time nor time zone.
 */
export const toCalendarDay = (date: Date): string => {
  return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
};
