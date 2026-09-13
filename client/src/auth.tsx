import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Role = "AGENT" | "CUSTOMER";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface AuthContextValue {
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("locker-user");
    return raw ? (JSON.parse(raw) as User) : null;
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login: (token, nextUser) => {
        localStorage.setItem("locker-token", token);
        localStorage.setItem("locker-user", JSON.stringify(nextUser));
        setUser(nextUser);
      },
      logout: () => {
        localStorage.removeItem("locker-token");
        localStorage.removeItem("locker-user");
        setUser(null);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthProvider missing");
  return ctx;
}
