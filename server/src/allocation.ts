import type { Locker, Size } from "./types.js";

export const SIZE_RANK: Record<Size, number> = {
  SMALL: 1,
  MEDIUM: 2,
  LARGE: 3,
  REGULAR: 2.5,
};

export function canFit(lockerSize: Size, packageSize: Size): boolean {
  return SIZE_RANK[lockerSize] >= SIZE_RANK[packageSize];
}

/** Prefer the smallest available locker that can hold the package. */
export function assignLocker(lockers: Locker[], packageSize: Size): Locker | null {
  const candidates = lockers
    .filter((locker) => locker.status === "AVAILABLE" && canFit(locker.size, packageSize))
    .sort((a, b) => SIZE_RANK[a.size] - SIZE_RANK[b.size] || a.code.localeCompare(b.code));
  return candidates[0] ?? null;
}
