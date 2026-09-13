import { useMutation } from "@apollo/client";
import { useState, type FormEvent } from "react";
import { LOCKERS, PACKAGES, RETRIEVE } from "../graphql";

const SAMPLES = [
  { locker: "S-02", code: "482193", note: "Maya · 2 days" },
  { locker: "M-01", code: "719204", note: "Omar · 7 days" },
  { locker: "L-01", code: "305881", note: "Priya · 12 days" },
];

export function RetrievePage() {
  const [retrieve, { loading }] = useMutation(RETRIEVE, { refetchQueries: [LOCKERS, PACKAGES] });
  const [lockerCode, setLockerCode] = useState("");
  const [pickupCode, setPickupCode] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    daysStored: number;
    storageCharge: number;
    locker: { code: string };
    package: { trackingNumber: string; customerName: string };
    breakdown: { label: string; days: number; rate: number; amount: number }[];
  } | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setResult(null);
    try {
      const response = await retrieve({ variables: { lockerCode, pickupCode } });
      setResult(response.data.retrievePackage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pickup failed");
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Pick up your package</h1>
          <p>
            Enter the locker ID and pickup code you were sent. You cannot see other customers’
            lockers or packages.
          </p>
        </div>
      </div>
      <div className="grid split">
        <form className="card form" onSubmit={onSubmit}>
          <label>
            Locker ID
            <input
              value={lockerCode}
              onChange={(e) => setLockerCode(e.target.value)}
              placeholder="S-02"
              required
            />
          </label>
          <label>
            Pickup code
            <input
              value={pickupCode}
              onChange={(e) => setPickupCode(e.target.value)}
              placeholder="482193"
              required
            />
          </label>
          <p className="meta">Demo only — fill a seeded pickup so you can try the flow:</p>
          <div className="chips">
            {SAMPLES.map((sample) => (
              <button
                key={sample.locker}
                type="button"
                className="ghost"
                onClick={() => {
                  setLockerCode(sample.locker);
                  setPickupCode(sample.code);
                }}
              >
                {sample.note}
              </button>
            ))}
          </div>
          {error && <p className="error">{error}</p>}
          <button className="primary" type="submit" disabled={loading}>
            {loading ? "Opening locker…" : "Open locker"}
          </button>
        </form>
        {result && (
          <article className="card receipt">
            <span className="badge gold">Locker {result.locker.code} opened</span>
            <h2>{result.package.customerName}</h2>
            <p>{result.package.trackingNumber}</p>
            <p className="charge">{result.storageCharge} units</p>
            <p className="meta">{result.daysStored} day(s) in locker · locker is free again</p>
            <table>
              <tbody>
                {result.breakdown.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td>
                      {row.days}d × {row.rate}
                    </td>
                    <td>{row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        )}
      </div>
    </>
  );
}
