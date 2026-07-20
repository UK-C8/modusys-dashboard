// TODO: replace with real auth (Phase B3 / NestJS + JWT) before production.
// No backend, no real per-user password check — the shared dev password
// works for the original dev account AND any org roster email, so the
// Set Password / forced-change-on-next-login flows have something to sign
// in with and demo (there's no real per-user credential store yet).

import { mockUsers } from "@/lib/mock/users";

const DEV_ACCOUNT = {
  email: "modusys@gmail.com",
  password: "Modusys@2026",
};

export async function mockSignIn(email: string, password: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (password !== DEV_ACCOUNT.password) return false;
  return email === DEV_ACCOUNT.email || mockUsers.some((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function mockSignUp(): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return true;
}
