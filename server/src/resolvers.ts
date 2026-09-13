import { randomUUID } from "node:crypto";
import { GraphQLError } from "graphql";
import { assignLocker } from "./allocation.js";
import { requireAgent, requireAuth, signToken, verifyPassword } from "./auth.js";
import { calculateCharge, chargeBreakdown, daysStored } from "./charges.js";
import { withLock } from "./lock.js";
import { db, nextLockerCode, nextTracking, save, uniquePickupCode } from "./store.js";
import type { AuthUser, Locker, PackageRecord, Size } from "./types.js";

export interface Context {
  user: AuthUser | null;
}

function fail(message: string, code = "BAD_USER_INPUT"): never {
  throw new GraphQLError(message, { extensions: { code } });
}

function lockerView(locker: Locker, viewer: AuthUser | null) {
  const pkg = locker.packageId ? db().packages.find((p) => p.id === locker.packageId) : null;
  return {
    ...locker,
    package: pkg ? packageView(pkg, viewer) : null,
  };
}

function packageView(pkg: PackageRecord, viewer: AuthUser | null) {
  const locker = db().lockers.find((l) => l.id === pkg.lockerId);
  if (!locker) fail("Locker missing for package.");
  const days = daysStored(pkg.storedAt, pkg.retrievedAt ? new Date(pkg.retrievedAt) : new Date());
  return {
    ...pkg,
    pickupCode: viewer?.role === "AGENT" ? pkg.pickupCode : null,
    locker: { ...locker, package: null },
    daysStored: days,
    estimatedCharge: pkg.storageCharge ?? calculateCharge(days),
    status: pkg.retrievedAt ? "RETRIEVED" : "STORED",
  };
}

export const resolvers = {
  Query: {
    me: (_: unknown, __: unknown, ctx: Context) => {
      if (!ctx.user) return null;
      return db().users.find((u) => u.id === ctx.user?.id) ?? null;
    },
    lockers: (_: unknown, __: unknown, ctx: Context) => {
      requireAgent(ctx.user);
      return db()
        .lockers.slice()
        .sort((a, b) => a.code.localeCompare(b.code))
        .map((l) => lockerView(l, ctx.user));
    },
    packages: (_: unknown, __: unknown, ctx: Context) => {
      requireAgent(ctx.user);
      return db()
        .packages.slice()
        .sort((a, b) => b.storedAt.localeCompare(a.storedAt))
        .map((p) => packageView(p, ctx.user));
    },
    stationStats: (_: unknown, __: unknown, ctx: Context) => {
      requireAgent(ctx.user);
      const lockers = db().lockers;
      const available = lockers.filter((l) => l.status === "AVAILABLE");
      return {
        total: lockers.length,
        available: available.length,
        occupied: lockers.length - available.length,
        smallAvailable: available.filter((l) => l.size === "SMALL").length,
        mediumAvailable: available.filter((l) => l.size === "MEDIUM").length,
        largeAvailable: available.filter((l) => l.size === "LARGE").length,
      };
    },
  },

  Mutation: {
    login: (_: unknown, args: { email: string; password: string }) => {
      const user = db().users.find((u) => u.email.toLowerCase() === args.email.trim().toLowerCase());
      if (!user || !verifyPassword(args.password, user.passwordHash)) {
        fail("Invalid email or password.", "UNAUTHENTICATED");
      }
      return { token: signToken(user), user };
    },

    createLocker: (_: unknown, args: { size: Size }, ctx: Context) => {
      requireAgent(ctx.user);
      const locker: Locker = {
        id: randomUUID(),
        code: nextLockerCode(args.size),
        size: args.size,
        status: "AVAILABLE",
        packageId: null,
      };
      db().lockers.push(locker);
      save();
      return lockerView(locker, ctx.user);
    },

    storePackage: (_: unknown, args: { customerName: string; size: Size }, ctx: Context) =>
      withLock(() => {
        const agent = requireAgent(ctx.user);
        const name = args.customerName.trim();
        if (!name) fail("Customer name is required.");

        const locker = assignLocker(db().lockers, args.size);
        if (!locker) {
          fail(`No suitable locker is available for a ${args.size.toLowerCase()} package.`);
        }

        const pkg: PackageRecord = {
          id: randomUUID(),
          trackingNumber: nextTracking(),
          customerName: name,
          size: args.size,
          lockerId: locker.id,
          pickupCode: uniquePickupCode(),
          storedAt: new Date().toISOString(),
          retrievedAt: null,
          storageCharge: null,
          storedBy: agent.id,
        };

        locker.status = "OCCUPIED";
        locker.packageId = pkg.id;
        db().packages.push(pkg);
        save();

        return {
          package: packageView(pkg, ctx.user),
          locker: lockerView(locker, ctx.user),
          pickupCode: pkg.pickupCode,
        };
      }),

    retrievePackage: (
      _: unknown,
      args: { lockerCode: string; pickupCode: string },
      ctx: Context
    ) => {
      requireAuth(ctx.user);
      const code = args.lockerCode.trim().toUpperCase();
      const pin = args.pickupCode.trim();
      const locker = db().lockers.find((l) => l.code.toUpperCase() === code);
      if (!locker) fail("Locker not found. Check the locker ID.");
      if (locker.status !== "OCCUPIED" || !locker.packageId) {
        fail("This locker is empty. Nothing to retrieve.");
      }
      const pkg = db().packages.find((p) => p.id === locker.packageId);
      if (!pkg || pkg.retrievedAt) fail("This locker is empty. Nothing to retrieve.");
      if (pkg.pickupCode !== pin) fail("Pickup code does not match this locker.");

      const days = daysStored(pkg.storedAt);
      const charge = calculateCharge(days);
      pkg.retrievedAt = new Date().toISOString();
      pkg.storageCharge = charge;
      locker.status = "AVAILABLE";
      locker.packageId = null;
      save();

      return {
        package: packageView(pkg, ctx.user),
        locker: lockerView(locker, ctx.user),
        daysStored: days,
        storageCharge: charge,
        breakdown: chargeBreakdown(days),
      };
    },
  },
};
