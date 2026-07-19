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
};

export function useOrgUsers() {
  return useSyncExternalStore(usersStore.subscribe, usersStore.getSnapshot, usersStore.getServerSnapshot);
}
