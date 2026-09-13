import { useMutation, useQuery } from "@apollo/client";
import { useAuth } from "../auth";
import { CREATE_LOCKER, LOCKERS } from "../graphql";

export function LockersPage() {
  const { user } = useAuth();
  const query = useQuery(LOCKERS);
  const [createLocker] = useMutation(CREATE_LOCKER, { refetchQueries: [LOCKERS] });
  const stats = query.data?.stationStats;
  const agent = user?.role === "AGENT";

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Locker wall</h1>
          <p>Each door holds one package. Occupied lockers show the recipient and pickup code.</p>
        </div>
        {agent && (
          <div className="row-actions">
            {(["SMALL", "MEDIUM", "LARGE"] as const).map((size) => (
              <button
                key={size}
                className="ghost"
                type="button"
                onClick={() => void createLocker({ variables: { size } })}
              >
                Add {size.toLowerCase()}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="grid stats">
        <Stat label="Total lockers" value={stats?.total} />
        <Stat label="Available" value={stats?.available} />
        <Stat label="Occupied" value={stats?.occupied} />
        <Stat label="Free S / M / L" value={`${stats?.smallAvailable ?? 0} / ${stats?.mediumAvailable ?? 0} / ${stats?.largeAvailable ?? 0}`} />
      </div>
      <div className="locker-wall">
        {query.data?.lockers.map((locker: LockerCard) => (
          <article
            key={locker.id}
            className={`locker ${locker.status === "OCCUPIED" ? "busy" : "free"} ${locker.size.toLowerCase()}`}
          >
            <div className="door">
              <span className="code">{locker.code}</span>
              <span className="badge">{locker.size}</span>
            </div>
            {locker.package ? (
              <div className="slot">
                <strong>{locker.package.customerName}</strong>
                <p>{locker.package.trackingNumber}</p>
                {agent && locker.package.pickupCode && (
                  <p className="mono pin">Code {locker.package.pickupCode}</p>
                )}
                <p className="meta">
                  {locker.package.daysStored}d · {locker.package.estimatedCharge} units
                </p>
              </div>
            ) : (
              <div className="slot empty">Available</div>
            )}
          </article>
        ))}
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <article className="card stat">
      <div className="label">{label}</div>
      <div className="value">{value ?? "—"}</div>
    </article>
  );
}

interface LockerCard {
  id: string;
  code: string;
  size: "SMALL" | "MEDIUM" | "LARGE";
  status: "AVAILABLE" | "OCCUPIED";
  package: {
    customerName: string;
    trackingNumber: string;
    pickupCode: string | null;
    daysStored: number;
    estimatedCharge: number;
  } | null;
}
