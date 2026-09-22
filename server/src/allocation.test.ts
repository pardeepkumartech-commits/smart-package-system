import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assignLocker, canFit } from "./allocation.js";
import type { Locker } from "./types.js";

function locker(code: string, size: Locker["size"], status: Locker["status"] = "AVAILABLE"): Locker {
  return { id: code, code, size, status, packageId: null };
}

describe("locker fit", () => {
  it("lets a small package use any size", () => {
    assert.equal(canFit("SMALL", "SMALL"), true);
    assert.equal(canFit("MEDIUM", "SMALL"), true);
    assert.equal(canFit("LARGE", "SMALL"), true);
  });

  it("lets a regular package use regular or large only", () => {
    assert.equal(canFit("SMALL", "REGULAR"), false);
    assert.equal(canFit("MEDIUM", "REGULAR"), false);
    assert.equal(canFit("REGULAR", "REGULAR"), true);
    assert.equal(canFit("LARGE", "REGULAR"), true);
  });
});

describe("smallest-fit assignment", () => {
  it("picks the smallest locker that fits", () => {
    const picked = assignLocker(
      [locker("L-01", "LARGE"), locker("S-01", "SMALL"), locker("M-01", "MEDIUM")],
      "SMALL"
    );
    assert.equal(picked?.code, "S-01");
  });

  it("skips occupied lockers", () => {
    const picked = assignLocker(
      [locker("S-01", "SMALL", "OCCUPIED"), locker("M-01", "MEDIUM")],
      "SMALL"
    );
    assert.equal(picked?.code, "M-01");
  });

  it("returns null when nothing fits", () => {
    const picked = assignLocker([locker("S-01", "SMALL"), locker("M-01", "MEDIUM")], "LARGE");
    assert.equal(picked, null);
  });
});
