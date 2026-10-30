export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Coerces user input to a trimmed string capped at `max` characters. */
export const str = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

export const isIsoDate = (value: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
  new Date(`${value}T00:00:00Z`).toISOString().startsWith(value);

/** Today's date in the salon's timezone (YYYY-MM-DD). */
export const lagosToday = (): string =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' });
