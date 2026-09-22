import { useMutation } from "@apollo/client";
import { useState, type FormEvent } from "react";
import { LOCKERS, PACKAGES, STORE } from "../graphql";

export function StorePage() {
  const [store, { loading }] = useMutation(STORE, { refetchQueries: [LOCKERS, PACKAGES] });
  const [customerName, setCustomerName] = useState("");
  const [size, setSize] = useState("SMALL");
  const [result, setResult] = useState<{
    pickupCode: string;
    locker: { code: string; size: string };
    package: { trackingNumber: string; customerName: string };
  } | null>(null);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setResult(null);
    try {
      const response = await store({ variables: { customerName, size } });
      setResult(response.data.storePackage);
      setCustomerName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not store package");
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Store a package</h1>
          <p>The system assigns the smallest free locker that can hold this size.</p>
        </div>
      </div>
      <div className="grid split">
        <form className="card form" onSubmit={onSubmit}>
          <label>
            Customer name
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Maya Chen"
              required
            />
          </label>
          <label>
            Package size
            <select value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="SMALL">Small — fits S, M, R, or L</option>
              <option value="MEDIUM">Medium — fits M, R, or L</option>
              <option value="REGULAR">Regular — fits R or L</option>
              <option value="LARGE">Large — L only</option>
            </select>
          </label>
          {error && <p className="error">{error}</p>}
          <button className="primary" type="submit" disabled={loading}>
            {loading ? "Assigning locker…" : "Assign locker"}
          </button>
        </form>
        {result && (
          <article className="card receipt">
            <span className="badge gold">Stored</span>
            <h2>Share this with the customer</h2>
            <p>
              {result.package.customerName} · {result.package.trackingNumber}
            </p>
            <div className="pin-box">
              <div>
                <small>Locker</small>
                <strong>{result.locker.code}</strong>
              </div>
              <div>
                <small>Pickup code</small>
                <strong className="mono">{result.pickupCode}</strong>
              </div>
            </div>
            <p className="meta">
              Assigned to a {result.locker.size.toLowerCase()} locker. In a real station this code
              would be sent by SMS or email.
            </p>
          </article>
        )}
      </div>
    </>
  );
}
