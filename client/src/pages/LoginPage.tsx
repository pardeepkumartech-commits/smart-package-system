import { useMutation } from "@apollo/client";
import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth";
import { LOGIN } from "../graphql";

const DEMOS = [
  { label: "Delivery agent", email: "agent@locker.test", password: "locker-demo" },
  { label: "Customer / pickup kiosk", email: "customer@locker.test", password: "locker-demo" },
];

export function LoginPage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("agent@locker.test");
  const [password, setPassword] = useState("locker-demo");
  const [loginMut, { loading, error }] = useMutation(LOGIN);

  if (user) return <Navigate to="/" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const result = await loginMut({ variables: { email, password } });
    const session = result.data?.login;
    if (session) login(session.token, session.user);
  }

  return (
    <div className="login-wrap">
      <div className="card login-card">
        <section className="hero">
          <span className="badge gold">Coding challenge</span>
          <h1>Smart Package Locker</h1>
          <p>
            Delivery agents store packages in the smallest fitting locker. Customers pick them up
            with a locker ID and pickup code.
          </p>
          <div className="accounts">
            {DEMOS.map((demo) => (
              <button
                key={demo.email}
                type="button"
                onClick={() => {
                  setEmail(demo.email);
                  setPassword(demo.password);
                }}
              >
                {demo.label}
                <small className="mono">{demo.email}</small>
              </button>
            ))}
          </div>
        </section>
        <section className="panel-form">
          <h2>Sign in</h2>
          <form className="form" onSubmit={onSubmit}>
            <label>
              Email
              <input value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {error && <p className="error">{error.message}</p>}
            <button className="primary" type="submit" disabled={loading}>
              {loading ? "Checking…" : "Open station"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
