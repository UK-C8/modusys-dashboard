import { mockUsers } from "@/lib/mock/users";

// Single source of truth for "who's logged in" — no real auth yet (Phase B3),
// so everything that previously hardcoded its own copy (chat, tasks, navbar)
// should import from here instead.
export const CURRENT_USER_ID = "u1";

export function getCurrentUser() {
  return mockUsers.find((u) => u.id === CURRENT_USER_ID)!;
}
