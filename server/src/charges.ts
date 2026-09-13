export const BASE_RATE = 10;
export const DAY_MS = 24 * 60 * 60 * 1000;

export interface ChargeTier {
  label: string;
  days: number;
  rate: number;
  amount: number;
}

export function daysStored(storedAt: string, now: Date = new Date()): number {
  const elapsed = now.getTime() - Date.parse(storedAt);
  if (elapsed <= 0) return 0;
  return Math.ceil(elapsed / DAY_MS);
}

/**
 * X / day for first 5 days, 2X for the next 5, 3X after that.
 * A day is any started 24-hour period from the stored time.
 */
export function calculateCharge(days: number, rate = BASE_RATE): number {
  if (days <= 0) return 0;
  const first = Math.min(days, 5);
  const second = Math.min(Math.max(days - 5, 0), 5);
  const rest = Math.max(days - 10, 0);
  return first * rate + second * rate * 2 + rest * rate * 3;
}

export function chargeBreakdown(days: number, rate = BASE_RATE): ChargeTier[] {
  const first = Math.min(Math.max(days, 0), 5);
  const second = Math.min(Math.max(days - 5, 0), 5);
  const rest = Math.max(days - 10, 0);
  return [
    { label: "Days 1–5", days: first, rate, amount: first * rate },
    { label: "Days 6–10", days: second, rate: rate * 2, amount: second * rate * 2 },
    { label: "Days 11+", days: rest, rate: rate * 3, amount: rest * rate * 3 },
  ].filter((tier) => tier.days > 0);
}
