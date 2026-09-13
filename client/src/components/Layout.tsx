import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth";

export function Layout() {
  const { user, logout } = useAuth();
  const agent = user?.role === "AGENT";

  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">
          <span className="mark">E.</span>
          <div>
            <strong>Smart Locker</strong>
            <small>Everest station</small>
          </div>
        </div>
        <nav className="nav">
          {agent ? (
            <>
              <NavLink to="/" end>
                Lockers
              </NavLink>
              <NavLink to="/store">Store package</NavLink>
              <NavLink to="/history">History</NavLink>
            </>
          ) : (
            <NavLink to="/" end>
              Pickup
            </NavLink>
          )}
        </nav>
        <div className="who">
          <strong>{user?.name}</strong>
          <span>{agent ? "Delivery agent" : "Customer"}</span>
          <button type="button" onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
