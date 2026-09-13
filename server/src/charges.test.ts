import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateCharge, daysStored } from "./charges.js";

describe("storage charges", () => {
  it("charges X per day for the first 5 days", () => {
    assert.equal(calculateCharge(1), 10);
    assert.equal(calculateCharge(5), 50);
  });

  it("charges 2X for days 6-10", () => {
    assert.equal(calculateCharge(7), 50 + 40);
  });

  it("charges 3X after day 10", () => {
    assert.equal(calculateCharge(12), 50 + 100 + 60);
  });

  it("counts a started 24-hour period as a day", () => {
    const stored = new Date("2026-09-01T10:00:00.000Z");
    const now = new Date("2026-09-03T10:00:01.000Z");
    assert.equal(daysStored(stored.toISOString(), now), 3);
  });
});
