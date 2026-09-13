import { useQuery } from "@apollo/client";
import { PACKAGES } from "../graphql";

export function HistoryPage() {
  const query = useQuery(PACKAGES);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Package history</h1>
          <p>Station log for delivery agents: stored packages, pickup codes, and charges.</p>
        </div>
      </div>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Tracking</th>
              <th>Customer</th>
              <th>Locker</th>
              <th>Size</th>
              <th>Code</th>
              <th>Days</th>
              <th>Charge</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {query.data?.packages.map((row: HistoryRow) => (
              <tr key={row.id}>
                <td className="mono">{row.trackingNumber}</td>
                <td>{row.customerName}</td>
                <td>{row.locker.code}</td>
                <td>{row.size}</td>
                <td className="mono">{row.pickupCode ?? "—"}</td>
                <td>{row.daysStored}</td>
                <td>{row.storageCharge ?? row.estimatedCharge}</td>
                <td>
                  <span className={`badge ${row.status === "STORED" ? "gold" : "ok"}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

interface HistoryRow {
  id: string;
  trackingNumber: string;
  customerName: string;
  size: string;
  pickupCode: string | null;
  daysStored: number;
  estimatedCharge: number;
  storageCharge: number | null;
  status: "STORED" | "RETRIEVED";
  locker: { code: string };
}
