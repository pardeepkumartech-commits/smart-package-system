import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { AuthUser, User } from "./types.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "smart-locker-demo-secret";

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signToken(user: User): string {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "12h" });
}

export function readToken(header?: string): AuthUser | null {
  if (!header) return null;
  const token = header.startsWith("Bearer ") ? header.slice(7) : header;
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export function requireAuth(user: AuthUser | null): AuthUser {
  if (!user) throw new Error("Please sign in first.");
  return user;
}

export function requireAgent(user: AuthUser | null): AuthUser {
  const authed = requireAuth(user);
  if (authed.role !== "AGENT") throw new Error("Only delivery agents can do this.");
  return authed;
}
