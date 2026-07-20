"use client";

import { useSyncExternalStore } from "react";
import { mockArchitects, type Architect } from "@/lib/mock/architects";

const STORAGE_KEY = "modusys.architects.v1";

// Unlike Customers (which layers new fields over a pre-existing pipeline
// Customer type via a separate overrides store), Architect is a brand-new
// entity with no prior shape to preserve — so one plain array holding
// full records (seed + created + edited, soft-deleted via a flag) is enough.
let architects: Architect[] = mockArchitects;
// Cached, referentially-stable "visible" (non-deleted) list — recomputed
// only on mutation. useSyncExternalStore requires getSnapshot to return the
// *same* reference when nothing changed; filtering inline in the hook on
// every call breaks that contract and causes an infinite re-render loop.
let visible: Architect[] = mockArchitects;
let hydrated = false;
const listeners = new Set<() => void>();

function recompute() {
  visible = architects.filter((a) => !a.deleted);
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(architects));
  } catch {
    // ignore write failures
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) architects = JSON.parse(stored) as Architect[];
  } catch {
    // ignore parse failures, keep seed
  }
  recompute();
}

export type NewArchitectInput = Omit<Architect, "id" | "createdAt">;

export const architectsStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    ensureHydrated();
    return visible;
  },
  getServerSnapshot() {
    return mockArchitects;
  },
  createArchitect(input: NewArchitectInput) {
    ensureHydrated();
    const architect: Architect = { ...input, id: `arch-new-${Date.now()}`, createdAt: new Date().toISOString() };
    architects = [...architects, architect];
    recompute();
    persist();
    emit();
    return architect;
  },
  updateArchitect(id: string, fields: Partial<Architect>) {
    ensureHydrated();
    architects = architects.map((a) => (a.id === id ? { ...a, ...fields } : a));
    recompute();
    persist();
    emit();
  },
  // Soft delete via a flag on the record itself (no separate base/created
  // split to protect here) — restorable within the Undo toast window.
  deleteArchitect(id: string) {
    ensureHydrated();
    architects = architects.map((a) => (a.id === id ? { ...a, deleted: true } : a));
    recompute();
    persist();
    emit();
  },
  restoreArchitect(id: string) {
    ensureHydrated();
    architects = architects.map((a) => (a.id === id ? { ...a, deleted: false } : a));
    recompute();
    persist();
    emit();
  },
};

export function useArchitects() {
  return useSyncExternalStore(
    architectsStore.subscribe,
    architectsStore.getSnapshot,
    architectsStore.getServerSnapshot
  );
}
