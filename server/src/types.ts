export type Role = "AGENT" | "CUSTOMER";
export type Size = "SMALL" | "MEDIUM" | "LARGE";
export type LockerStatus = "AVAILABLE" | "OCCUPIED";
export type PackageStatus = "STORED" | "RETRIEVED";

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: Role;
}

export interface AuthUser {
  id: string;
  role: Role;
}

export interface Locker {
  id: string;
  code: string;
  size: Size;
  status: LockerStatus;
  packageId: string | null;
}

export interface PackageRecord {
  id: string;
  trackingNumber: string;
  customerName: string;
  size: Size;
  lockerId: string;
  pickupCode: string;
  storedAt: string;
  retrievedAt: string | null;
  storageCharge: number | null;
  storedBy: string;
}

export interface Database {
  users: User[];
  lockers: Locker[];
  packages: PackageRecord[];
}
