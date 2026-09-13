import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth";
import { Layout } from "./components/Layout";
import { HistoryPage } from "./pages/HistoryPage";
import { LockersPage } from "./pages/LockersPage";
import { LoginPage } from "./pages/LoginPage";
import { RetrievePage } from "./pages/RetrievePage";
import { StorePage } from "./pages/StorePage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/retrieve" element={<RetrievePage />} />
        <Route element={<AgentOnly />}>
          <Route path="/lockers" element={<LockersPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function RequireAuth() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Layout />;
}

function HomePage() {
  const { user } = useAuth();
  return user?.role === "AGENT" ? <LockersPage /> : <RetrievePage />;
}

function AgentOnly() {
  const { user } = useAuth();
  if (user?.role !== "AGENT") return <Navigate to="/" replace />;
  return <Outlet />;
}
