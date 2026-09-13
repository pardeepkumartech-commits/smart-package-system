import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { hashPassword } from "./auth.js";
import type { Database, Locker, PackageRecord, User } from "./types.js";

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "data");
const DATA_FILE = join(DATA_DIR, "db.json");

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function seed(): Database {
  const pass = hashPassword("locker-demo");

  const users: User[] = [
    {
      id: "u-agent",
      email: "agent@locker.test",
      name: "Jordan Hale",
      passwordHash: pass,
      role: "AGENT",
    },
    {
      id: "u-customer",
      email: "customer@locker.test",
      name: "Alex Rivera",
      passwordHash: pass,
      role: "CUSTOMER",
    },
  ];

  const lockers: Locker[] = [
    ...["S-01", "S-02", "S-03", "S-04", "S-05", "S-06"].map((code, i) => ({
      id: `lk-s-${i + 1}`,
      code,
      size: "SMALL" as const,
      status: "AVAILABLE" as const,
      packageId: null,
    })),
    ...["M-01", "M-02", "M-03", "M-04"].map((code, i) => ({
      id: `lk-m-${i + 1}`,
      code,
      size: "MEDIUM" as const,
      status: "AVAILABLE" as const,
      packageId: null,
    })),
    ...["L-01", "L-02", "L-03"].map((code, i) => ({
      id: `lk-l-${i + 1}`,
      code,
      size: "LARGE" as const,
      status: "AVAILABLE" as const,
      packageId: null,
    })),
  ];

  const packages: PackageRecord[] = [
    {
      id: "pkg-1",
      trackingNumber: "PKG-1001",
      customerName: "Maya Chen",
      size: "SMALL",
      lockerId: "lk-s-2",
      pickupCode: "482193",
      storedAt: hoursAgo(48),
      retrievedAt: null,
      storageCharge: null,
      storedBy: "u-agent",
    },
    {
      id: "pkg-2",
      trackingNumber: "PKG-1002",
      customerName: "Omar Haddad",
      size: "MEDIUM",
      lockerId: "lk-m-1",
      pickupCode: "719204",
      storedAt: hoursAgo(7 * 24),
      retrievedAt: null,
      storageCharge: null,
      storedBy: "u-agent",
    },
    {
      id: "pkg-3",
      trackingNumber: "PKG-1003",
      customerName: "Priya Nair",
      size: "LARGE",
      lockerId: "lk-l-1",
      pickupCode: "305881",
      storedAt: hoursAgo(12 * 24),
      retrievedAt: null,
      storageCharge: null,
      storedBy: "u-agent",
    },
  ];

  for (const pkg of packages) {
    const locker = lockers.find((l) => l.id === pkg.lockerId);
    if (locker) {
      locker.status = "OCCUPIED";
      locker.packageId = pkg.id;
    }
  }

  return { users, lockers, packages };
}

function persist(db: Database): void {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

let cache: Database | null = null;

export function db(): Database {
  if (!cache) {
    if (!existsSync(DATA_FILE)) {
      cache = seed();
      persist(cache);
    } else {
      cache = JSON.parse(readFileSync(DATA_FILE, "utf8")) as Database;
    }
  }
  return cache;
}

export function save(): void {
  persist(db());
}

export function nextLockerCode(size: Locker["size"]): string {
  const prefix = size[0];
  const nums = db()
    .lockers.filter((l) => l.size === size)
    .map((l) => Number(l.code.split("-")[1] ?? 0));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}-${String(next).padStart(2, "0")}`;
}

export function uniquePickupCode(): string {
  let code = "";
  do {
    code = String(Math.floor(100000 + Math.random() * 900000));
  } while (db().packages.some((p) => !p.retrievedAt && p.pickupCode === code));
  return code;
}

export function nextTracking(): string {
  const n = db().packages.length + 1001;
  return `PKG-${n}`;
}
