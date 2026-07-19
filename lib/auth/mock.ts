// TODO: replace with real auth (Phase B3 / NestJS + JWT) before production.
// Single hardcoded dev account — no backend, no session persistence.

const DEV_ACCOUNT = {
  email: "modusys@gmail.com",
  password: "Modusys@2026",
};

export async function mockSignIn(email: string, password: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return email === DEV_ACCOUNT.email && password === DEV_ACCOUNT.password;
}

export async function mockSignUp(): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return true;
}
