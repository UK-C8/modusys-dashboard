"use client";

import { useSyncExternalStore } from "react";
import { mockUsers, type OrgUser } from "@/lib/mock/users";
import type { RoleKey } from "@/lib/constants/roles";

const STORAGE_KEY = "modusys.users";

function loadInitial(): OrgUser[] {
  if (typeof window === "undefined") return mockUsers;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as OrgUser[]) : mockUsers;
  } catch {
    return mockUsers;
  }
}

let users: OrgUser[] = mockUsers;
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch {
    // ignore write failures
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  users = loadInitial();
  hydrated = true;
}

export const usersStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    ensureHydrated();
    return users;
  },
  getServerSnapshot() {
    return mockUsers;
  },
  // TODO: replace with a real POST /users/invite call (Phase B3).
  inviteUser(input: { name: string; email: string; role: RoleKey }) {
    ensureHydrated();
    users = [
      ...users,
      { id: `user-${Date.now()}`, name: input.name, email: input.email, status: "invited", role: input.role, lastActive: new Date().toISOString() },
    ];
    persist();
    emit();
  },
  // TODO: replace with a real PATCH /users/:id/role call (Phase B3).
  assignRole(userId: string, role: RoleKey) {
    ensureHydrated();
    users = users.map((u) => (u.id === userId ? { ...u, role } : u));
    persist();
    emit();
  },
  // TODO: real PATCH /users/:id/password call, distinct from the general
  // user-update route so it can carry stricter rate-limiting/role checks
  // (Phase B3). The password value itself is never stored here — this mock
  // only records that a change happened and whether it forces a re-set.
  setPassword(userId: string, mustChangePassword: boolean) {
    ensureHydrated();
    users = users.map((u) =>
      u.id === userId ? { ...u, mustChangePassword, passwordUpdatedAt: new Date().toISOString() } : u
    );
    persist();
    emit();
  },
  clearMustChangePassword(userId: string) {
    ensureHydrated();
    users = users.map((u) => (u.id === userId ? { ...u, mustChangePassword: false } : u));
    persist();
    emit();
  },
  isEmailTaken(email: string, excludeUserId?: string) {
    ensureHydrated();
    return users.some((u) => u.id !== excludeUserId && u.email.toLowerCase() === email.trim().toLowerCase());
  },
  // TODO: replace with a real PATCH /users/:id call (Phase B3).
  updateUser(userId: string, fields: { name: string; email: string }) {
    ensureHydrated();
    users = users.map((u) => (u.id === userId ? { ...u, name: fields.name, email: fields.email } : u));
    persist();
    emit();
  },
};

export function useOrgUsers() {
  return useSyncExternalStore(usersStore.subscribe, usersStore.getSnapshot, usersStore.getServerSnapshot);
}
